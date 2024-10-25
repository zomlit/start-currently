import React, { useEffect, useState, useRef, useCallback } from "react";
import { createFileRoute, useParams } from "@tanstack/react-router";
import { SpotifyTrack } from "@/types/spotify";
import { useAuth } from "@clerk/tanstack-start";
import { supabase } from "@/utils/supabase/client";
import { useLyricsStore } from "@/store/lyricsStore";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useDebouncedCallback } from "use-debounce";
import { Spinner } from "@/components/ui/spinner";
import { useDynamicColors } from "@/hooks/useDynamicColors";
import { useBackgroundVideo } from "@/hooks/useBackgroundVideo";
import {
  LyricsSettingsForm,
  LyricsSettings,
  lyricsSchema,
} from "@/components/widget-settings/LyricsSettingsForm";
import { toast } from "@/utils/toast";

// Add this utility function at the top of your file
const formatColor = (color: string) => {
  if (color.startsWith("rgba")) {
    return color;
  }
  if (color.startsWith("#")) {
    // Convert hex to rgba
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, 1)`;
  }
  return color; // Return as is if it's a named color
};

export const Route = createFileRoute("/_lyrics/lyrics/")({
  component: LyricsPage,
});

function LyricsPage() {
  const { username } = useParams({ from: "/_lyrics/lyrics/$username" });
  const { userId } = useAuth();
  const [publicUrl, setPublicUrl] = useState("");
  const [currentTrack, setCurrentTrack] = useState<SpotifyTrack | null>(null);
  const [lyrics, setLyrics] = useState<
    { startTimeMs: number; words: string }[] | null
  >(null);
  const [isLyricsLoading, setIsLyricsLoading] = useState(false);
  const [lyricsError, setLyricsError] = useState<string | null>(null);
  const lyricsRef = useRef<HTMLDivElement>(null);
  const [fontFamilies, setFontFamilies] = useState<string[]>([]);
  const [loadedFonts, setLoadedFonts] = useState<Set<string>>(new Set());
  const [isFontLoading, setIsFontLoading] = useState(false);

  const { settings, updateSettings } = useLyricsStore();
  const videoLink = useBackgroundVideo(currentTrack?.id);

  const debouncedUpdateSettings = useDebouncedCallback(
    (newSettings: Partial<LyricsSettings>) => {
      updateSettings(newSettings);
    },
    300
  );

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

  useEffect(() => {
    if (settings.fontFamily) {
      injectFont(settings.fontFamily);
    }
  }, [settings.fontFamily, injectFont]);

  useEffect(() => {
    const fetchFonts = async () => {
      if (fontFamilies.length === 0) {
        setIsFontLoading(true);
        try {
          const response = await fetch(
            `https://www.googleapis.com/webfonts/v1/webfonts?key=${import.meta.env.VITE_PUBLIC_GOOGLE_FONTS_API_KEY}&sort=popularity`
          );
          const data = await response.json();
          setFontFamilies(
            data.items.slice(0, 100).map((font: any) => font.family)
          );
        } catch (error) {
          console.error("Error fetching fonts:", error);
        } finally {
          setIsFontLoading(false);
        }
      }
    };
    fetchFonts();
  }, [fontFamilies.length]);

  const fetchLyrics = useCallback(async (trackId: string) => {
    setIsLyricsLoading(true);
    setLyricsError(null);
    try {
      const response = await fetch(
        `http://localhost:3001/v1/lyrics/${trackId}`
      );
      if (!response.ok) {
        throw new Error(`Failed to fetch lyrics: ${response.statusText}`);
      }
      const data = await response.json();

      if (data.lyrics && Array.isArray(data.lyrics.lines)) {
        setLyrics(data.lyrics.lines);
      } else {
        throw new Error("Invalid lyrics format");
      }
    } catch (error) {
      setLyricsError(
        error instanceof Error ? error.message : "An error occurred"
      );
    } finally {
      setIsLyricsLoading(false);
    }
  }, []);

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
          if (newData && newData.track) {
            const trackData =
              typeof newData.track === "string"
                ? JSON.parse(newData.track)
                : newData.track;
            setCurrentTrack(trackData);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  useEffect(() => {
    if (currentTrack?.id) {
      fetchLyrics(currentTrack.id);
    }
  }, [currentTrack?.id, fetchLyrics]);

  useEffect(() => {
    if (lyrics && currentTrack && lyricsRef.current) {
      const scrollToCurrentLyric = () => {
        const currentTime = currentTrack.elapsed || 0;
        const currentLineIndex = lyrics.findIndex(
          (line, index, arr) =>
            currentTime >= line.startTimeMs &&
            (index === arr.length - 1 ||
              currentTime < arr[index + 1].startTimeMs)
        );

        if (currentLineIndex !== -1 && lyricsRef.current) {
          const lyricsContainer = lyricsRef.current;
          const currentLineElement = lyricsContainer.children[
            currentLineIndex
          ] as HTMLElement;

          if (currentLineElement) {
            const containerHeight = lyricsContainer.clientHeight;
            const lineTop = currentLineElement.offsetTop;
            const lineHeight = currentLineElement.clientHeight;

            const scrollPosition =
              lineTop - containerHeight / 2 + lineHeight / 2;

            lyricsContainer.scrollTo({
              top: scrollPosition,
              behavior: "smooth",
            });
          }
        }
      };

      const intervalId = setInterval(scrollToCurrentLyric, 100);

      return () => clearInterval(intervalId);
    }
  }, [lyrics, currentTrack]);

  const handleCopyPublicUrl = useCallback(() => {
    const url = window.location.origin + window.location.pathname;
    navigator.clipboard
      .writeText(url)
      .then(() => {
        toast.success("Public URL copied to clipboard");
      })
      .catch((err) => {
        console.error("Failed to copy URL to clipboard:", err);
        toast.error("Failed to copy URL to clipboard");
      });
  }, []);

  const handleSettingChange = useCallback(
    (newSettings: Partial<LyricsSettings>) => {
      debouncedUpdateSettings(newSettings);
    },
    [debouncedUpdateSettings]
  );

  const getTextStyle = (isCurrentLine: boolean) => ({
    color: formatColor(
      isCurrentLine ? settings.currentTextColor : settings.textColor
    ),
    fontSize: `${isCurrentLine ? settings.fontSize * settings.currentLineScale : settings.fontSize}px`,
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
    textShadow: `${settings.textShadowOffsetX}px ${settings.textShadowOffsetY}px ${settings.textShadowBlur}px ${formatColor(settings.textShadowColor)}`,
    transition: `all ${settings.animationSpeed}ms ${settings.animationEasing}`,
    ...(settings.glowEffect
      ? {
          filter: `drop-shadow(0 0 ${settings.glowIntensity}px ${formatColor(settings.glowColor)})`,
        }
      : {}),
  });

  return (
    <div className="h-screen w-full">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={80} minSize={50}>
          <div
            className="h-full overflow-hidden relative"
            style={{
              backgroundColor: settings.greenScreenMode
                ? "#00FF00"
                : formatColor(settings.backgroundColor),
              padding: `${settings.padding}px`,
            }}
          >
            {settings.showVideoCanvas && videoLink && (
              <video
                src={videoLink}
                className="absolute top-0 left-0 w-full h-full object-cover"
                style={{ opacity: settings.videoCanvasOpacity }}
                autoPlay
                loop
                muted
                playsInline
              />
            )}
            {settings.showFade && !settings.greenScreenMode && (
              <>
                <div className="absolute z-40 top-0 left-0 right-0 h-16 bg-gradient-to-b from-black to-transparent pointer-events-none" />
                <div className="absolute z-40 bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black to-transparent pointer-events-none" />
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
              ) : (
                lyrics?.map((line, index, arr) => {
                  const isCurrentLine =
                    (currentTrack?.elapsed || 0) >= line.startTimeMs - 1000 &&
                    (index === arr.length - 1 ||
                      (currentTrack?.elapsed || 0) <
                        arr[index + 1].startTimeMs - 1000);

                  return (
                    <p
                      key={index}
                      className="transition-all duration-300"
                      style={getTextStyle(isCurrentLine)}
                    >
                      {line.words}
                    </p>
                  );
                })
              )}
            </div>
          </div>
        </ResizablePanel>
        <ResizableHandle />
        {lyrics && (
          <ResizablePanel defaultSize={20} minSize={15}>
            <div className="h-full overflow-y-auto p-6 bg-white/10">
              <h3 className="text-lg font-bold mb-6">Customize Lyrics Panel</h3>
              <LyricsSettingsForm
                settings={settings}
                onSettingsChange={handleSettingChange}
                publicUrl={publicUrl}
                onCopyPublicUrl={handleCopyPublicUrl}
                fontFamilies={fontFamilies}
                isFontLoading={isFontLoading}
                injectFont={injectFont}
                isVideoAvailable={!!videoLink}
              />
            </div>
          </ResizablePanel>
        )}
      </ResizablePanelGroup>
    </div>
  );
}

export default LyricsPage;
