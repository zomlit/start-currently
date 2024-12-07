import {
  spotifyApiClient,
  setToken,
  currentlyPlayingTrack,
  refreshToken as refreshSpotifyTokenApi,
} from "@ekwoka/spotify-api";
import logger from "../utils/logger";
import { Server } from "socket.io";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "../db";
import { getIO } from "../socketAdapter";
import fetch from "node-fetch";
import * as cheerio from "cheerio";
import axios from "axios";
import { getUserProfile, updateUserActivity } from "../models/UserProfile";
import { spotify } from "./canvas/canvas_pb";
const { CanvasRequest, CanvasResponse } = spotify.canvas;

export async function refreshSpotifyTokenAndGetAccess(
  userId: string,
  refreshTokenString: string
) {
  try {
    const userProfile = await prisma.userProfile.findUnique({
      where: { user_id: userId },
      select: { s_client_id: true, s_client_secret: true },
    });

    if (!userProfile?.s_client_id || !userProfile?.s_client_secret) {
      throw new Error("Spotify credentials not found for user");
    }

    const { access_token } = await refreshSpotifyTokenApi(
      refreshTokenString,
      userProfile.s_client_id,
      userProfile.s_client_secret
    );

    return { access_token, userProfile };
  } catch (error) {
    logger.error("Error refreshing Spotify token", {
      userId,
      errorMessage: error instanceof Error ? error.message : "Unknown error",
      errorStack: error instanceof Error ? error.stack : "No stack trace",
    });
    throw error;
  }
}

interface UserState {
  spotifyApi: ReturnType<typeof spotifyApiClient>;
  isActive: boolean;
  lastCheck: number;
  timeout: NodeJS.Timeout | null;
  isPaused: boolean;
  sessionId: string;
  lastActivity: number;
  apiHitCount: number;
  lastResetTime: number;
}

const userStates: Map<string, UserState> = new Map();

let io: Server;

export function setSocketIO(socketIO: Server) {
  io = socketIO;
}

const getColorCode = (count: number): string => {
  if (count < 60) return "\x1b[32m"; // Green for < 60
  if (count < 120) return "\x1b[33m"; // Yellow for < 120
  return "\x1b[31m"; // Red for >= 120
};

// Add this at the top with other interfaces
interface ApiStats {
  hits: number;
  lastResetTime: number;
}

const userApiStats: Map<string, ApiStats> = new Map();

// Update the incrementApiHitCount function
function incrementApiHitCount(userId: string) {
  const stats = userApiStats.get(userId) || {
    hits: 0,
    lastResetTime: Date.now(),
  };
  stats.hits++;
  userApiStats.set(userId, stats);

  const io = getIO();
  if (io) {
    io.to(userId).emit("spotifyApiStats", {
      apiHits: stats.hits,
      timestamp: new Date().toISOString(),
      timeSinceLastReset: Date.now() - stats.lastResetTime,
    });
  }
}

// Add this function to get stats
export async function getApiStats(userId: string) {
  const stats = userApiStats.get(userId) || {
    hits: 0,
    lastResetTime: Date.now(),
  };
  return {
    hits: stats.hits,
    lastResetTime: stats.lastResetTime,
    timeSinceLastReset: Date.now() - stats.lastResetTime,
  };
}

// Update resetApiHitCount
function resetApiHitCount(userId: string) {
  const stats = userApiStats.get(userId);
  if (stats) {
    userApiStats.set(userId, {
      hits: 0,
      lastResetTime: Date.now(),
    });

    const io = getIO();
    if (io) {
      io.to(userId).emit("spotifyApiStatsReset", {
        timestamp: new Date().toISOString(),
      });
    }
  }
}

// Add this to clean up old stats
setInterval(() => {
  const now = Date.now();
  for (const [userId, stats] of userApiStats.entries()) {
    if (now - stats.lastResetTime > 60000) {
      // 1 minute
      resetApiHitCount(userId);
    }
  }
}, 10000); // Check every 10 seconds

// Add these imports at the top of the file
// import { TokenError } from "@ekwoka/spotify-api";

// Add this interface near the top of the file
interface CachedToken {
  accessToken: string;
  expiresAt: number;
}

// Keep this declaration and remove the duplicate one at the bottom of the file
const tokenCache: Map<string, CachedToken> = new Map();

// Add this function to check if an error is likely a token error
function isLikelyTokenError(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.message.toLowerCase().includes("token") ||
      error.message.toLowerCase().includes("unauthorized") ||
      error.message.toLowerCase().includes("expired"))
  );
}

// Update the refreshAccessToken function
async function refreshAccessToken(
  userId: string,
  refreshToken: string
): Promise<string> {
  try {
    const userProfile = await prisma.userProfile.findUnique({
      where: { user_id: userId },
    });

    if (
      !userProfile ||
      !userProfile.s_client_id ||
      !userProfile.s_client_secret
    ) {
      throw new Error("User Spotify client ID or secret not found");
    }

    const { access_token, expires_in } = await refreshSpotifyTokenApi(
      refreshToken,
      userProfile.s_client_id,
      userProfile.s_client_secret
    );

    const expiresAt = new Date(Date.now() + expires_in * 1000);

    await prisma.userProfile.update({
      where: { user_id: userId },
      data: {
        s_access_token: access_token,
      },
    });

    return access_token;
  } catch (error) {
    logger.error("Error refreshing access token:", {
      error: error instanceof Error ? error.message : String(error),
      name: error instanceof Error ? error.name : "Unknown",
      stack: error instanceof Error ? error.stack : "No stack trace",
    });
    throw error;
  }
}

// Update isUserTrulyActive to reduce logging
async function isUserTrulyActive(userId: string): Promise<boolean> {
  const profile = await getUserProfile(userId);

  if (!profile.is_active) {
    logger.warn(`User ${userId} is not marked as active in the database`);
    return false;
  }

  const now = new Date();

  // If last_activity is null but is_active is true, update last_activity
  if (profile.is_active && !profile.last_activity) {
    await updateUserActivity(userId);
    return true;
  }

  // Check if last_activity is set and not older than 5 minutes
  if (profile.last_activity) {
    const isRecentlyActive =
      profile.last_activity > new Date(now.getTime() - 5 * 60 * 1000);
    if (isRecentlyActive) {
      return true;
    }
  }

  // If last_activity check fails, check s_expires_at
  if (profile.s_expires_at && profile.s_expires_at > now) {
    return true;
  }

  logger.warn(`User ${userId} is inactive:`, {
    last_activity: profile.last_activity,
    s_expires_at: profile.s_expires_at,
  });

  return false;
}

// Update hasActiveSession to reduce logging
async function hasActiveSession(userId: string): Promise<boolean> {
  return await isUserTrulyActive(userId);
}

// Update the fetchAndStoreCurrentTrack function
export async function fetchAndStoreCurrentTrack(userId: string) {
  try {
    // Check if the user has an active session
    const isActive = await hasActiveSession(userId);
    if (!isActive) {
      logger.info(`Skipping API call for inactive user: ${userId}`);
      return null;
    }

    incrementApiHitCount(userId);

    const spotifyApi = await getSpotifyApi(userId);
    if (!spotifyApi) {
      logger.error("Failed to get Spotify API client", { userId });
      throw new Error("Failed to get Spotify API client");
    }

    const data = await spotifyApi(currentlyPlayingTrack());

    if (!data || !data.item || data.currently_playing_type !== "track") {
      return {
        isPlaying: false,
        title: "",
        artist: "",
        songUrl: "",
        album: "",
        duration: 0,
        elapsed: 0,
        progress: 0,
        id: "",
      };
    }

    const track = {
      isPlaying: data.is_playing,
      title: data.item.name,
      artist: data.item.artists.map((artist) => artist.name).join(", "),
      songUrl: data.item.external_urls.spotify,
      album: data.item.album.name,
      artwork: data.item.album.images[0]?.url,
      duration: data.item.duration_ms,
      elapsed: data.progress_ms || 0,
      progress: data.progress_ms
        ? (data.progress_ms / data.item.duration_ms) * 100
        : 0,
      id: data.item.id,
    };

    await prisma.visualizerWidget.upsert({
      where: { user_id: userId },
      create: {
        user_id: userId,
        type: "spotify",
        sensitivity: 1.0,
        colorScheme: "default",
        track,
      },
      update: {
        track,
      },
    });

    return track;
  } catch (error) {
    logger.error("Error in fetchAndStoreCurrentTrack:", {
      error: error instanceof Error ? error.message : String(error),
      userId,
      stack: error instanceof Error ? error.stack : undefined,
    });
    throw error;
  }
}

const SESSION_TIMEOUT = 60000; // 1 minute

// Update poll function to reduce logging
async function poll(userId: string, state: UserState) {
  const startTime = Date.now();
  state.lastActivity = startTime;

  try {
    const trackData = await fetchAndStoreCurrentTrack(userId);
    state.isPaused = !trackData?.isPlaying;

    const pollInterval = trackData?.isPlaying ? 1000 : 5000;
    const processingTime = Date.now() - startTime;
    const adjustedInterval = Math.max(0, pollInterval - processingTime);

    state.timeout = setTimeout(
      () => poll(userId, state),
      adjustedInterval
    ) as unknown as NodeJS.Timeout;
  } catch (error) {
    logger.error("Error in polling:", error);
    // On error, retry after a short delay
    state.timeout = setTimeout(
      () => poll(userId, state),
      1000
    ) as unknown as NodeJS.Timeout;
  }
}

// Add at the top with other Maps
const pollingIntervals: Map<string, NodeJS.Timeout> = new Map();

// Single stopSpotifyPolling implementation
export async function stopSpotifyPolling(userId: string) {
  try {
    // Clear any existing state
    const state = userStates.get(userId);
    if (state?.timeout) {
      clearTimeout(state.timeout);
    }
    userStates.delete(userId);

    // Clear any polling intervals
    if (pollingIntervals.has(userId)) {
      clearInterval(pollingIntervals.get(userId));
      pollingIntervals.delete(userId);
    }

    logger.info(`Spotify polling stopped for user: ${userId}`);
    return true;
  } catch (error) {
    logger.error("Error stopping Spotify polling:", error);
    throw error;
  }
}

// Fix startSpotifyPolling to initialize state before using it
export async function startSpotifyPolling(
  userId: string,
  spotifyApi: ReturnType<typeof spotifyApiClient>
) {
  const isActive = await isUserTrulyActive(userId);
  if (!isActive) {
    logger.warn(`Cannot start polling for inactive user: ${userId}`);
    return { sessionId: null, isPolling: false };
  }

  const sessionId = uuidv4();
  const existingState = userStates.get(userId);

  if (existingState) {
    existingState.lastActivity = Date.now();
    return { sessionId: existingState.sessionId, isPolling: true };
  }

  const state: UserState = {
    spotifyApi,
    isActive: true,
    lastCheck: Date.now(),
    timeout: null,
    isPaused: false,
    sessionId,
    lastActivity: Date.now(),
    apiHitCount: 0,
    lastResetTime: Date.now(),
  };

  userStates.set(userId, state);

  // Clear any existing polling
  if (pollingIntervals.has(userId)) {
    clearInterval(pollingIntervals.get(userId));
  }

  // Set up new polling interval
  const interval = setInterval(() => {
    poll(userId, state);
  }, 1000) as unknown as NodeJS.Timeout;

  pollingIntervals.set(userId, interval);

  // Start polling
  poll(userId, state);

  return { sessionId, isPolling: true };
}

export async function updateSessionActivity(userId: string, sessionId: string) {
  const state = userStates.get(userId);
  if (state && state.sessionId === sessionId) {
    state.lastActivity = Date.now();
    return true;
  }
  return false;
}

// Update the startSpotifySession function
export async function startSpotifySession(userId: string) {
  try {
    await stopSpotifyPolling(userId); // This calls the above function
    logger.info(`Stopping sessions for user: ${userId}`); // And this log
    // First, check if user exists and has required credentials
    let userProfile = await prisma.userProfile.findUnique({
      where: { user_id: userId },
    });

    if (!userProfile) {
      logger.error(`User profile not found for user: ${userId}`);
      throw new Error("User profile not found");
    }

    if (
      !userProfile.s_access_token ||
      !userProfile.s_refresh_token ||
      !userProfile.s_client_id ||
      !userProfile.s_client_secret
    ) {
      logger.error(`Missing Spotify credentials for user: ${userId}`);
      throw new Error("User is missing required Spotify credentials");
    }

    // First, update the activity status
    const now = new Date();
    await prisma.userProfile.update({
      where: { user_id: userId },
      data: {
        is_active: true,
        last_activity: now,
        s_expires_at: new Date(now.getTime() + 3600 * 1000), // 1 hour from now
      },
    });

    // Verify the update immediately
    const verifiedProfile = await prisma.userProfile.findUnique({
      where: { user_id: userId },
      select: { is_active: true, last_activity: true, s_expires_at: true },
    });

    if (!verifiedProfile?.is_active) {
      logger.error(`Failed to set user ${userId} as active`);
      throw new Error("Failed to set user as active");
    }

    // Now initialize Spotify API and start polling
    const spotifyApi = await getSpotifyApi(userId);

    const { sessionId, isPolling } = await startSpotifyPolling(
      userId,
      spotifyApi
    );

    return {
      success: isPolling,
      message: isPolling
        ? "Spotify session started successfully"
        : "Failed to start Spotify session",
      sessionId,
      isPolling,
    };
  } catch (error) {
    logger.error("Error starting Spotify session:", {
      userId,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : "No stack trace",
    });
    throw error;
  }
}

// Update the resumeActiveSessions function
export async function resumeActiveSessions() {
  try {
    const activeSessions = await prisma.userProfile.findMany({
      where: {
        is_active: true,
        last_activity: {
          gte: new Date(Date.now() - 5 * 60 * 1000), // Only resume sessions active in the last 5 minutes
        },
      },
    });

    for (const session of activeSessions) {
      if (session.s_access_token) {
        const spotifyApi = spotifyApiClient(session.s_access_token);
        await startSpotifyPolling(session.user_id, spotifyApi);
      } else {
        logger.warn(`No access token found for user: ${session.user_id}`);
      }
    }
  } catch (error) {
    logger.error("Error resuming active sessions:", {
      error: error instanceof Error ? error.message : String(error),
      name: error instanceof Error ? error.name : "Unknown",
      stack: error instanceof Error ? error.stack : "No stack trace",
    });
  }
}

async function handleSpotifyError(
  error: unknown,
  userId: string,
  refreshTokenString: string
) {
  if (
    error instanceof Error &&
    typeof error.message === "string" &&
    error.message.toLowerCase().includes("token")
  ) {
    logger.warn("Possible token issue, attempting to refresh...", {
      userId,
      errorMessage: error.message,
      errorStack: error.stack,
    });

    try {
      const { access_token, userProfile } =
        await refreshSpotifyTokenAndGetAccess(userId, refreshTokenString);

      logger.warn("Token refreshed successfully", {
        userId,
        currentTime: new Date().toISOString(),
      });

      return access_token;
    } catch (refreshError) {
      logger.error("Failed to refresh token", {
        userId,
        errorMessage:
          refreshError instanceof Error
            ? refreshError.message
            : "Unknown error",
        errorStack:
          refreshError instanceof Error ? refreshError.stack : "No stack trace",
      });
      throw refreshError;
    }
  }
  throw error;
}

async function createOrUpdateVisualizerWidget(userId: string, track: any) {
  try {
    let visualizerWidget = await prisma.visualizerWidget.findFirst({
      where: { user_id: userId },
    });

    if (!visualizerWidget) {
      logger.info(`Creating new VisualizerWidget for user: ${userId}`);
      visualizerWidget = await prisma.visualizerWidget.create({
        data: {
          user_id: userId,
          track: track as any,
          type: "default",
          sensitivity: 0.5,
          colorScheme: "default",
        },
      });
    } else {
      // Update existing widget
      visualizerWidget = await prisma.visualizerWidget.update({
        where: { id: visualizerWidget.id },
        data: { track: track as any },
      });
    }

    return visualizerWidget;
  } catch (error) {
    logger.error("Error creating/updating VisualizerWidget", {
      userId,
      errorMessage: error instanceof Error ? error.message : "Unknown error",
      errorStack: error instanceof Error ? error.stack : "No stack trace",
    });
    throw error;
  }
}

export async function getSpotifyCanvas(
  trackId: string,
  spDc?: string
): Promise<{ videoLink: string | null; error?: string }> {
  // First try canvasdownloader
  const canvasUrl = `https://www.canvasdownloader.com/canvas?link=spotify:track:${encodeURIComponent(
    trackId
  )}`;

  try {
    const response = await fetch(canvasUrl);
    const html = await response.text();

    // Check for Cloudflare bot detection
    if (
      html.includes("Just a moment...") ||
      html.includes("cf-browser-verification") ||
      html.includes("_cf_chl_opt")
    ) {
      return await getSpotifyWebCanvas(trackId, spDc);
    }

    if (!html) {
      throw new Error("Empty response from canvas service");
    }

    const $ = cheerio.load(html);
    const videoLink = $('video > source[type="video/mp4"]').attr("src");

    if (!videoLink) {
      logger.info(
        "No video link found in canvas response, trying Spotify web..."
      );
      return await getSpotifyWebCanvas(trackId, spDc);
    }

    return { videoLink };
  } catch (error) {
    logger.error("Error fetching from canvas service:", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : "No stack trace",
      url: canvasUrl,
      trackId,
    });

    // Try Spotify web as fallback
    return await getSpotifyWebCanvas(trackId, spDc);
  }
}

interface SpotifyTokenResponse {
  accessToken: string;
  [key: string]: any;
}

async function getSpotifyCanvasToken(spDc?: string): Promise<string | null> {
  try {
    const CANVAS_TOKEN_URL =
      "https://open.spotify.com/get_access_token?reason=transport&productType=web_player";

    const headers: Record<string, string> = {
      "User-Agent":
        "Mozilla/5.0 (X11; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/114.0",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.5",
      "Alt-Used": "open.spotify.com",
      "Upgrade-Insecure-Requests": "1",
      "Sec-Fetch-Dest": "document",
      "Sec-Fetch-Mode": "navigate",
      "Sec-Fetch-Site": "cross-site",
    };

    // Add sp_dc cookie if provided
    if (spDc) {
      headers.Cookie = `sp_dc=${spDc}`;
    }

    const response = await fetch(CANVAS_TOKEN_URL, { headers });
    if (!response.ok) {
      logger.error(
        `Failed to get canvas token: ${response.status} ${response.statusText}`
      );
      return null;
    }

    const data = (await response.json()) as SpotifyTokenResponse;
    if (data.accessToken) {
      return data.accessToken;
    }

    logger.warn("No access token in response");
    return null;
  } catch (error) {
    logger.error("Failed to get Spotify canvas token:", error);
    return null;
  }
}

async function getSpotifyWebCanvas(
  trackId: string,
  spDc?: string
): Promise<{ videoLink: string | null; error?: string }> {
  try {
    // Get user's Spotify cookie from database if not provided
    if (!spDc) {
      const userProfile = await prisma.userProfile.findFirst({
        where: { s_sp_dc: { not: null } },
        select: { s_sp_dc: true },
      });

      if (userProfile?.s_sp_dc) {
        spDc = userProfile.s_sp_dc;
      }
    }

    const token = await getSpotifyCanvasToken(spDc);
    if (!token) {
      logger.warn("Failed to get Spotify canvas token");
      return { videoLink: null, error: "No canvas token available" };
    }

    const canvasUrl =
      "https://spclient.wg.spotify.com/canvaz-cache/v0/canvases";

    // Create protobuf request using the generated types
    const track: spotify.canvas.ITrack = {
      trackUri: `spotify:track:${trackId}`,
    };

    const canvasRequest: spotify.canvas.ICanvasRequest = {
      tracks: [track],
    };

    // Encode using protobuf
    const binaryData = CanvasRequest.encode(
      CanvasRequest.create(canvasRequest)
    ).finish();
    const body = Buffer.from(binaryData);

    const headers = {
      accept: "application/protobuf",
      "content-type": "application/x-protobuf",
      "accept-language": "en-US",
      "user-agent": "Spotify/8.6.98 iOS/15.3.1",
      "accept-encoding": "gzip, deflate, br",
      "app-platform": "iOS",
      "spotify-app-version": "8.6.98",
      "x-client-id": "9a8d2f0ce77a4e248bb71fefcb557637",
      authorization: `Bearer ${token}`,
      "x-cloud-trace-context":
        "00000000000000000000000000000000/0000000000000000;o=1",
    };

    // Add cookie if available
    if (spDc) {
      headers.Cookie = `sp_dc=${spDc}`;
    }

    const response = await fetch(canvasUrl, {
      method: "POST",
      headers,
      body,
    });

    if (response.ok) {
      const responseData = await response.arrayBuffer();
      const canvasData = CanvasResponse.decode(new Uint8Array(responseData));

      if (canvasData.canvases?.[0]?.canvasUrl) {
        return { videoLink: canvasData.canvases[0].canvasUrl };
      }
    } else {
      // Log the error response for debugging
      const errorText = await response.text();
      logger.error("Canvas API error response:", {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
        headers: response.headers,
        requestHeaders: {
          accept: "application/protobuf",
          "content-type": "application/x-protobuf",
          "accept-language": "en-US",
          "app-platform": "iOS",
          "spotify-app-version": "8.6.98",
        },
      });
    }

    logger.info("No canvas URL found in Spotify API", {
      status: response.status,
      statusText: response.statusText,
      token: token.substring(0, 10) + "...",
      trackId,
    });
    return { videoLink: null };
  } catch (error) {
    logger.error("Error fetching from Spotify API:", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      trackId,
    });

    return {
      videoLink: null,
      error: "Failed to fetch canvas from Spotify API",
    };
  }
}

export async function fetchLyrics(
  trackId: string,
  spDc: string
): Promise<string> {
  try {
    const response = await axios.get(
      `https://spclient.wg.spotify.com/color-lyrics/v2/track/${trackId}`,
      {
        headers: {
          "app-platform": "WebPlayer",
          "spotify-app-version": "1.2.3.4", // You might need to update this
          authorization: `Bearer ${spDc}`,
        },
      }
    );

    if (response.status !== 200) {
      throw new Error(`Failed to fetch lyrics. Status: ${response.status}`);
    }

    // Parse and return the lyrics from the response
    // The exact structure might vary, so adjust this according to the actual response
    return response.data.lyrics.lines
      .map((line: { words: string }) => line.words)
      .join("\n");
  } catch (error) {
    if (axios.isAxiosError(error)) {
      logger.error("Axios error fetching lyrics:", error.message);
      logger.error("Request URL:", error.config?.url);
      logger.error("Response status:", error.response?.status);
      logger.error("Response headers:", error.response?.headers);
      // logger.error("Response data:", error.response?.data);
    }
    logger.error("Error fetching lyrics:", error);
    throw new Error("Failed to fetch lyrics");
  }
}

// Add this constant at the top of the file
const MAX_REFRESH_ATTEMPTS = 3;

export async function getSpotifyApi(userId: string, attemptCount = 0) {
  // First, check if the user is active
  const isActive = await hasActiveSession(userId);
  if (!isActive) {
    logger.info(`Skipping API call for inactive user: ${userId}`);
    throw new Error("User is inactive");
  }

  const now = Date.now();
  const cachedToken = tokenCache.get(userId);

  if (cachedToken && cachedToken.expiresAt > now + 300000) {
    // 5 minutes buffer
    return spotifyApiClient(cachedToken.accessToken);
  }

  if (attemptCount >= MAX_REFRESH_ATTEMPTS) {
    logger.error(`Max refresh attempts reached for user ${userId}`);
    throw new Error("Max token refresh attempts reached");
  }

  const user = await prisma.userProfile.findUnique({
    where: { user_id: userId },
    select: {
      s_access_token: true,
      s_refresh_token: true,
      s_client_id: true,
      s_client_secret: true,
    },
  });

  if (
    !user ||
    !user.s_refresh_token ||
    !user.s_client_id ||
    !user.s_client_secret
  ) {
    throw new Error("User not found or missing Spotify credentials");
  }

  try {
    const { access_token, expires_in } = await refreshSpotifyTokenApi(
      user.s_refresh_token,
      user.s_client_id,
      user.s_client_secret
    );

    await prisma.userProfile.update({
      where: { user_id: userId },
      data: { s_access_token: access_token },
    });

    const expiresAt = now + expires_in * 1000;
    tokenCache.set(userId, { accessToken: access_token, expiresAt });

    return spotifyApiClient(access_token);
  } catch (error) {
    logger.error(`Failed to refresh Spotify token for user ${userId}:`, error);

    if (attemptCount < MAX_REFRESH_ATTEMPTS - 1) {
      logger.warn(
        `Retrying token refresh for user ${userId}, attempt ${attemptCount + 1}`
      );
      return getSpotifyApi(userId, attemptCount + 1);
    }

    throw error;
  }
}

export async function stopSpotifySession(userId: string) {
  try {
    logger.info(`Stopping Spotify session for user: ${userId}`);

    await stopSpotifyPolling(userId);

    await prisma.userProfile.update({
      where: { user_id: userId },
      data: { is_active: false },
    });

    logger.info(`Spotify session stopped for user: ${userId}`);

    return {
      success: true,
      message: "Spotify session stopped successfully",
    };
  } catch (error) {
    logger.error("Error stopping Spotify session:", {
      error: error instanceof Error ? error.message : String(error),
      name: error instanceof Error ? error.name : "Unknown",
      stack: error instanceof Error ? error.stack : "No stack trace",
    });
    throw new Error("Failed to stop Spotify session");
  }
}
