// /routes/spotify/index.ts

import { Elysia, t } from "elysia";
import {
  startSpotifySession,
  updateSessionActivity,
  getSpotifyCanvas,
  stopSpotifyPolling,
  getSpotifyApi,
  getApiStats,
  fetchAndStoreCurrentTrack,
} from "../../services/spotify.service";
import { authMiddleware } from "../../middleware/authMiddleware";
import { SpotifyLyricsService } from "../../services/spotify-lyrics.service";
import { currentlyPlayingTrack } from "@ekwoka/spotify-api";
import logger from "../../utils/logger";
import { prisma } from "../../db";
import { createAuthService } from "../../types/auth";

interface AuthStore {
  auth: {
    success: boolean;
    userId?: string;
    sessionId?: string;
    error?: string;
  };
}

export default (app: Elysia) =>
  app
    .use(authMiddleware)
    .use(createAuthService())
    .get(
      "/current-playback",
      async ({ store, set }) => {
        const auth = (store as AuthStore).auth;
        if (!auth?.success || !auth?.userId) {
          logger.warn("Unauthorized current-playback request", {
            hasAuth: !!auth,
            hasSuccess: auth?.success,
            hasUserId: !!auth?.userId,
          });
          set.status = 401;
          return {
            success: false,
            message: "Unauthorized",
          };
        }

        try {
          const trackData = await fetchAndStoreCurrentTrack(auth.userId);
          if (!trackData) {
            logger.info("No current playback found for user", {
              userId: auth.userId,
            });
            set.status = 404;
            return {
              success: false,
              message: "No current playback found",
            };
          }

          return {
            success: true,
            data: trackData,
          };
        } catch (error) {
          logger.error("Error fetching current playback:", {
            error: error instanceof Error ? error.message : String(error),
            userId: auth.userId,
            stack: error instanceof Error ? error.stack : undefined,
          });

          set.status = 500;
          return {
            success: false,
            message: "Failed to fetch current playback",
            error: error instanceof Error ? error.message : "Unknown error",
          };
        }
      },
      {
        detail: {
          tags: ["Spotify"],
          summary: "Get Current Playback",
          description: "Get current playback state including track position",
        },
      }
    )
    .group("session", (app) =>
      app
        .post(
          "/start",
          async ({ Auth, query, set }) => {
            const { user: userId } = Auth;
            const { spotifyRefreshToken } = query;

            if (!spotifyRefreshToken) {
              set.status = 400;
              return { error: "Spotify refresh token is required" };
            }

            try {
              const userProfile = await prisma.userProfile.findUnique({
                where: { user_id: userId },
              });

              if (!userProfile) {
                set.status = 404;
                return { error: "User profile not found" };
              }

              const result = await startSpotifySession(userId);
              return result;
            } catch (error) {
              logger.error("Error starting session:", error);
              set.status = 500;
              return { error: "Failed to start session" };
            }
          },
          {
            query: t.Object({
              spotifyRefreshToken: t.String(),
            }),
            detail: {
              tags: ["Spotify"],
              summary: "Start Spotify Session",
              description: "Start a new Spotify session",
            },
          }
        )
        .post(
          "/stop",
          async ({ Auth, set }) => {
            const { user: userId } = Auth;
            if (!userId || !Auth.success) {
              set.status = 401;
              return { error: "Unauthorized" };
            }

            try {
              await stopSpotifyPolling(userId);
              return { success: true };
            } catch (error) {
              logger.error("Error stopping session:", error);
              set.status = 500;
              return { error: "Failed to stop session" };
            }
          },
          {
            detail: {
              tags: ["Spotify"],
              summary: "Stop Spotify Session",
              description: "Stop the current Spotify session",
            },
          }
        )
        .post(
          "/update-activity",
          async ({ Auth, body, set }) => {
            const { user: userId } = Auth;
            if (!userId || !Auth.success) {
              set.status = 401;
              return { error: "Unauthorized" };
            }

            try {
              return await updateSessionActivity(userId, body.sessionId);
            } catch (error) {
              logger.error("Error updating activity:", error);
              set.status = 500;
              return { error: "Failed to update activity" };
            }
          },
          {
            body: t.Object({
              sessionId: t.String(),
            }),
            detail: {
              tags: ["Spotify"],
              summary: "Update Session Activity",
              description: "Update the last activity timestamp",
            },
          }
        )
    )
    .group("track", (app) =>
      app.get(
        "/current",
        async ({ store: { auth }, set }) => {
          const { userId } = auth;
          if (!userId || !auth.success) {
            set.status = 401;
            return { error: "Unauthorized" };
          }

          try {
            const spotifyApi = await getSpotifyApi(userId);
            const data = await spotifyApi(currentlyPlayingTrack());
            return { success: true, data };
          } catch (error) {
            logger.error("Error fetching current track:", error);
            set.status = 500;
            return { error: "Failed to fetch current track" };
          }
        },
        {
          detail: {
            tags: ["Spotify"],
            summary: "Get Current Track",
            description: "Get currently playing track",
          },
        }
      )
    )
    .group("canvas", (app) =>
      app.get(
        "/",
        async ({ query, set }) => {
          const { trackInfo } = query;
          if (!trackInfo) {
            set.status = 400;
            return { error: "Track ID is required" };
          }

          try {
            const result = await getSpotifyCanvas(trackInfo);
            return { success: true, ...result };
          } catch (error) {
            logger.error("Error fetching canvas:", error);
            set.status = 500;
            return { error: "Failed to fetch canvas" };
          }
        },
        {
          query: t.Object({
            trackInfo: t.String(),
          }),
          detail: {
            tags: ["Spotify"],
            summary: "Get Track Canvas",
            description: "Get canvas video for track",
          },
        }
      )
    )
    .group("lyrics", (app) =>
      app.get(
        "/:trackId",
        async ({ store: { auth }, params, set }) => {
          if (!params.trackId) {
            set.status = 400;
            return {
              statusCode: 400,
              message: "Track ID is required",
              isError: true,
            };
          }

          const lyricsService = new SpotifyLyricsService();

          try {
            const spotifyResponse = await lyricsService.getLyrics(
              params.trackId
            );

            if (!spotifyResponse.lyrics) {
              set.status = 404;
              return {
                statusCode: 404,
                message: "No lyrics available",
                isError: false,
              };
            }

            return {
              lyrics: {
                syncType: spotifyResponse.lyrics.syncType,
                lines: spotifyResponse.lyrics.lines.map((line: any) => ({
                  startTimeMs: line.startTimeMs,
                  words: line.words,
                  endTimeMs: line.endTimeMs || null,
                })),
                language: spotifyResponse.lyrics.language,
                provider: spotifyResponse.lyrics.provider,
              },
              colors: {
                background: spotifyResponse.colors.background
                  .toString(16)
                  .padStart(6, "0"),
                text: spotifyResponse.colors.text.toString(16).padStart(6, "0"),
                highlightText: spotifyResponse.colors.highlightText
                  .toString(16)
                  .padStart(6, "0"),
              },
            };
          } catch (error: any) {
            logger.error("Error fetching lyrics:", error);
            set.status = error.message.includes("authentication failed")
              ? 401
              : 500;
            return {
              statusCode: set.status,
              message: "Failed to fetch lyrics",
              details: error.message,
              isError: true,
            };
          }
        },
        {
          params: t.Object({
            trackId: t.String({
              minLength: 1,
              error: "Track ID is required",
            }),
          }),
          detail: {
            tags: ["Spotify"],
            summary: "Get Track Lyrics",
            description: "Get synchronized lyrics for a Spotify track",
          },
        }
      )
    )
    .group("auth", (app) =>
      app.post(
        "/tokens",
        async ({ store: { auth }, body, set }) => {
          const { userId } = auth;
          const { accessToken, refreshToken, spDc } = body;

          if (!userId || !auth.success) {
            set.status = 401;
            return { error: "Unauthorized" };
          }

          try {
            const updatedProfile = await prisma.userProfile.update({
              where: { user_id: userId },
              data: {
                s_access_token: accessToken,
                s_refresh_token: refreshToken,
                s_sp_dc: spDc,
              },
              select: {
                s_refresh_token: true,
              },
            });

            logger.info("Spotify tokens updated for user", {
              userId,
              hasRefreshToken: !!updatedProfile.s_refresh_token,
            });

            return {
              success: true,
              hasRefreshToken: !!updatedProfile.s_refresh_token,
            };
          } catch (error) {
            logger.error("Error updating tokens:", {
              error: error instanceof Error ? error.message : String(error),
              userId,
            });
            set.status = 500;
            return { error: "Failed to update tokens" };
          }
        },
        {
          body: t.Object({
            accessToken: t.String(),
            refreshToken: t.String(),
            spDc: t.String(),
          }),
          detail: {
            tags: ["Spotify"],
            summary: "Update Spotify Tokens",
            description: "Update Spotify access and refresh tokens",
          },
        }
      )
    )
    .group("/api-stats", (app) =>
      app.get(
        "/",
        async ({ headers, set }) => {
          const userId = headers["x-user-id"] as string | undefined;

          if (!userId) {
            set.status = 401;
            return { error: "Unauthorized" };
          }

          try {
            const stats = await getApiStats(userId);
            return { success: true, stats };
          } catch (error) {
            logger.error("Error fetching API stats:", {
              error: error instanceof Error ? error.message : String(error),
              userId,
            });
            set.status = 500;
            return { error: "Failed to fetch API stats" };
          }
        },
        {
          detail: {
            tags: ["Spotify"],
            summary: "Get API Stats",
            description: "Get Spotify API usage statistics",
          },
        }
      )
    );