import { Elysia, t } from "elysia";
import { SpotifyLyricsService } from "../services/spotify-lyrics.service";

const lyricsService = new SpotifyLyricsService();

export const lyricsRoutes = new Elysia({ prefix: "/lyrics" }).get(
  "/:trackId",
  async ({ params }) => {
    try {
      const lyrics = await lyricsService.getLyrics(params.trackId);
      return { success: true, data: lyrics };
    } catch (error) {
      return { success: false, error: "Failed to fetch lyrics" };
    }
  },
  {
    params: t.Object({
      trackId: t.String(),
    }),
    response: {
      200: t.Object({
        success: t.Boolean(),
        data: t.Optional(t.Any()),
      }),
      400: t.Object({
        success: t.Literal(false),
        error: t.String(),
      }),
    },
    detail: {
      summary: "Get lyrics for a Spotify track",
      tags: ["Lyrics"],
    },
  }
);
