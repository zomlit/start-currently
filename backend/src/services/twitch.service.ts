import {
  getUserInfo,
  getTwitchAccessToken,
  twitchApiRequest,
  getGlobalBadges,
  getChannelBadges,
} from "./twitch-api.service";
import tmi from "tmi.js";
import { prisma } from "../db";
import { getIO } from "../socket";
import { Socket } from "socket.io";
import fetch from "node-fetch";
import logger from "../utils/logger";
import { clerkClient } from "@clerk/clerk-sdk-node";

type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

interface ProcessedMessage {
  type: string;
  channel: string;
  username: string;
  message: string;
  color: string;
  badges: {
    user: Badge[];
    global: Badge[];
    channel: Badge[];
  };
  emotes: Emote[];
  userStatus: UserStatus;
  avatar: string;
}

interface Badge {
  id: string;
  version: string;
  urls: {
    "1x": string;
    "2x": string;
    "4x": string;
  };
}

interface Emote {
  id: string;
  name: string;
  url: string;
  provider: "twitch" | "7tv" | "bttv";
  positions: [number, number][];
}

interface UserStatus {
  isFollower: boolean;
  isSubscriber: boolean;
  subscriptionTier?: string;
  isModerator: boolean;
  isBroadcaster: boolean;
}

interface BTTVEmote {
  id: string;
  code: string;
  imageType: string;
  userId: string;
}

interface SevenTVEmote {
  id?: string;
  name?: string;
  urls?: [number, string][];
}

let twitchClient: tmi.Client | null = null;
let currentChannel: string | null = null;
let isConnecting: boolean = false;
let reconnectAttempts: number = 0;
const MAX_RECONNECT_ATTEMPTS: number = 5;

let activeConnections: Socket[] = [];

function addSocketConnection(socket: Socket) {
  if (!activeConnections.includes(socket)) {
    activeConnections.push(socket);
    logger.info(
      `New Socket.IO connection added. Total connections: ${activeConnections.length}`
    );
  } else {
    logger.info(`Socket.IO connection already exists. Not adding duplicate.`);
  }
}

function removeSocketConnection(socket: Socket) {
  const index = activeConnections.indexOf(socket);
  if (index > -1) {
    activeConnections.splice(index, 1);
    logger.info(
      `Socket.IO connection removed. Total connections: ${activeConnections.length}`
    );
  } else {
    logger.info(`Socket.IO connection not found. Unable to remove.`);
  }
}

async function broadcastChatMessage(message: ProcessedMessage) {
  const messageString = JSON.stringify(message);
  const io = getIO();

  io.to(message.channel.replace("#", "")).emit("chat_message", message);

  try {
    const savedMessage = await prisma.chatMessage.create({
      data: {
        channel: message.channel,
        username: message.username,
        message: message.message,
        color: message.color,
        badges: message.badges as any,
        emotes: message.emotes as any,
        userStatus: message.userStatus as any,
        avatar: message.avatar,
      },
    });

    const messageCount = await prisma.chatMessage.count({
      where: {
        channel: message.channel,
        username: message.username,
      },
    });

    if (messageCount > 20) {
      const messagesToDelete = await prisma.chatMessage.findMany({
        where: {
          channel: message.channel,
          username: message.username,
        },
        orderBy: {
          timestamp: "asc",
        },
        take: messageCount - 20,
      });

      await prisma.chatMessage.deleteMany({
        where: {
          id: {
            in: messagesToDelete.map((msg) => msg.id),
          },
        },
      });
    }
  } catch (error) {
    logger.error("Error saving message to database:", error);
    if (error instanceof Error) {
      logger.error("Error name:", error.name);
      logger.error("Error message:", error.message);
      logger.error("Error stack:", error.stack);
    }
    logger.error("Full error object:", JSON.stringify(error, null, 2));
    logger.error("Message that failed to save:", messageString);
  }
}

type UserCommands = {
  c_name: string;
  c_command: string;
  c_roles: string;
  c_user_cooldown: number;
  c_global_cooldown: number;
  c_enabled: boolean;
};

interface Command {
  name: string;
  command: string;
  roles: string[];
  userCooldown: number;
  globalCooldown: number;
  enabled: boolean;
  lastUsed?: number;
  lastUsedBy?: { [userId: string]: number };
}

let commands: Command[] = [];
const COMMAND_REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

async function loadCommands(userId: string) {
  try {
    const dbCommands = await prisma.userCommands.findMany({
      where: { user_id: userId },
    });
    commands = dbCommands.map((cmd) => ({
      name: cmd.c_name,
      command: cmd.c_command,
      roles: cmd.c_roles.split(","),
      userCooldown: cmd.c_user_cooldown,
      globalCooldown: cmd.c_global_cooldown,
      enabled: cmd.c_enabled,
      lastUsed: 0,
      lastUsedBy: {},
    }));
    logger.info(`Loaded ${commands.length} commands for user ${userId}`);
  } catch (error) {
    logger.error("Error loading commands:", error);
  }
}

function setupMessageHandler(client: tmi.Client, userId: string) {
  let lastMessageTimestamp = 0;
  const messageDeduplicationInterval = 100; // milliseconds

  client.on(
    "message",
    async (
      channel: string,
      tags: tmi.ChatUserstate,
      message: string,
      self: boolean
    ) => {
      if (self) return;

      const currentTimestamp = Date.now();
      if (
        currentTimestamp - lastMessageTimestamp <
        messageDeduplicationInterval
      ) {
        logger.info("Duplicate message detected. Skipping.");
        return;
      }

      lastMessageTimestamp = currentTimestamp;
      const processedMessage = await processMessageData(
        channel,
        tags,
        message,
        self
      );
      broadcastChatMessage(processedMessage);

      if (message.startsWith("!")) {
        handleCommand(client, channel, tags, message, userId);
      }
    }
  );
}

async function handleCommand(
  client: tmi.Client,
  channel: string,
  tags: tmi.ChatUserstate,
  message: string,
  userId: string
) {
  const commandName = message.split(" ")[0].slice(1).toLowerCase();

  if (commandName === "test") {
    client.say(channel, "Bot is responsive and working!");
    return;
  }

  const command = commands.find(
    (cmd) => cmd.name.toLowerCase() === commandName
  );
  if (!command || !command.enabled) return;

  const now = Date.now();
  const userIdStr = tags["user-id"] || "";

  if (now - command.lastUsed! < command.globalCooldown * 1000) return;

  if (
    command.lastUsedBy![userIdStr] &&
    now - command.lastUsedBy![userIdStr] < command.userCooldown * 1000
  )
    return;

  const userRoles = [
    tags.badges?.broadcaster ? "broadcaster" : "",
    tags.mod ? "moderator" : "",
    tags.subscriber ? "subscriber" : "",
    "viewer",
  ].filter(Boolean);

  if (!command.roles.some((role) => userRoles.includes(role))) return;

  client.say(channel, command.command);

  command.lastUsed = now;
  command.lastUsedBy![userIdStr] = now;
}

async function getTwitchAccessTokenFromClerk(userId: string): Promise<string> {
  try {
    const user = await clerkClient.users.getUser(userId);
    const twitchAccount = user.externalAccounts.find(
      (account) => account.provider === "twitch"
    ) as any;

    if (!twitchAccount || !twitchAccount.accessToken) {
      throw new Error("No Twitch account linked or no access token available");
    }

    return twitchAccount.accessToken;
  } catch (error) {
    logger.error("Error getting Twitch access token from Clerk:", {
      error: error instanceof Error ? error.message : String(error),
      name: error instanceof Error ? error.name : "Unknown",
      stack: error instanceof Error ? error.stack : "No stack trace",
    });
    throw error;
  }
}

async function connectToTwitchChat(
  channel: string,
  userId: string,
  twitchAccessToken: string,
  clerkSessionId: string
) {
  if (!twitchAccessToken) {
    logger.error(`Twitch Access Token is missing for user ${userId}`);
    throw new Error("Twitch Access Token is required");
  }

  logger.info(
    `Attempting to connect to Twitch chat for channel: ${channel}, userId: ${userId}`
  );
  logger.info(`Twitch Access Token length: ${twitchAccessToken.length}`);

  if (typeof channel !== "string") {
    throw new Error("Invalid channel format");
  }

  while (isConnecting) {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  isConnecting = true;

  try {
    const profile = await prisma.profile.findFirst({
      where: {
        user_id: userId,
        widgetType: "chat",
        is_current: true,
      },
      select: { specificSettings: true },
    });

    if (!profile || !profile.specificSettings) {
      throw new Error("Profile or specific settings not found");
    }

    const settings = profile.specificSettings as {
      selectedUsername: string;
      broadcastChannel: string;
    };

    logger.info(`Using username: ${settings.selectedUsername}`);
    logger.info(`Broadcast channel: ${settings.broadcastChannel}`);

    // Get Twitch access token from Clerk
    // const twitchAccessToken = await getTwitchAccessTokenFromClerk(userId);
    const twitchAccessToken = await getTwitchAccessToken();

    if (!twitchClient) {
      twitchClient = new tmi.Client({
        options: { debug: true },
        connection: {
          reconnect: true,
          secure: true,
        },
        identity: {
          username: settings.selectedUsername,
          password: `oauth:${twitchAccessToken}`,
        },
        channels: [settings.broadcastChannel],
      });

      twitchClient.on("connecting", (address, port) => {
        logger.info(`Connecting to ${address}:${port}`);
      });

      twitchClient.on("connected", (address, port) => {
        logger.info(`Connected to ${address}:${port}`);
        currentChannel = settings.broadcastChannel;
        reconnectAttempts = 0;
      });

      twitchClient.on("disconnected", (reason) => {
        logger.info(`Disconnected: ${reason}`);
        if (currentChannel === settings.broadcastChannel) {
          handleReconnect(
            settings.broadcastChannel,
            userId,
            clerkSessionId,
            twitchAccessToken
          );
        }
      });

      setupMessageHandler(twitchClient, userId);
      await loadCommands(userId);

      setInterval(() => loadCommands(userId), COMMAND_REFRESH_INTERVAL);
    } else {
      (twitchClient as any).opts.identity.username = settings.selectedUsername;
      (
        twitchClient as any
      ).opts.identity.password = `oauth:${twitchAccessToken}`;
    }

    logger.info(
      `Connecting to Twitch chat for channel: ${settings.broadcastChannel}`
    );
    try {
      await twitchClient.connect();
    } catch (connectError) {
      logger.error(`Error connecting to Twitch chat for channel ${channel}:`, {
        error:
          connectError instanceof Error
            ? connectError.message
            : String(connectError),
        name: connectError instanceof Error ? connectError.name : "Unknown",
        stack:
          connectError instanceof Error ? connectError.stack : "No stack trace",
        channel,
        userId,
        twitchAccessTokenLength: twitchAccessToken.length,
      });
      throw connectError;
    }

    if (currentChannel !== settings.broadcastChannel) {
      if (currentChannel) {
        await twitchClient.part(currentChannel);
      }
      await twitchClient.join(settings.broadcastChannel);
      currentChannel = settings.broadcastChannel;
    }

    logger.info(
      `Successfully connected to Twitch chat for channel: ${settings.broadcastChannel}`
    );
  } catch (error) {
    logger.error(`Error connecting to Twitch chat for channel ${channel}:`, {
      error: error instanceof Error ? error.message : String(error),
      name: error instanceof Error ? error.name : "Unknown",
      stack: error instanceof Error ? error.stack : "No stack trace",
      channel,
      userId,
      twitchAccessTokenLength: twitchAccessToken.length,
    });
    if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      handleReconnect(channel, userId, clerkSessionId, twitchAccessToken);
    } else {
      logger.error("Max reconnection attempts reached. Giving up.");
      twitchClient = null;
      currentChannel = null;
      reconnectAttempts = 0;
    }
    throw error; // Re-throw the error to be caught by the caller
  } finally {
    isConnecting = false;
  }
}

async function handleReconnect(
  channel: string,
  userId: string,
  clerkSessionId: string,
  twitchAccessToken: string
) {
  reconnectAttempts++;
  logger.info(
    `Attempting to reconnect (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})...`
  );
  if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
    try {
      await connectToTwitchChat(
        channel,
        userId,
        twitchAccessToken,
        clerkSessionId
      );
    } catch (error) {
      logger.error(`Reconnection attempt ${reconnectAttempts} failed:`, error);
      if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        setTimeout(
          () =>
            handleReconnect(channel, userId, clerkSessionId, twitchAccessToken),
          5000 * reconnectAttempts
        );
      } else {
        logger.error("Max reconnection attempts reached. Giving up.");
        twitchClient = null;
        currentChannel = null;
        reconnectAttempts = 0;
      }
    }
  } else {
    logger.error("Max reconnection attempts reached. Giving up.");
    twitchClient = null;
    currentChannel = null;
    reconnectAttempts = 0;
  }
}

async function disconnectTwitchChat() {
  if (twitchClient) {
    logger.info("Disconnecting from Twitch chat");
    try {
      if (twitchClient.readyState() === "OPEN") {
        await twitchClient.disconnect();
        logger.info("Successfully disconnected from Twitch chat");
      } else {
        logger.info("Twitch client already disconnected");
      }
    } catch (error) {
      logger.error("Error disconnecting from Twitch chat:", {
        error: error instanceof Error ? error.message : String(error),
        name: error instanceof Error ? error.name : "Unknown",
        stack: error instanceof Error ? error.stack : "No stack trace",
      });
    } finally {
      twitchClient = null;
      currentChannel = null;
      reconnectAttempts = 0;
    }
  } else {
    logger.info("No active Twitch client to disconnect");
  }
}

async function startTwitchSession(
  userId: string,
  twitchChannel: string,
  twitchAccessToken: string,
  clerkSessionId: string
) {
  try {
    logger.info(
      `Starting Twitch session for user ${userId}, channel: ${twitchChannel}`
    );
    const userInfo = await getUserInfo(twitchChannel);

    if (!userInfo) {
      logger.warn(`User ${twitchChannel} not found`);
      return {
        success: false,
        error: `Twitch user ${twitchChannel} not found`,
      };
    }

    const channelId = String(userInfo.id);
    await subscribeToEvents(channelId, userId);
    await initializeWebSocket(userId, twitchChannel, clerkSessionId);
    await connectToTwitchChat(
      twitchChannel,
      userId,
      twitchAccessToken,
      clerkSessionId
    );

    return { success: true, message: "Twitch session started successfully" };
  } catch (error) {
    logger.error("Error starting Twitch session:", {
      error: error instanceof Error ? error.message : String(error),
      name: error instanceof Error ? error.name : "Unknown",
      stack: error instanceof Error ? error.stack : "No stack trace",
    });
    let errorMessage = "Unknown error occurred while starting Twitch session";
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === "string") {
      errorMessage = error;
    }
    return {
      success: false,
      error: errorMessage,
    };
  }
}

function stopTwitchSession(userId: string) {
  logger.info(`Stopping Twitch session for user ${userId}`);
  // Implement unsubscribing from EventSub here
}

async function sendChatMessage(broadcasterId: string, message: string) {
  return twitchApiRequest("/chat/messages", "POST", {
    broadcaster_id: broadcasterId,
    message,
  });
}

async function processMessageData(
  channel: string,
  tags: tmi.ChatUserstate,
  message: string,
  self: boolean
): Promise<ProcessedMessage> {
  const userInfo = await getUserInfo(tags.username || "");
  const broadcasterInfo = await getUserInfo(channel.replace("#", ""));
  const userStatus: UserStatus = {
    isFollower: !!tags.badges?.follower,
    isSubscriber: !!tags.subscriber,
    subscriptionTier: tags.badges?.subscriber,
    isModerator: !!tags.mod,
    isBroadcaster: !!tags.badges?.broadcaster,
  };

  const bttvEmotes = await fetchBTTVEmotes(broadcasterInfo?.id || "");
  const sevenTVEmotes = await fetchSevenTVEmotes(broadcasterInfo?.id || "");

  const processedEmotes = processEmotes(
    tags.emotes,
    message,
    bttvEmotes,
    sevenTVEmotes
  );

  const [globalBadges, channelBadges] = await Promise.all([
    getGlobalBadges(),
    getChannelBadges(broadcasterInfo?.id || ""),
  ]);

  const userBadges = processBadges(
    tags.badges || {},
    globalBadges,
    channelBadges
  );

  return {
    type: "chat_message",
    channel: channel,
    username: tags["display-name"] || tags.username || "",
    message: message,
    color: tags.color || "#FFFFFF",
    badges: {
      user: userBadges,
      global: globalBadges,
      channel: channelBadges,
    },
    emotes: processedEmotes,
    userStatus,
    avatar: userInfo?.profile_image_url ?? "",
  };
}

function processBadges(
  badges: tmi.Badges,
  globalBadges: Badge[],
  channelBadges: Badge[]
): Badge[] {
  return Object.entries(badges || {}).map(([id, version]) => {
    const globalBadge = globalBadges.find(
      (b) => b.id === id && b.version === version
    );
    const channelBadge = channelBadges.find(
      (b) => b.id === id && b.version === version
    );
    const badge = globalBadge || channelBadge;

    if (badge) {
      return badge;
    } else {
      return {
        id,
        version: version as string,
        urls: {
          "1x": `https://static-cdn.jtvnw.net/badges/v1/${id}/${version}/1`,
          "2x": `https://static-cdn.jtvnw.net/badges/v1/${id}/${version}/2`,
          "4x": `https://static-cdn.jtvnw.net/badges/v1/${id}/${version}/3`,
        },
      };
    }
  });
}

function processEmotes(
  twitchEmotes: any,
  message: string,
  bttvEmotes: BTTVEmote[],
  sevenTVEmotes: SevenTVEmote[]
): Emote[] {
  const processedEmotes: Emote[] = [];

  for (const [id, positions] of Object.entries(twitchEmotes || {})) {
    const [start, end] = (positions as string[])[0].split("-").map(Number);
    const name = message.slice(start, end + 1);
    processedEmotes.push({
      id,
      name,
      url: `https://static-cdn.jtvnw.net/emoticons/v2/${id}/default/dark/3.0`,
      provider: "twitch",
      positions: [[start, end]],
    });
  }

  if (bttvEmotes && bttvEmotes.length > 0) {
    bttvEmotes.forEach((emote) => {
      const regex = new RegExp(`\\b${escapeRegExp(emote.code)}\\b`, "g");
      let match;
      while ((match = regex.exec(message)) !== null) {
        processedEmotes.push({
          id: emote.id,
          name: emote.code,
          url: `https://cdn.betterttv.net/emote/${emote.id}/3x`,
          provider: "bttv",
          positions: [[match.index, match.index + emote.code.length - 1]],
        });
      }
    });
  }

  if (sevenTVEmotes && sevenTVEmotes.length > 0) {
    sevenTVEmotes.forEach((emote) => {
      if (emote.name && emote.id) {
        const regex = new RegExp(`\\b${escapeRegExp(emote.name)}\\b`, "g");
        let match;
        while ((match = regex.exec(message)) !== null) {
          const url =
            emote.urls && emote.urls.length > 0
              ? emote.urls[emote.urls.length - 1][1]
              : `https://cdn.7tv.app/emote/${emote.id}/4x.webp`;
          processedEmotes.push({
            id: emote.id,
            name: emote.name,
            url,
            provider: "7tv",
            positions: [[match.index, match.index + emote.name.length - 1]],
          });
        }
      }
    });
  }

  return processedEmotes;
}

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function getLastMessages(channel: string): Promise<ProcessedMessage[]> {
  try {
    const messages = await prisma.chatMessage.findMany({
      where: { channel },
      orderBy: { timestamp: "desc" },
      take: 10,
    });

    const channelInfo = await getUserInfo(channel.replace("#", ""));
    if (!channelInfo) {
      logger.error(`Channel info not found for ${channel}`);
      return [];
    }

    const [globalBadges, channelBadges] = await Promise.all([
      getGlobalBadges(),
      getChannelBadges(channelInfo.id),
    ]);

    return messages.reverse().map((msg) => ({
      type: "chat_message",
      channel: msg.channel,
      username: msg.username,
      message: msg.message,
      color: msg.color,
      badges: {
        user: processBadges(msg.badges as any, globalBadges, channelBadges),
        global: globalBadges,
        channel: channelBadges,
      },
      emotes: msg.emotes as unknown as Emote[],
      userStatus: msg.userStatus as unknown as UserStatus,
      avatar: msg.avatar,
    }));
  } catch (error) {
    logger.error("Error fetching messages from database:", {
      error: error instanceof Error ? error.message : String(error),
      name: error instanceof Error ? error.name : "Unknown",
      stack: error instanceof Error ? error.stack : "No stack trace",
    });
    return [];
  }
}

async function fetchTwitchDataById(userId: string) {
  try {
    const userInfo = await getUserInfo(userId);
    if (!userInfo) {
      throw new Error(`User with ID ${userId} not found`);
    }
    return userInfo;
  } catch (error) {
    logger.error("Error fetching Twitch data by ID:", {
      error: error instanceof Error ? error.message : String(error),
      name: error instanceof Error ? error.name : "Unknown",
      stack: error instanceof Error ? error.stack : "No stack trace",
    });
    throw error;
  }
}

async function subscribeToEvents(
  channelId: string,
  userId: string
): Promise<void> {
  logger.info(
    `Subscribing to events for channel ${channelId} and user ${userId}`
  );
  // Implement event subscription logic here
}

async function initializeWebSocket(
  userId: string,
  twitchChannel: string,
  clerkSessionId: string
): Promise<void> {
  logger.info(
    `Initializing WebSocket for user ${userId}, channel ${twitchChannel}, and session ${clerkSessionId}`
  );
  // Implement WebSocket initialization logic here
}

async function fetchBTTVEmotes(channelId: string): Promise<BTTVEmote[]> {
  // Implement BTTV emote fetching logic here
  return [];
}

async function fetchSevenTVEmotes(channelId: string): Promise<SevenTVEmote[]> {
  // Implement 7TV emote fetching logic here
  return [];
}

// Keep only one export statement at the end of the file
export {
  getUserInfo,
  getTwitchAccessToken,
  twitchApiRequest,
  getGlobalBadges,
  getChannelBadges,
  addSocketConnection,
  removeSocketConnection,
  broadcastChatMessage,
  startTwitchSession,
  stopTwitchSession,
  sendChatMessage,
  getLastMessages,
  fetchTwitchDataById,
};
