import fetch from "node-fetch";
import { prisma } from "../db";

const TWITCH_API_BASE_URL = "https://api.twitch.tv/helix";

const CACHE_DURATION = 3600000; // 1 hour in milliseconds

export async function getTwitchAccessToken(): Promise<string> {
  const response = await fetch("https://id.twitch.tv/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: process.env.TWITCH_CLIENT_ID!,
      client_secret: process.env.TWITCH_CLIENT_SECRET!,
      grant_type: "client_credentials",
    }),
  });

  const data = (await response.json()) as { access_token: string };
  return data.access_token;
}

export async function twitchApiRequest(
  endpoint: string,
  method: string,
  data?: any
): Promise<any> {
  const accessToken = await getTwitchAccessToken();
  const url = `${TWITCH_API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      method,
      headers: {
        "Client-ID": process.env.TWITCH_CLIENT_ID!,
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(
        `Twitch API Error: ${response.status} ${response.statusText}`
      );
      console.error(`Error details: ${errorBody}`);
      console.error(`Request URL: ${url}`);
      console.error(`Request method: ${method}`);
      console.error(`Request data:`, data);
      throw new Error(
        `HTTP error! status: ${response.status}, details: ${errorBody}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Error in Twitch API request:", error);
    throw error;
  }
}

interface TwitchUserData {
  id: string;
  login: string;
  display_name: string;
  type: string;
  broadcaster_type: string;
  description: string;
  profile_image_url: string;
  offline_image_url: string;
  view_count: number;
  created_at: string;
}

export interface TwitchUserInfo {
  data?: TwitchUserData[];
}

export interface CachedTwitchUser {
  id: string;
  login: string;
  display_name: string;
  profile_image_url: string;
  broadcaster_type: string;
  description: string;
}

export async function getUserInfo(
  username: string
): Promise<TwitchUserInfo | null> {
  try {
    const cachedUser = await prisma.twitchUserCache.findUnique({
      where: { login: username },
    });

    if (cachedUser) {
      return {
        data: [
          {
            id: cachedUser.id,
            login: cachedUser.login,
            display_name: cachedUser.display_name,
            type: "",
            broadcaster_type: cachedUser.broadcaster_type,
            description: cachedUser.description,
            profile_image_url: cachedUser.profile_image_url,
            offline_image_url: "",
            view_count: 0,
            created_at: new Date().toISOString(),
          },
        ],
      };
    }

    const response = await twitchApiRequest(`/users?login=${username}`, "GET");
    if (response.data && response.data.length > 0) {
      const user = response.data[0];

      // Cache the user data
      await prisma.twitchUserCache.create({
        data: {
          id: user.id,
          login: user.login,
          display_name: user.display_name,
          profile_image_url: user.profile_image_url,
          broadcaster_type: user.broadcaster_type,
          description: user.description,
        },
      });

      return response;
    }

    console.warn(`User ${username} not found`);
    return null;
  } catch (error) {
    console.error(`Error fetching user info for ${username}:`, error);
    return null;
  }
}

export async function getStreamInfo(userId: string) {
  return twitchApiRequest(`/streams?user_id=${userId}`, "GET");
}

export async function sendChatMessage(broadcasterId: string, message: string) {
  return twitchApiRequest("/chat/messages", "POST", {
    broadcaster_id: broadcasterId,
    message,
  });
}

export interface Badge {
  id: string;
  version: string;
  urls: {
    "1x": string;
    "2x": string;
    "4x": string;
  };
}

export async function getGlobalBadges(): Promise<Badge[]> {
  const cachedBadges = await prisma.globalBadgeCache.findFirst({
    where: { updatedAt: { gte: new Date(Date.now() - CACHE_DURATION) } },
  });

  if (cachedBadges) {
    return cachedBadges.badges as unknown as Badge[];
  }

  const response = await twitchApiRequest("/chat/badges/global", "GET");
  const badges = response.data.flatMap((badge: any) =>
    badge.versions.map((version: any) => ({
      id: badge.set_id,
      version: version.id,
      urls: {
        "1x": version.image_url_1x,
        "2x": version.image_url_2x,
        "4x": version.image_url_4x,
      },
    }))
  );

  await prisma.globalBadgeCache.upsert({
    where: { id: 1 },
    update: { badges: badges, updatedAt: new Date() },
    create: { id: 1, badges: badges },
  });

  return badges;
}

export async function getChannelBadges(
  broadcasterId: string
): Promise<Badge[]> {
  const cachedBadges = await prisma.channelBadgeCache.findFirst({
    where: {
      broadcasterId,
      updatedAt: { gte: new Date(Date.now() - CACHE_DURATION) },
    },
  });

  if (cachedBadges) {
    return cachedBadges.badges as unknown as Badge[];
  }

  const response = await twitchApiRequest(
    `/chat/badges?broadcaster_id=${broadcasterId}`,
    "GET"
  );
  const badges = response.data.flatMap((badge: any) =>
    badge.versions.map((version: any) => ({
      id: badge.set_id,
      version: version.id,
      urls: {
        "1x": version.image_url_1x,
        "2x": version.image_url_2x,
        "4x": version.image_url_4x,
      },
    }))
  );

  await prisma.channelBadgeCache.upsert({
    where: { broadcasterId },
    update: { badges: badges, updatedAt: new Date() },
    create: { broadcasterId, badges: badges },
  });

  return badges;
}
