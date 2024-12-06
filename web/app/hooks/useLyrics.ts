import { useState, useEffect, useCallback, useRef } from "react";
import { useElysiaSessionContext } from "@/contexts/ElysiaSessionContext";
import { SpotifyTrack } from "@/types/spotify";
import { profanity } from "@2toad/profanity";
import { usePlaybackPolling } from "@/store/playbackStore";

interface UseLyricsProps {
  settings?: any;
  onError?: (error: Error) => void;
}

interface LyricsLine {
  startTimeMs: number;
  words: string;
}

export const useLyrics = ({ settings }: UseLyricsProps = {}) => {
  const { isSessionActive, sessionStatus } = useElysiaSessionContext();
  const { track } = usePlaybackPolling();
  const [lyrics, setLyrics] = useState<LyricsLine[] | null>(null);
  const [isLyricsLoading, setIsLyricsLoading] = useState(false);
  const [lyricsError, setLyricsError] = useState<string | null>(null);
  const [noLyricsAvailable, setNoLyricsAvailable] = useState(false);

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

  // Fetch lyrics when track changes
  useEffect(() => {
    if (!track?.id) return;

    const fetchLyrics = async () => {
      setIsLyricsLoading(true);
      try {
        const response = await fetch(
          `${import.meta.env.VITE_ELYSIA_API_URL}/api/spotify/lyrics/${track.id}`
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch lyrics: ${response.statusText}`);
        }

        const data = await response.json();
        if (data.lyrics?.lines?.length > 0) {
          setLyrics(data.lyrics.lines);
        } else {
          setNoLyricsAvailable(true);
          setLyrics(null);
        }
      } catch (error) {
        console.error("Error fetching lyrics:", error);
        setLyricsError(
          error instanceof Error ? error.message : "An error occurred"
        );
      } finally {
        setIsLyricsLoading(false);
      }
    };

    fetchLyrics();
  }, [track?.id]);

  return {
    track,
    lyrics,
    isLyricsLoading,
    lyricsError,
    noLyricsAvailable,
    isSessionReady: isSessionActive && sessionStatus.spotify.isConnected,
    formatColor,
    censorExplicitContent,
    truncateText,
    getTextStyle,
  };
};
