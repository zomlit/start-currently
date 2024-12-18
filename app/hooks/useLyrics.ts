import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/tanstack-start";
import { SpotifyTrack } from "@/types/spotify";
import { profanity } from "@2toad/profanity";
import { supabase } from "@/utils/supabase/client";

interface UseLyricsProps {
  track?: SpotifyTrack | null;
  settings?: any;
  onError?: (error: Error) => void;
}

interface LyricsLine {
  startTimeMs: number;
  words: string;
}

export const useLyrics = ({
  track: initialTrack,
  settings,
}: UseLyricsProps = {}) => {
  const { userId, getToken } = useAuth();
  const [track, setTrack] = useState<SpotifyTrack | null>(initialTrack || null);
  const [lyrics, setLyrics] = useState<LyricsLine[] | null>(null);
  const [isLyricsLoading, setIsLyricsLoading] = useState(false);
  const [lyricsError, setLyricsError] = useState<string | null>(null);
  const [noLyricsAvailable, setNoLyricsAvailable] = useState(false);
  const [isUnauthorized, setIsUnauthorized] = useState(false);
  const [isTokenSet, setIsTokenSet] = useState(false);

  const formatColor = useCallback((color: any): string => {
    if (!color) return "rgba(0, 0, 0, 1)";

    if (
      typeof color === "object" &&
      color !== null &&
      typeof color.hex === "string"
    ) {
      color = color.hex;
    }

    if (typeof color !== "string") {
      return "rgba(0, 0, 0, 1)";
    }

    if (color.startsWith("rgba")) return color;

    if (color.startsWith("#")) {
      try {
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        if (isNaN(r) || isNaN(g) || isNaN(b)) {
          return "rgba(0, 0, 0, 1)";
        }
        return `rgba(${r}, ${g}, ${b}, 1)`;
      } catch (e) {
        return "rgba(0, 0, 0, 1)";
      }
    }

    return color;
  }, []);

  const censorExplicitContent = useCallback((text: string): string => {
    return profanity.censor(text);
  }, []);

  const truncateText = useCallback(
    (text: string, maxWidth: number, fontSize: number, fontFamily: string) => {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      if (!context) return text;

      context.font = `${fontSize}px ${fontFamily}, 'Sofia Sans Condensed', sans-serif`;

      if (context.measureText(text).width <= maxWidth) {
        return text;
      }

      let truncated = text;
      while (context.measureText(truncated + "...").width > maxWidth) {
        truncated = truncated.slice(0, -1);
      }
      return truncated + "...";
    },
    []
  );

  const getTextStyle = useCallback(
    (isCurrentLine: boolean) => {
      if (!settings) return {};

      const safeFormatColor = (color: any): string => {
        if (!color) return "rgba(0, 0, 0, 1)";

        if (
          typeof color === "object" &&
          color !== null &&
          typeof color.hex === "string"
        ) {
          color = color.hex;
        }

        if (typeof color !== "string") {
          return "rgba(0, 0, 0, 1)";
        }

        if (color.startsWith("rgba")) return color;
        if (color.startsWith("#")) {
          try {
            const r = parseInt(color.slice(1, 3), 16);
            const g = parseInt(color.slice(3, 5), 16);
            const b = parseInt(color.slice(5, 7), 16);
            if (isNaN(r) || isNaN(g) || isNaN(b)) {
              return "rgba(0, 0, 0, 1)";
            }
            return `rgba(${r}, ${g}, ${b}, 1)`;
          } catch (e) {
            return "rgba(0, 0, 0, 1)";
          }
        }
        return color;
      };

      return {
        color: safeFormatColor(
          isCurrentLine ? settings.currentTextColor : settings.textColor
        ),
        fontSize: `${
          isCurrentLine
            ? settings.fontSize * settings.currentLineScale
            : settings.fontSize
        }px`,
        fontWeight: isCurrentLine ? "bold" : "normal",
        transform: isCurrentLine
          ? `scale(${settings.currentLineScale})`
          : "scale(1)",
        transformOrigin:
          settings.textAlign === "left"
            ? "left center"
            : settings.textAlign === "right"
              ? "right center"
              : "center center",
        lineHeight: settings.lineHeight,
        textAlign: settings.textAlign,
        textShadow: `${settings.textShadowOffsetX}px ${settings.textShadowOffsetY}px ${settings.textShadowBlur}px ${safeFormatColor(settings.textShadowColor)}`,
        transition: `all ${settings.animationSpeed}ms ${settings.animationEasing}`,
        ...(settings.glowEffect
          ? {
              filter: `drop-shadow(0 0 ${settings.glowIntensity}px ${safeFormatColor(
                settings.glowColor
              )})`,
            }
          : {}),
      };
    },
    [settings]
  );

  const fetchLyrics = useCallback(
    async (trackId: string) => {
      console.log("Fetching lyrics for track:", trackId);
      setIsLyricsLoading(true);
      setLyricsError(null);
      setNoLyricsAvailable(false);
      setIsUnauthorized(false);
      try {
        const token = await getToken({ template: "lstio" });
        if (!token) throw new Error("No authorization token available");

        const response = await fetch(
          `${import.meta.env.VITE_ELYSIA_API_URL}/lyrics/${trackId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status === 401) {
          setIsUnauthorized(true);
          setIsTokenSet(false);
          throw new Error("Unauthorized: Spotify token required");
        }

        if (!response.ok) {
          throw new Error(`Failed to fetch lyrics: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Lyrics data:", data);

        if (
          data.lyrics &&
          Array.isArray(data.lyrics.lines) &&
          data.lyrics.lines.length > 0
        ) {
          setLyrics(data.lyrics.lines);
          setIsTokenSet(true);
        } else {
          setNoLyricsAvailable(true);
          setLyrics(null);
        }
      } catch (error) {
        console.error("Error fetching lyrics:", error);
        setLyricsError(
          error instanceof Error ? error.message : "An error occurred"
        );
        setNoLyricsAvailable(true);
        setLyrics(null);
      } finally {
        setIsLyricsLoading(false);
      }
    },
    [getToken]
  );

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`public:VisualizerWidget:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "VisualizerWidget",
          filter: `user_id=eq.${userId}`,
        },
        (payload: any) => {
          const { new: newData } = payload;
          if (newData?.track) {
            try {
              const trackData =
                typeof newData.track === "string"
                  ? JSON.parse(newData.track.replace(/\bNaN\b/g, "null"))
                  : newData.track;

              console.log("Track data received:", trackData);
              setTrack(trackData);
            } catch (error) {
              console.error("Error parsing track data:", error);
              console.log("Raw track data:", newData.track);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  useEffect(() => {
    console.log("Track data in useLyrics:", {
      id: track?.id,
      elapsed: track?.elapsed,
      track,
    });
    if (track?.id) {
      fetchLyrics(track.id);
    } else {
      setNoLyricsAvailable(true);
      setLyrics(null);
    }
  }, [track?.id, fetchLyrics]);

  return {
    track,
    lyrics,
    isLyricsLoading,
    lyricsError,
    noLyricsAvailable,
    isUnauthorized,
    isTokenSet,
    formatColor,
    censorExplicitContent,
    truncateText,
    getTextStyle,
  };
};
