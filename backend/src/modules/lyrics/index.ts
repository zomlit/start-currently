import { Elysia, t } from "elysia";
import { prisma } from "../../db";
import { auth } from "../../middleware/auth";
import logger from "../../utils/logger";
import type { Prisma } from "@prisma/client";
import { SpotifyLyricsService } from "./spotify-lyrics.service";

// Types
export interface LyricsSettings {
  // ... type definition
}

// Error Handling
export const LyricsErrors = {
  fetchError: (error: unknown) => {
    logger.error("Error fetching lyrics:", error);
    return {
      statusCode:
        error instanceof Error &&
        error.message.includes("authentication failed")
          ? 401
          : 500,
      message: "Failed to fetch lyrics",
      details: error instanceof Error ? error.message : String(error),
      isError: true,
    };
  },

  settingsError: (error: unknown) => {
    logger.error("Error managing lyrics settings:", error);
    return {
      statusCode: 500,
      message: "Failed to manage lyrics settings",
      details: error instanceof Error ? error.message : String(error),
      isError: true,
    };
  },

  notFound: () => ({
    statusCode: 404,
    message: "No lyrics available",
    isError: false,
  }),

  unauthorized: () => ({
    statusCode: 401,
    message: "Unauthorized",
    isError: true,
  }),
};

// Service
export class LyricsService {
  static async getSettings(username: string) {
    const profile = await prisma.userProfile.findUnique({
      where: { username },
      select: { user_id: true },
    });

    if (!profile) {
      return null;
    }

    const widget = await prisma.visualizerWidget.findUnique({
      where: { user_id: profile.user_id },
      select: { lyrics_settings: true },
    });

    return widget?.lyrics_settings || null;
  }

  static async updateSettings(userId: string, settings: LyricsSettings) {
    return await prisma.visualizerWidget.upsert({
      where: { user_id: userId },
      update: {
        lyrics_settings: settings,
        type: "lyrics",
      },
      create: {
        user_id: userId,
        type: "lyrics",
        lyrics_settings: settings,
        sensitivity: 1.0,
        colorScheme: "default",
      },
    });
  }
}

// Add route types
type RouteContext = {
  params: { username: string };
  set: { status: number };
  store: { auth: { userId?: string; success: boolean } };
  body: { settings: LyricsSettings };
};

// Add validation schemas
const UpdateSettingsBody = t.Object({
  settings: t.Object({}),
});

// Routes
export const lyricsRoutes = new Elysia()
  .use(auth)
  .group("/api/spotify/lyrics", (app) =>
    app
      .get("/:trackId", async ({ params: { trackId }, set }) => {
        try {
          const lyricsService = new SpotifyLyricsService();
          const lyrics = await lyricsService.getLyrics(trackId);

          if (!lyrics) {
            set.status = 404;
            return { error: "No lyrics found" };
          }

          return lyrics;
        } catch (error: unknown) {
          set.status = 404;
          return LyricsErrors.fetchError(error);
        }
      })
      .get(
        "/settings/:username",
        async ({ params: { username }, set }: RouteContext) => {
          try {
            const settings = await LyricsService.getSettings(username);
            if (!settings) {
              set.status = 404;
              return { error: "Settings not found" };
            }
            return settings;
          } catch (error) {
            set.status = 500;
            return { error: "Failed to fetch settings" };
          }
        },
        {
          params: t.Object({
            username: t.String(),
          }),
          response: t.Union([t.Null(), t.Unknown()]),
        }
      )
      .put(
        "/settings",
        async ({ store: { auth }, body, set }: RouteContext) => {
          if (!auth?.userId) {
            set.status = 401;
            return LyricsErrors.unauthorized();
          }

          try {
            const widget = await LyricsService.updateSettings(
              auth.userId,
              body.settings
            );
            return widget.lyrics_settings;
          } catch (error) {
            set.status = LyricsErrors.settingsError(error).statusCode;
            return LyricsErrors.settingsError(error);
          }
        },
        {
          body: UpdateSettingsBody,
          response: t.Union([t.Null(), t.Unknown()]),
        }
      )
  );
