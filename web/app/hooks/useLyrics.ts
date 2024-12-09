import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@clerk/tanstack-start";
import { SpotifyTrack } from "@/types/spotify";
import { profanity } from "@2toad/profanity";
import { supabase } from "@/utils/supabase/client";
import { RealtimeChannel } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

interface UseLyricsProps {
  track?: SpotifyTrack | null;
  settings?: any;
  onError?: (error: Error) => void;
}

export type LyricsLine = {
  startTimeMs: number;
  words: string;
};

type VisualizerWidget = Database["public"]["Tables"]["VisualizerWidget"]["Row"];

export const useLyrics = ({
  track: initialTrack,
  settings,
}: UseLyricsProps = {}) => {
  const { userId, getToken, isLoaded } = useAuth();
  const [track, setTrack] = useState<SpotifyTrack | null>(initialTrack || null);
  const [lyrics, setLyrics] = useState<LyricsLine[] | null>(null);
  const [isLyricsLoading, setIsLyricsLoading] = useState(false);
  const [lyricsError, setLyricsError] = useState<string | null>(null);
  const [noLyricsAvailable, setNoLyricsAvailable] = useState(false);
  const [isUnauthorized, setIsUnauthorized] = useState(false);
  const [isTokenSet, setIsTokenSet] = useState(false);
  const channelRef = useRef<RealtimeChannel | null>(null);

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
          `${import.meta.env.VITE_ELYSIA_API_URL}/api/spotify/lyrics/${trackId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("Lyrics response:", response);

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

  const fetchInitialTrackData = useCallback(async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from("VisualizerWidget")
        .select("track")
        .eq("user_id", userId)
        .single();

      if (error) throw error;

      if (data?.track) {
        let trackString =
          typeof data.track === "string"
            ? data.track
            : JSON.stringify(data.track);

        trackString = trackString
          .replace(/\bNaN\b/g, "null")
          .replace(/\bbars\b(?=\s*:)/g, '"bars"')
          .replace(/\bbeats\b(?=\s*:)/g, '"beats"')
          .replace(/\bsections\b(?=\s*:)/g, '"sections"')
          .replace(/\btempo\b(?=\s*:)/g, '"tempo"')
          .replace(/\btime_signature\b(?=\s*:)/g, '"time_signature"');

        const trackData = JSON.parse(trackString);
        if (trackData && trackData.id) {
          setTrack(trackData);
        }
      }
    } catch (error) {
      console.error("Error fetching initial track data:", error);
    }
  }, [userId]);

  useEffect(() => {
    if (!isLoaded) return;
    if (!userId) {
      console.log("No userId available for Supabase subscription");
      return;
    }

    console.log("Setting up Supabase subscription for user:", userId);
    fetchInitialTrackData();

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
          console.log("Received Supabase payload:", payload);
          const { new: newData } = payload;

          if (newData?.track) {
            try {
              let trackString =
                typeof newData.track === "string"
                  ? newData.track
                  : JSON.stringify(newData.track);

              trackString = trackString
                .replace(/\bNaN\b/g, "null")
                .replace(/\bbars\b(?=\s*:)/g, '"bars"')
                .replace(/\bbeats\b(?=\s*:)/g, '"beats"')
                .replace(/\bsections\b(?=\s*:)/g, '"sections"')
                .replace(/\btempo\b(?=\s*:)/g, '"tempo"')
                .replace(/\btime_signature\b(?=\s*:)/g, '"time_signature"');

              console.log("Preprocessed track string:", trackString);

              const trackData = JSON.parse(trackString);

              if (!trackData || typeof trackData !== "object") {
                console.warn("Invalid track data received:", trackData);
                return;
              }

              if (!trackData.id) {
                console.warn("Track data missing ID:", trackData);
                return;
              }

              setTrack(trackData);
            } catch (error) {
              console.error("Error parsing track data:", error);
              console.error("Failed to parse string:", newData.track);
            }
          }
        }
      )
      .subscribe((status) => {
        console.log("Supabase subscription status:", status);
        channelRef.current = channel;
      });

    return () => {
      console.log("Cleaning up Supabase subscription");
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [userId, isLoaded, fetchInitialTrackData]);

  useEffect(() => {
    if (!isLoaded || !userId) return;

    if (track?.id) {
      console.log("Fetching lyrics for track:", track.id);
      fetchLyrics(track.id);
    } else {
      console.log("No track ID available, clearing lyrics state");
      setNoLyricsAvailable(true);
      setLyrics(null);
      setLyricsError(null);
      setIsUnauthorized(false);
    }
  }, [track?.id, fetchLyrics, isLoaded, userId]);

  return {
    track,
    lyrics,
    isLyricsLoading,
    lyricsError,
    noLyricsAvailable,
    isUnauthorized,
    isTokenSet,
    isSessionReady: isLoaded && !!userId,
    formatColor,
    censorExplicitContent,
    truncateText,
    getTextStyle,
  };
};
