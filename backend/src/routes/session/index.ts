import { Elysia, t } from "elysia";
import { authMiddleware } from "../../middleware/authMiddleware";
import {
  startSpotifySession,
  stopSpotifyPolling,
} from "../../services/spotify.service";
import { startTwitchSession } from "../../services/twitch.service";
import logger from "../../utils/logger";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Define types for query parameters
interface SessionQueryParams {
  twitchChannel?: string;
  spotifyRefreshToken?: string;
  twitchAccessToken?: string;
  clerkSessionId?: string;
}

// Define types for session results
interface SessionResults {
  spotify?: {
    success: boolean;
    message: string;
    oauthToken?: {
      refreshToken: string;
      accessToken: string;
    };
  };
  twitch?: { success: boolean; message: string };
}

export default (app: Elysia) =>
  app
    .use(authMiddleware)
    .options("/start-session", ({ set }) => {
      set.status = 204;
      return "";
    })
    .get("/start-session", ({ set }) => {
      set.status = 200;
      return { message: "Use POST method to start a session" };
    })
    .post(
      "/start-session",
      async ({ query, set, headers }) => {
        const userId = headers["x-user-id"] as string | undefined;

        if (!userId) {
          set.status = 401;
          return { error: "Unauthorized: User ID is missing" };
        }

        const {
          twitchChannel,
          spotifyRefreshToken,
          twitchAccessToken,
          clerkSessionId,
        } = query as SessionQueryParams;

        try {
          const results: SessionResults = {};

          if (spotifyRefreshToken) {
            // Verify the refresh token exists in the database
            const userProfile = await prisma.userProfile.findUnique({
              where: { user_id: userId },
              select: {
                s_refresh_token: true,
                s_access_token: true,
              },
            });

            if (!userProfile?.s_refresh_token) {
              logger.warn(
                "No Spotify refresh token found in database for user",
                { userId }
              );
              return {
                error: "Spotify refresh token not found",
                hasSpotifyToken: false,
              };
            }

            results.spotify = await startSpotifySession(userId);

            // Add OAuth token info to response
            if (results.spotify?.success) {
              results.spotify.oauthToken = {
                refreshToken: userProfile.s_refresh_token,
                accessToken: userProfile.s_access_token || "",
              };
            }
          }

          if (twitchChannel && twitchAccessToken && clerkSessionId) {
            logger.info("Starting Twitch session", {
              userId,
              twitchChannel,
              twitchAccessToken,
              clerkSessionId,
            });
            const twitchResult = await startTwitchSession(
              userId,
              twitchChannel,
              twitchAccessToken,
              clerkSessionId
            );
            if (twitchResult.success) {
              results.twitch = {
                success: twitchResult.success,
                message: twitchResult.message || "",
              };
            }
          }

          return {
            success: true,
            message: "Sessions started successfully",
            ...results,
            userId,
            twitchChannel,
            hasSpotifyToken: !!spotifyRefreshToken,
          };
        } catch (error) {
          logger.error(`Error starting sessions for user ${userId}`, {
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
            query: JSON.stringify(query),
          });
          set.status = 500;
          return {
            error: "Failed to start sessions. Please try again.",
          };
        }
      },
      {
        query: t.Object({
          twitchChannel: t.Optional(t.String()),
          spotifyRefreshToken: t.Optional(t.String()),
          twitchAccessToken: t.Optional(t.String()),
          clerkSessionId: t.Optional(t.String()),
        }),
      }
    )
    .post("/stop-session", async ({ headers, set }) => {
      const userId = headers["x-user-id"];

      if (!userId) {
        set.status = 401;
        return { error: "Unauthorized: User ID is missing" };
      }

      try {
        logger.info(`Stopping sessions for user: ${userId}`);
        await stopSpotifyPolling(userId);

        return { success: true, message: "Sessions stopped successfully" };
      } catch (error) {
        logger.error("Error stopping sessions:", {
          error: error instanceof Error ? error.message : String(error),
          name: error instanceof Error ? error.name : "Unknown",
          stack: error instanceof Error ? error.stack : "No stack trace",
        });
        set.status = 500;
        return { error: "Failed to stop sessions. Please try again." };
      }
    })
    .get(
      "/status",
      async ({ headers, set }) => {
        const userId = headers["x-user-id"] as string | undefined;

        if (!userId) {
          set.status = 401;
          return { error: "Unauthorized: User ID is missing" };
        }

        try {
          // Get user profile with Spotify tokens
          const userProfile = await prisma.userProfile.findUnique({
            where: { user_id: userId },
            select: {
              is_active: true,
              s_refresh_token: true,
              s_access_token: true,
              last_activity: true,
            },
          });

          if (!userProfile) {
            set.status = 404;
            return { error: "User profile not found" };
          }

          return {
            success: true,
            spotify: {
              isConnected: !!userProfile.s_refresh_token,
              hasAccessToken: !!userProfile.s_access_token,
            },
            session: {
              active: userProfile.is_active,
              lastActivity: userProfile.last_activity,
            },
          };
        } catch (error) {
          logger.error("Error fetching session status:", {
            error: error instanceof Error ? error.message : String(error),
            userId,
          });
          set.status = 500;
          return { error: "Failed to fetch session status" };
        }
      },
      {
        detail: {
          tags: ["Session"],
          summary: "Get Session Status",
          description: "Get current session and connection status",
        },
      }
    );
