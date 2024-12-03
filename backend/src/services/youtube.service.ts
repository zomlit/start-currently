import { google } from "googleapis";
import { prisma } from "../db";
import { broadcastChatMessage } from "./twitch.service";

export async function getYouTubeLiveChat(accessToken: string, videoId: string) {
  const youtube = google.youtube({
    version: "v3",
    auth: accessToken,
  });

  try {
    const response = await youtube.liveChatMessages.list({
      part: ["snippet", "authorDetails"],
      liveChatId: await getLiveChatId(youtube, videoId),
    });

    const messages = response.data.items;
    if (messages) {
      for (const message of messages) {
        const processedMessage = processYouTubeMessage(message);
        await saveChatMessage(processedMessage);
        broadcastChatMessage(processedMessage);
      }
    }

    return {
      success: true,
      message: "YouTube live chat retrieved successfully",
    };
  } catch (error) {
    console.error("Error fetching YouTube live chat:", error);
    return { success: false, error: "Failed to fetch YouTube live chat" };
  }
}

async function getLiveChatId(youtube: any, videoId: string) {
  const response = await youtube.videos.list({
    part: ["liveStreamingDetails"],
    id: [videoId],
  });

  return response.data.items[0].liveStreamingDetails.activeLiveChatId;
}

function processYouTubeMessage(message: any) {
  return {
    type: "chat_message",
    platform: "youtube",
    channel: message.snippet.liveChatId,
    username: message.authorDetails.displayName,
    message: message.snippet.displayMessage,
    color: "#FF0000", // YouTube red
    badges: [], // YouTube doesn't have badges in the same way as Twitch
    emotes: [], // Process YouTube emotes if needed
    userStatus: {
      isModerator: message.authorDetails.isChatModerator,
      isBroadcaster: message.authorDetails.isChatOwner,
    },
    avatar: message.authorDetails.profileImageUrl,
  };
}
