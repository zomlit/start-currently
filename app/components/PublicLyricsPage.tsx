import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useParams } from "@tanstack/react-router";
import { supabase } from "@/utils/supabase/client";
import { SpotifyTrack } from "@/types/spotify";
import { Spinner } from "@/components/ui/spinner";
import { useLyricsStore } from "@/store/lyricsStore";
import { profanity } from "@2toad/profanity";
import { defaultLyricsSettings } from "@/routes/_lyrics/lyrics.index";
import { Loader2 } from "lucide-react";
import { LyricsDisplay } from "@/components/lyrics/LyricsDisplay";

// Utility functions
const formatColor = (color: string) => {
  if (color.startsWith("rgba")) return color;
  if (color.startsWith("#")) {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, 1)`;
  }
  return color;
};

const censorExplicitContent = (text: string): string => {
  return profanity.censor(text);
};

const truncateText = (
  text: string,
  maxWidth: number,
  fontSize: number,
  fontFamily: string
) => {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) return text;

  context.font = `${fontSize}px ${fontFamily}, sans-serif`;

  if (context.measureText(text).width <= maxWidth) {
    return text;
  }

  let truncated = text;
  while (context.measureText(truncated + "...").width > maxWidth) {
    truncated = truncated.slice(0, -1);
  }
  return truncated + "...";
};

export function PublicLyricsPage() {
  const { username } = useParams({ from: "/$username/lyrics" });
  const [currentTrack, setCurrentTrack] = useState<SpotifyTrack | null>(null);
  const [lyrics, setLyrics] = useState<{ startTimeMs: number; words: string }[] | null>(null);
  const [isLyricsLoading, setIsLyricsLoading] = useState(false);
  const [noLyricsAvailable, setNoLyricsAvailable] = useState(false);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const lyricsRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [loadedFonts, setLoadedFonts] = useState<Set<string>>(new Set());
  const [userId, setUserId] = useState<string | null>(null);
  const { settings, loadPublicSettings } = useLyricsStore();
  const [currentLyrics, setCurrentLyrics] = useState<string[]>([]);
  const [currentLine, setCurrentLine] = useState(0);

  // Font injection callback
  const injectFont = useCallback(
    (fontFamily: string) => {
      if (!loadedFonts.has(fontFamily)) {
        const link = document.createElement("link");
        link.href = `https://fonts.googleapis.com/css?family=${fontFamily.replace(/ /g, "+")}`;
        link.rel = "stylesheet";
        document.head.appendChild(link);
        setLoadedFonts((prev) => new Set(prev).add(fontFamily));
      }
    },
    [loadedFonts]
  );

  // Settings loading effect
  useEffect(() => {
    async function loadUserAndSettings() {
      if (!username) return;
      try {
        await loadPublicSettings(username);
      } catch (error) {
        console.error('Error loading settings:', error);
      } finally {
        setIsLoadingSettings(false);
      }
    }

    loadUserAndSettings();
  }, [username, loadPublicSettings]);

  // Add font effect
  useEffect(() => {
    if (settings.fontFamily) {
      injectFont(settings.fontFamily);
    }
  }, [settings.fontFamily, injectFont]);

  // Add user ID and subscription effect
  useEffect(() => {
    const fetchUserIdAndSubscribe = async () => {
      try {
        const { data, error } = await supabase
          .from("UserProfile")
          .select("user_id")
          .eq("username", username)
          .single();

        if (error) throw error;

        setUserId(data.user_id);

        const channel = supabase
          .channel(`public:VisualizerWidget:${data.user_id}`)
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "VisualizerWidget",
              filter: `user_id=eq.${data.user_id}`,
            },
            (payload: any) => {
              const { new: newData } = payload;
              if (newData?.track) {
                const trackData = typeof newData.track === "string"
                  ? JSON.parse(newData.track)
                  : newData.track;
                setCurrentTrack(trackData);
              }
              if (newData?.lyrics_settings) {
                loadPublicSettings(username, newData.lyrics_settings);
              }
            }
          )
          .subscribe();

        return () => {
          supabase.removeChannel(channel);
        };
      } catch (error) {
        console.error("Error fetching user ID:", error);
      }
    };

    fetchUserIdAndSubscribe();
  }, [username, loadPublicSettings]);

  // Add lyrics fetching effect
  useEffect(() => {
    const fetchLyrics = async (trackId: string) => {
      setIsLyricsLoading(true);
      setNoLyricsAvailable(false);
      try {
        const response = await fetch(
          `${import.meta.env.VITE_ELYSIA_API_URL}/lyrics/${trackId}`,
          {
            headers: {
              "X-User-ID": userId || "",
            },
          }
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
        setNoLyricsAvailable(true);
        setLyrics(null);
      } finally {
        setIsLyricsLoading(false);
      }
    };

    if (currentTrack?.id && userId) {
      fetchLyrics(currentTrack.id);
    } else {
      setNoLyricsAvailable(true);
      setLyrics(null);
    }
  }, [currentTrack?.id, userId]);

  // Optimize scrolling with debounce
  const scrollToCurrentLyric = useCallback(() => {
    if (!lyrics || !currentTrack || !lyricsRef.current) return;

    const currentTime = currentTrack.elapsed || 0;
    const currentLineIndex = lyrics.findIndex(
      (line, index, arr) =>
        currentTime >= line.startTimeMs &&
        (index === arr.length - 1 || currentTime < arr[index + 1].startTimeMs)
    );

    if (currentLineIndex === -1 || !lyricsRef.current) return;

    const lyricsContainer = lyricsRef.current;
    const currentLineElement = lyricsContainer.children[currentLineIndex + 1] as HTMLElement;

    if (!currentLineElement) return;

    const containerHeight = lyricsContainer.clientHeight;
    const lineHeight = currentLineElement.clientHeight;
    const scrollPosition = currentLineElement.offsetTop - containerHeight / 2 + lineHeight / 2;

    // Use requestAnimationFrame for smooth scrolling
    requestAnimationFrame(() => {
      lyricsContainer.scrollTo({
        top: scrollPosition,
        behavior: "smooth",
      });
    });
  }, [lyrics, currentTrack]);

  // Optimize lyrics scrolling effect
  useEffect(() => {
    if (!lyrics || !currentTrack) return;

    const intervalId = setInterval(scrollToCurrentLyric, 250); // Reduced from 100ms to 250ms
    return () => clearInterval(intervalId);
  }, [lyrics, currentTrack, scrollToCurrentLyric]);

  // Optimize container width updates
  useEffect(() => {
    const updateContainerWidth = () => {
      if (!lyricsRef.current) return;
      
      requestAnimationFrame(() => {
        setContainerWidth(lyricsRef.current?.offsetWidth || 0);
      });
    };

    updateContainerWidth();

    // Debounce resize handler
    let timeoutId: NodeJS.Timeout;
    const debouncedResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateContainerWidth, 250);
    };

    window.addEventListener("resize", debouncedResize);
    return () => {
      window.removeEventListener("resize", debouncedResize);
      clearTimeout(timeoutId);
    };
  }, []);

  // Memoize text style calculation
  const getTextStyle = useCallback((isCurrentLine: boolean) => ({
    color: formatColor(isCurrentLine ? settings.currentTextColor : settings.textColor),
    fontSize: `${isCurrentLine ? settings.fontSize * settings.currentLineScale : settings.fontSize}px`,
    fontWeight: isCurrentLine ? "bold" : "normal",
    transform: isCurrentLine ? `scale(${settings.currentLineScale})` : "scale(1)",
    transformOrigin: settings.textAlign === "left" ? "left center" : 
                    settings.textAlign === "right" ? "right center" : "center center",
    lineHeight: settings.lineHeight,
    textAlign: settings.textAlign,
    textShadow: `${settings.textShadowOffsetX}px ${settings.textShadowOffsetY}px ${settings.textShadowBlur}px ${formatColor(settings.textShadowColor)}`,
    transition: `all ${settings.animationSpeed}ms ${settings.animationEasing}`,
    ...(settings.glowEffect ? {
      filter: `drop-shadow(0 0 ${settings.glowIntensity}px ${formatColor(settings.glowColor)})`
    } : {}),
    fontFamily: `'${settings.fontFamily}', sans-serif`,
  }), [settings]);

  // Memoize lyrics rendering
  const renderedLyrics = useMemo(() => {
    if (!lyrics || !lyrics.length) return null;

    return lyrics.map((line, index, arr) => {
      const isCurrentLine =
        (currentTrack?.elapsed || 0) >= line.startTimeMs - 1000 &&
        (index === arr.length - 1 ||
          (currentTrack?.elapsed || 0) < arr[index + 1].startTimeMs - 1000);

      const displayedText = settings.hideExplicitContent
        ? censorExplicitContent(line.words)
        : line.words;

      const truncatedText = truncateText(
        displayedText,
        containerWidth - settings.padding * 2,
        isCurrentLine ? settings.fontSize * settings.currentLineScale : settings.fontSize,
        settings.fontFamily
      );

      return (
        <p
          key={index}
          className="transition-all duration-300"
          style={getTextStyle(isCurrentLine)}
        >
          {truncatedText}
        </p>
      );
    });
  }, [lyrics, currentTrack?.elapsed, settings, containerWidth, getTextStyle]);

  if (isLoadingSettings) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner className="w-8 h-8" />
      </div>
    );
  }

  return (
    <div
      className="h-screen w-full overflow-hidden"
      style={{
        backgroundColor: settings.greenScreenMode ? "#00FF00" : formatColor(settings.backgroundColor),
        padding: `${settings.padding}px`,
      }}
    >
      {settings.showFade && !settings.greenScreenMode && (
        <>
          <div
            className="absolute z-40 left-0 right-0 pointer-events-none"
            style={{
              top: `${settings.padding}px`,
              height: `${settings.fadeDistance}px`,
              background: `linear-gradient(to bottom, ${formatColor(settings.backgroundColor)}, rgba(0,0,0,0))`,
            }}
          />
          <div
            className="absolute z-40 left-0 right-0 pointer-events-none"
            style={{
              bottom: `${settings.padding}px`,
              height: `${settings.fadeDistance}px`,
              background: `linear-gradient(to top, ${formatColor(settings.backgroundColor)}, rgba(0,0,0,0))`,
            }}
          />
        </>
      )}
      <div
        ref={lyricsRef}
        className="h-full overflow-y-auto scrollbar-hide relative z-20"
        style={{
          fontFamily: `'${settings.fontFamily}', sans-serif`,
        }}
      >
        {isLyricsLoading ? (
          <div className="flex items-center justify-center h-full">
            <Spinner className="w-[30px] h-[30px]" />
          </div>
        ) : noLyricsAvailable ? (
          <div className="flex items-center justify-center h-full text-center text-gray-500">
            No lyrics available for this track
          </div>
        ) : lyrics && lyrics.length > 0 ? (
          <>
            <div style={{ height: "50vh" }}></div>
            {renderedLyrics}
            <div style={{ height: "50vh" }}></div>
          </>
        ) : null}
      </div>
    </div>
  );
}

export default PublicLyricsPage;
