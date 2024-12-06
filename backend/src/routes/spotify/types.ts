import { t } from "elysia";

// Common headers schema
export const AuthHeaders = t.Object({
  "x-user-id": t.String(),
});

// Common response types
export const ErrorResponse = t.Object({
  error: t.String(),
});

// Track related types
export const TrackData = t.Object({
  isPlaying: t.Boolean(),
  title: t.String(),
  artist: t.String(),
  songUrl: t.String(),
  album: t.String(),
  artwork: t.Optional(t.String()),
  duration: t.Number(),
  elapsed: t.Number(),
  progress: t.Number(),
  id: t.String(),
});

export const TrackResponse = t.Object({
  success: t.Boolean(),
  data: t.Optional(TrackData),
});

// Canvas related types
export const CanvasResponse = t.Object({
  success: t.Boolean(),
  videoLink: t.Optional(t.String()),
});

// Lyrics related types
export const LyricsLine = t.Object({
  startTimeMs: t.Number(),
  words: t.String(),
  endTimeMs: t.Union([t.Number(), t.Null()]),
});

export const LyricsResponse = t.Object({
  lyrics: t.Object({
    syncType: t.String(),
    lines: t.Array(LyricsLine),
    language: t.String(),
    provider: t.String(),
  }),
  colors: t.Object({
    background: t.String(),
    text: t.String(),
    highlightText: t.String(),
  }),
});

// Auth related types
export const StatusResponse = t.Object({
  success: t.Boolean(),
  isConnected: t.Boolean(),
});

// Playback related types
export const CurrentTrackResponse = t.Object({
  success: t.Boolean(),
  data: t.Any(), // Using Any since currentlyPlayingTrack response is external
});

export const StartResponse = t.Object({
  success: t.Boolean(),
  message: t.Optional(t.String()),
});

export type RouteContext<T = unknown> = {
  body: unknown;
  query: T;
  params: Record<string, string>;
  headers: Record<string, string | undefined>;
  set: {
    status: number;
    headers: Record<string, string>;
    redirect: string;
  };
};
