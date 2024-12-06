import React, {
  useRef,
  useState,
  useCallback,
  useEffect,
  useMemo,
  lazy,
  Suspense,
} from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useLyricsStore } from "@/store/lyricsStore";
import { useLyrics, type LyricsLine } from "@/hooks/useLyrics";
import { useBackgroundVideo } from "@/hooks/useBackgroundVideo";
import { WidgetLayout } from "@/components/layouts/WidgetLayout";
import { LyricsSettingsForm } from "@/components/widget-settings/LyricsSettingsForm";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Copy } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useUser } from "@clerk/tanstack-start";
import { toast } from "@/utils/toast";
import { Dialog } from "@/components/ui/dialog";
import { SpotifyKeysDialog } from "@/components/SpotifyKeysDialog";
import _ from "lodash";
import { motion } from "framer-motion";
import { LyricsSettings } from "@/types/lyrics";
import { supabase } from "@/utils/supabase/client";
import { WidgetAuthGuard } from "@/components/auth/WidgetAuthGuard";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/widgets/lyrics")({
  component: () => (
    <WidgetAuthGuard>
      <LyricsSection />
    </WidgetAuthGuard>
  ),
});

// Update the PLACEHOLDER_LYRICS array near the top of the file
const PLACEHOLDER_LYRICS = [
  { startTimeMs: 0, words: "👋 Welcome to Lyrics Widget!" },
  { startTimeMs: 2000, words: "This is a preview of how lyrics will appear" },
  { startTimeMs: 4000, words: "When you connect your Spotify account" },
  { startTimeMs: 6000, words: "⚠️ Important: Spotify Premium is required ⚠️" },
  { startTimeMs: 8000, words: "The lyrics will scroll automatically" },
  { startTimeMs: 10000, words: "Just like you're seeing now" },
  { startTimeMs: 12000, words: "Each line will highlight as it plays" },
  { startTimeMs: 14000, words: "Making it easy to follow along" },
  { startTimeMs: 16000, words: "🎵 To get started:" },
  { startTimeMs: 18000, words: "1. Connect your Spotify Premium account" },
  { startTimeMs: 20000, words: "2. Add your Spotify lyrics token" },
  { startTimeMs: 22000, words: "3. Play a song on Spotify" },
  { startTimeMs: 24000, words: "Then watch as the magic happens!" },
  { startTimeMs: 26000, words: "✨ Your lyrics will appear here ✨" },
  { startTimeMs: 28000, words: "Synced perfectly with your music" },
];

type AnimationStyle = "scale" | "glow" | "slide" | "fade" | "bounce";

// Add this type for memoized variants
type AnimationVariants = {
  [key in AnimationStyle]: {
    initial: any;
    animate: (isCurrentLine: boolean) => any;
  };
};

// Move animation variants outside component to prevent recreation
const ANIMATION_VARIANTS: AnimationVariants = {
  scale: {
    initial: { scale: 1, opacity: 1 },
    animate: (isCurrentLine) => ({
      scale: isCurrentLine ? 1.15 : 1,
    }),
  },
  glow: {
    initial: { textShadow: "0 0 0px rgba(255,255,255,0)", opacity: 1 },
    animate: (isCurrentLine) => ({
      textShadow: isCurrentLine
        ? "0 0 20px rgba(255,255,255,0.8)"
        : "0 0 0px rgba(255,255,255,0)",
    }),
  },
  slide: {
    initial: { x: 0, opacity: 1 },
    animate: (isCurrentLine) => ({
      x: isCurrentLine ? 20 : 0,
    }),
  },
  fade: {
    initial: { opacity: 0.6 },
    animate: (isCurrentLine) => ({
      opacity: isCurrentLine ? 1 : 0.2,
    }),
  },
  bounce: {
    initial: { y: 0, opacity: 1 },
    animate: (isCurrentLine) => ({
      y: isCurrentLine ? -10 : 0,
    }),
  },
};

// Create a client-only wrapper for the color picker
const ClientOnlyColorPicker = lazy(() =>
  import("@uiw/react-color").then((mod) => ({
    default: mod.ChromePicker,
  }))
);

// Use Suspense to handle the lazy loading
const ColorPickerWrapper = (props: any) => {
  if (typeof window === "undefined") {
    return null; // Return null during SSR
  }

  return (
    <Suspense fallback={<div>Loading color picker...</div>}>
      <ClientOnlyColorPicker {...props} />
    </Suspense>
  );
};

function LyricsSection() {
  const { user } = useUser();
  const [isSpotifyTokenDialogOpen, setIsSpotifyTokenDialogOpen] =
    useState(false);
  const { settings, updateSettings } = useLyricsStore();
  const lyricsContainerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [publicUrl, setPublicUrl] = useState("");
  const [mockTime, setMockTime] = useState(0);
  const [hideExampleLyrics, setHideExampleLyrics] = useState(true);
  const [isVideoAvailable, setIsVideoAvailable] = useState(false);
  const [previewSettings, setPreviewSettings] =
    useState<LyricsSettings>(settings);

  const {
    track: currentTrack,
    lyrics,
    isLyricsLoading,
    noLyricsAvailable,
    isUnauthorized,
    isTokenSet,
    formatColor,
    censorExplicitContent,
    truncateText,
    getTextStyle,
  } = useLyrics({
    settings,
  });

  const videoLink = useBackgroundVideo(currentTrack?.id);

  // Move helper function inside component where formatColor is available
  const getBackgroundStyle = useCallback(
    (color: string) => {
      if (color.includes("gradient")) {
        return { backgroundImage: color };
      }
      return { backgroundColor: formatColor(color) };
    },
    [formatColor]
  );

  // Throttle container width updates more aggressively
  useEffect(() => {
    if (!lyricsContainerRef.current) return;

    const updateContainerWidth = () => {
      const newWidth = lyricsContainerRef.current?.offsetWidth || 0;
      if (Math.abs(newWidth - containerWidth) > 20) {
        // More tolerance
        setContainerWidth(newWidth);
      }
    };

    updateContainerWidth();

    const throttledResize = _.throttle(updateContainerWidth, 500);
    window.addEventListener("resize", throttledResize);

    return () => {
      window.removeEventListener("resize", throttledResize);
      throttledResize.cancel();
    };
  }, []);

  // Update public URL
  useEffect(() => {
    const updateUrl = () => {
      if (user?.username) {
        const formattedUrl = `${window.location.origin}/${user.username}/lyrics`;
        setPublicUrl(formattedUrl);
      }
    };

    updateUrl();
  }, [user?.username]);

  const handleCopyPublicUrl = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      if (user?.username) {
        const urlToCopy = `${window.location.origin}/${user.username}/lyrics`;
        navigator.clipboard
          .writeText(urlToCopy)
          .then(() => {
            toast.success({
              title: "Public URL copied to clipboard",
              description: urlToCopy,
            });
          })
          .catch((err) => {
            console.error("Failed to copy URL to clipboard:", err);
            toast.error({
              title: "Failed to copy URL to clipboard",
            });
          });
      }
    },
    [user?.username]
  );

  // Add this mock elapsed time for placeholder lyrics
  const mockElapsedTime = useMemo(() => {
    if (!lyrics?.length && !isLyricsLoading) {
      return {
        elapsed: mockTime,
      };
    }
    return currentTrack;
  }, [currentTrack, lyrics, isLyricsLoading, mockTime]);

  // Add this effect to handle the mock timing animation
  useEffect(() => {
    if (!lyrics?.length && !isLyricsLoading && !hideExampleLyrics) {
      let lastUpdateTime = 0;
      let frameId: number;

      const updateMockTime = (timestamp: number) => {
        if (timestamp - lastUpdateTime >= 16) {
          // Limit to ~60fps
          setMockTime((prev) => (prev + 16) % 30000);
          lastUpdateTime = timestamp;
        }
        frameId = requestAnimationFrame(updateMockTime);
      };

      frameId = requestAnimationFrame(updateMockTime);
      return () => cancelAnimationFrame(frameId);
    }
  }, [lyrics?.length, isLyricsLoading, hideExampleLyrics]);

  // Update the renderLyrics function
  const renderLyrics = useCallback(
    (lyrics: any[], isExample = false) => {
      return lyrics.map((line: any, index: number) => {
        const isCurrentLine = currentTrack?.elapsed
          ? currentTrack.elapsed >= line.startTimeMs &&
            (index === lyrics.length - 1 ||
              currentTrack.elapsed < lyrics[index + 1].startTimeMs)
          : false;

        return (
          <motion.div
            key={`${line.words}-${index}`}
            className={cn(
              "py-1",
              isExample && "opacity-50",
              !isExample &&
                "cursor-pointer hover:opacity-80 transition-opacity",
              previewSettings.textAlign === "left" && "text-left",
              previewSettings.textAlign === "center" && "text-center",
              previewSettings.textAlign === "right" && "text-right"
            )}
            style={{
              fontSize: `${previewSettings.fontSize}px`,
              lineHeight: `${previewSettings.lineHeight}`,
              color: isCurrentLine
                ? formatColor(previewSettings.currentTextColor)
                : formatColor(previewSettings.textColor),
              textShadow: previewSettings.glowEffect
                ? `0 0 ${previewSettings.glowIntensity}px ${formatColor(
                    previewSettings.glowColor
                  )}`
                : "none",
              transform: isCurrentLine
                ? `scale(${previewSettings.currentLineScale})`
                : "scale(1)",
              transformOrigin:
                previewSettings.textAlign === "left"
                  ? "left center"
                  : previewSettings.textAlign === "right"
                    ? "right center"
                    : "center center",
            }}
            initial="initial"
            animate="animate"
            variants={ANIMATION_VARIANTS[previewSettings.animationStyle]}
            custom={isCurrentLine}
            transition={{
              duration: previewSettings.animationSpeed / 1000,
              ease: previewSettings.animationEasing,
            }}
          >
            {line.words}
          </motion.div>
        );
      });
    },
    [previewSettings, currentTrack?.elapsed, formatColor, ANIMATION_VARIANTS]
  );

  // Update the scrolling effect
  useEffect(() => {
    if (!lyricsContainerRef.current) return;

    const lyricsToUse = lyrics?.length ? lyrics : PLACEHOLDER_LYRICS;
    const isPlaceholder = !lyrics?.length;
    let frameId: number;
    let lastScrollTime = 0;

    const scrollToCurrentLyric = () => {
      const now = performance.now();
      if (now - lastScrollTime < 100) {
        frameId = requestAnimationFrame(scrollToCurrentLyric);
        return;
      }

      const currentTime = isPlaceholder ? mockTime : currentTrack?.elapsed || 0;
      const currentLineIndex = lyricsToUse.findIndex(
        (line, index) =>
          currentTime >= line.startTimeMs &&
          currentTime < (lyricsToUse[index + 1]?.startTimeMs ?? Infinity)
      );

      const lyricsContainer = lyricsContainerRef.current;
      if (currentLineIndex === -1 || !lyricsContainer) {
        frameId = requestAnimationFrame(scrollToCurrentLyric);
        return;
      }

      // Get all lyric elements (p tags)
      const lyricElements = Array.from(lyricsContainer.querySelectorAll("p"));
      const currentLineElement = lyricElements[currentLineIndex];

      if (currentLineElement) {
        const containerHeight = lyricsContainer.clientHeight;
        const lineHeight = currentLineElement.offsetHeight;
        const lineTop = currentLineElement.offsetTop;

        // Calculate the target scroll position to keep the current line centered
        const targetScrollPosition =
          lineTop - containerHeight / 2 + lineHeight / 2;

        // Apply the scroll with smooth behavior
        lyricsContainer.scrollTo({
          top: Math.max(0, targetScrollPosition),
          behavior: "smooth",
        });

        lastScrollTime = now;
      }

      frameId = requestAnimationFrame(scrollToCurrentLyric);
    };

    frameId = requestAnimationFrame(scrollToCurrentLyric);
    return () => cancelAnimationFrame(frameId);
  }, [lyrics, currentTrack?.elapsed, mockTime]);

  // Add font loading logic
  const [fontFamilies, setFontFamilies] = useState<string[]>([]);
  const [loadedFonts, setLoadedFonts] = useState<Set<string>>(new Set());
  const [isFontLoading, setIsFontLoading] = useState(false);

  // Add font loading effect
  useEffect(() => {
    const fetchFonts = async () => {
      if (fontFamilies.length === 0) {
        setIsFontLoading(true);
        try {
          const response = await fetch(
            `https://www.googleapis.com/webfonts/v1/webfonts?key=${
              import.meta.env.VITE_PUBLIC_GOOGLE_FONTS_API_KEY
            }&sort=popularity`
          );
          const data = await response.json();
          setFontFamilies([
            ...data.items.slice(0, 100).map((font: any) => font.family),
            "Sofia Sans Condensed",
          ]);
        } catch (error) {
          console.error("Error fetching fonts:", error);
        } finally {
          setIsFontLoading(false);
        }
      }
    };
    fetchFonts();
  }, [fontFamilies.length]);

  // Add font injection logic
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

  const VideoBackground = useMemo(() => {
    if (!settings.showVideoCanvas || !videoLink) {
      return null;
    }

    return (
      <video
        src={videoLink}
        className="absolute top-0 left-0 w-full h-full object-cover"
        style={{ opacity: settings.videoCanvasOpacity }}
        autoPlay
        loop
        muted
        playsInline
        onError={(e) => {
          console.error("Video playback error:", e);
          setIsVideoAvailable(false);
        }}
        onLoadedData={() => setIsVideoAvailable(true)}
      />
    );
  }, [settings.showVideoCanvas, videoLink, settings.videoCanvasOpacity]);

  const FadeOverlay = useMemo(
    () =>
      previewSettings.showFade && !previewSettings.greenScreenMode ? (
        <>
          <div
            className="absolute z-40 left-0 right-0 pointer-events-none"
            style={{
              top: `${previewSettings.padding}px`,
              height: `${previewSettings.fadeDistance}px`,
              background: `linear-gradient(to bottom, ${
                previewSettings.backgroundColor.includes("gradient")
                  ? "rgba(0,0,0,1)" // Use black for gradient backgrounds
                  : formatColor(previewSettings.backgroundColor)
              }, rgba(0,0,0,0))`,
            }}
          />
          <div
            className="absolute z-40 left-0 right-0 pointer-events-none"
            style={{
              bottom: `${previewSettings.padding}px`,
              height: `${previewSettings.fadeDistance}px`,
              background: `linear-gradient(to top, ${
                previewSettings.backgroundColor.includes("gradient")
                  ? "rgba(0,0,0,1)" // Use black for gradient backgrounds
                  : formatColor(previewSettings.backgroundColor)
              }, rgba(0,0,0,0))`,
            }}
          />
        </>
      ) : null,
    [previewSettings, formatColor]
  );

  // Update the no lyrics message
  const NoLyricsMessage = useMemo(() => {
    if (isLyricsLoading) {
      return (
        <div className="flex items-center justify-center h-full">
          <Spinner className="w-[30px] h-[30px] dark:fill-white" />
        </div>
      );
    }

    if (noLyricsAvailable && currentTrack?.title) {
      return (
        <p className="text-muted-foreground">
          No lyrics available for "{currentTrack.title}"
        </p>
      );
    }

    if (!lyrics?.length) {
      return (
        <p className="text-muted-foreground">
          Play a song on Spotify to see lyrics
        </p>
      );
    }

    return null;
  }, [isLyricsLoading, noLyricsAvailable, currentTrack?.title, lyrics]);

  // Update the preview content
  const LyricsPreview = useMemo(
    () => (
      <div
        className="h-full w-full relative"
        style={{
          ...getBackgroundStyle(
            previewSettings.greenScreenMode
              ? "#00FF00"
              : previewSettings.backgroundColor
          ),
          padding: `${previewSettings.padding}px`,
        }}
      >
        {VideoBackground}
        {FadeOverlay}
        <div
          ref={lyricsContainerRef}
          className="w-full overflow-visible scrollbar-hide relative z-20"
          style={{
            fontFamily: `'${previewSettings.fontFamily}', 'Sofia Sans Condensed', sans-serif`,
            color: formatColor(previewSettings.textColor),
            scrollBehavior: "smooth",
            transition: `all ${previewSettings.animationSpeed}ms ${previewSettings.animationEasing}`,
          }}
        >
          {NoLyricsMessage ||
            (lyrics?.length ? renderLyrics(lyrics, false) : null)}
        </div>
      </div>
    ),
    [
      previewSettings,
      getBackgroundStyle,
      isLyricsLoading,
      lyrics,
      renderLyrics,
      formatColor,
      VideoBackground,
      FadeOverlay,
      NoLyricsMessage,
    ]
  );

  // Create a wrapped version of updateSettings that includes the user ID
  const handleSettingsUpdate = useCallback(
    async (newSettings: Partial<LyricsSettings>) => {
      if (!user?.id) throw new Error("No user found");
      return updateSettings(newSettings, user.id);
    },
    [user?.id, updateSettings]
  );

  // Add handler for preview updates
  const handlePreviewUpdate = useCallback((newSettings: LyricsSettings) => {
    setPreviewSettings(newSettings);
  }, []);

  // Pass the preview settings to components that need it
  const LyricsSettings = (
    <div className="flex flex-col">
      <>
        {/* Header with URL input */}
        <div className="flex-none p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center space-x-2">
            <Input
              key={publicUrl}
              value={publicUrl}
              readOnly
              className="flex-grow ring-offset-0 focus:ring-offset-0 focus-visible:ring-offset-0"
            />
            <Button
              onClick={handleCopyPublicUrl}
              size="icon"
              variant="outline"
              className="ring-offset-0 focus:ring-offset-0 focus-visible:ring-offset-0"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex-1">
          <LyricsSettingsForm
            settings={settings}
            onSettingsChange={handleSettingsUpdate}
            onPreviewUpdate={handlePreviewUpdate}
            publicUrl={publicUrl}
            onCopyPublicUrl={handleCopyPublicUrl}
            fontFamilies={fontFamilies}
            isFontLoading={isFontLoading}
            injectFont={injectFont}
            isVideoAvailable={isVideoAvailable}
            isLyricsLoading={isLyricsLoading}
          />
        </div>
      </>
    </div>
  );

  // Add this effect to check video availability when videoLink changes
  useEffect(() => {
    setIsVideoAvailable(!!videoLink);
  }, [videoLink]);

  // Update previewSettings when settings change
  useEffect(() => {
    setPreviewSettings(settings);
  }, [settings]);

  // Load settings on mount
  useEffect(() => {
    async function loadSettings() {
      if (!user?.id) return;
      try {
        const { data, error } = await supabase
          .from("VisualizerWidget")
          .select("lyrics_settings")
          .eq("user_id", user.id)
          .single();

        if (error) throw error;

        if (data?.lyrics_settings) {
          await updateSettings(data.lyrics_settings, user.id);
          // Also update preview settings with loaded data
          setPreviewSettings(data.lyrics_settings);
        }
      } catch (error) {
        console.error("Error loading settings:", error);
      }
    }

    loadSettings();
  }, [user?.id, updateSettings]);

  // Add broadcast function
  const broadcastLyrics = useCallback(
    async (lyrics: any[], currentLine: number) => {
      if (!user?.username) return;

      const channel = supabase.channel(`lyrics:${user.username}`);

      await channel.subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.send({
            type: "broadcast",
            event: "lyrics",
            payload: { lyrics },
          });

          await channel.send({
            type: "broadcast",
            event: "currentLine",
            payload: { currentLine },
          });
        }
      });
    },
    [user?.username]
  );

  // Add effect to broadcast lyrics changes
  useEffect(() => {
    if (!lyrics || !user?.username || !currentTrack) return;

    const currentLineIndex = lyrics.findIndex(
      (line, index, arr) =>
        (currentTrack.elapsed || 0) >= line.startTimeMs &&
        (index === arr.length - 1 ||
          (currentTrack.elapsed || 0) < arr[index + 1].startTimeMs)
    );

    broadcastLyrics(
      lyrics.map((line) => line.words),
      currentLineIndex
    );
  }, [
    lyrics,
    currentTrack?.elapsed,
    user?.username,
    broadcastLyrics,
    currentTrack,
  ]);

  return (
    <div>
      <WidgetLayout
        preview={LyricsPreview}
        settings={
          <LyricsSettingsForm
            settings={settings}
            onSettingsChange={handleSettingsUpdate}
            onPreviewUpdate={handlePreviewUpdate}
            publicUrl={publicUrl}
            onCopyPublicUrl={handleCopyPublicUrl}
            fontFamilies={fontFamilies}
            isFontLoading={isFontLoading}
            injectFont={injectFont}
            isVideoAvailable={isVideoAvailable}
            isLyricsLoading={isLyricsLoading}
          />
        }
      />
      <Dialog
        open={isSpotifyTokenDialogOpen}
        onOpenChange={setIsSpotifyTokenDialogOpen}
      >
        <SpotifyKeysDialog />
      </Dialog>
    </div>
  );
}
