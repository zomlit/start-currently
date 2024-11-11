import React, {
  useRef,
  useState,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useLyricsStore } from "@/store/lyricsStore";
import { useLyrics } from "@/hooks/useLyrics";
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
import { Switch } from "@/components/ui/switch";
import { motion, AnimatePresence } from "framer-motion";
import { LyricsSettings } from "@/types/lyrics";
import { supabase, createRealtimeChannel } from "@/utils/supabase/client";

export const Route = createFileRoute("/_app/widgets/lyrics")({
  component: LyricsSection,
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
    initial: { scale: 1 },
    animate: (isCurrentLine) => ({
      scale: isCurrentLine ? 1.15 : 1,
    }),
  },
  glow: {
    initial: { textShadow: "0 0 0px rgba(255,255,255,0)" },
    animate: (isCurrentLine) => ({
      textShadow: isCurrentLine
        ? "0 0 20px rgba(255,255,255,0.8)"
        : "0 0 0px rgba(255,255,255,0)",
    }),
  },
  slide: {
    initial: { x: 0 },
    animate: (isCurrentLine) => ({
      x: isCurrentLine ? 20 : 0,
    }),
  },
  fade: {
    initial: { opacity: 0.6 },
    animate: (isCurrentLine) => ({
      opacity: isCurrentLine ? 1 : 0.6,
    }),
  },
  bounce: {
    initial: { y: 0 },
    animate: (isCurrentLine) => ({
      y: isCurrentLine ? -10 : 0,
    }),
  },
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
    (lyricsToRender: typeof lyrics, isPlaceholder = false) => {
      if (!lyricsToRender) return null;

      const currentTime = isPlaceholder ? mockTime : currentTrack?.elapsed || 0;
      const currentLineIndex = lyricsToRender.findIndex((line, index, arr) => {
        const nextLine = arr[index + 1];
        return (
          currentTime >= line.startTimeMs &&
          currentTime < (nextLine?.startTimeMs ?? Infinity)
        );
      });

      return lyricsToRender.map((line, index) => {
        const isCurrentLine = index === currentLineIndex;
        const displayedText = settings.hideExplicitContent
          ? censorExplicitContent(line.words)
          : line.words;

        const variant = ANIMATION_VARIANTS[settings.animationStyle];

        return (
          <motion.p
            key={index}
            initial={variant.initial}
            animate={variant.animate(isCurrentLine)}
            transition={{
              duration: settings.animationSpeed / 1000,
              ease: settings.animationEasing,
              ...(settings.animationStyle === "bounce" && {
                type: "spring",
                stiffness: 500,
                damping: 20,
              }),
            }}
            style={{
              ...getTextStyle(isCurrentLine),
              opacity: isPlaceholder ? (isCurrentLine ? 0.8 : 0.5) : 1,
            }}
            className="text-center"
          >
            {displayedText}
          </motion.p>
        );
      });
    },
    [
      currentTrack?.elapsed,
      mockTime,
      settings.hideExplicitContent,
      settings.animationStyle,
      settings.animationSpeed,
      settings.animationEasing,
      censorExplicitContent,
      getTextStyle,
    ]
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
        // Limit to 10 updates per second
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

      const currentLineElement = lyricsContainer.children[
        currentLineIndex + 1
      ] as HTMLElement;

      if (currentLineElement) {
        const containerHeight = lyricsContainer.clientHeight;
        const scrollPosition = Math.max(
          0,
          currentLineElement.offsetTop - containerHeight / 2
        );

        lyricsContainer.scrollTo({
          top: scrollPosition,
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

  // Split the preview content into smaller components
  const VideoBackground = useMemo(
    () =>
      settings.showVideoCanvas && videoLink ? (
        <video
          src={videoLink}
          className="absolute top-0 left-0 w-full h-full object-cover"
          style={{ opacity: settings.videoCanvasOpacity }}
          autoPlay
          loop
          muted
          playsInline
        />
      ) : null,
    [settings.showVideoCanvas, videoLink, settings.videoCanvasOpacity]
  );

  const FadeOverlay = useMemo(
    () =>
      settings.showFade && !settings.greenScreenMode ? (
        <>
          <div
            className="absolute z-40 left-0 right-0 pointer-events-none"
            style={{
              top: `${settings.padding}px`,
              height: `${settings.fadeDistance}px`,
              background: `linear-gradient(to bottom, ${formatColor(
                settings.backgroundColor
              )}, rgba(0,0,0,0))`,
            }}
          />
          <div
            className="absolute z-40 left-0 right-0 pointer-events-none"
            style={{
              bottom: `${settings.padding}px`,
              height: `${settings.fadeDistance}px`,
              background: `linear-gradient(to top, ${formatColor(
                settings.backgroundColor
              )}, rgba(0,0,0,0))`,
            }}
          />
        </>
      ) : null,
    [settings, formatColor]
  );

  // Memoize the preview content with split components
  const LyricsPreview = useMemo(
    () => (
      <div
        className="h-full w-full overflow-hidden relative"
        style={{
          backgroundColor: settings.greenScreenMode
            ? "#00FF00"
            : formatColor(settings.backgroundColor),
          padding: `${settings.padding}px`,
        }}
      >
        {VideoBackground}
        {FadeOverlay}
        <div
          ref={lyricsContainerRef}
          className="h-full w-full overflow-y-auto scrollbar-hide relative z-20 flex flex-col"
          style={{
            fontFamily: `'${settings.fontFamily}', 'Sofia Sans Condensed', sans-serif`,
            scrollBehavior: "smooth",
            transition: `all ${settings.animationSpeed}ms ${settings.animationEasing}`,
          }}
        >
          {isLyricsLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-4">
                <Spinner className="w-[30px] h-[30px]" />
                <p className="text-muted-foreground">Loading lyrics...</p>
              </div>
            </div>
          ) : lyrics?.length ? (
            <>
              <div className="flex-1 min-h-[50vh]" />
              {renderLyrics(lyrics, false)}
              <div className="flex-1 min-h-[50vh]" />
            </>
          ) : !hideExampleLyrics ? (
            <>
              <div className="flex-1 min-h-[50vh]" />
              {renderLyrics(PLACEHOLDER_LYRICS, true)}
              <div className="flex-1 min-h-[50vh]" />
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-center text-muted-foreground">
              <p>Play a song on Spotify to see lyrics</p>
            </div>
          )}
        </div>
      </div>
    ),
    [
      settings,
      isLyricsLoading,
      lyrics,
      renderLyrics,
      formatColor,
      VideoBackground,
      FadeOverlay,
      hideExampleLyrics,
    ]
  );

  // Create a wrapped version of updateSettings that includes the user ID
  const handleSettingsUpdate = useCallback(
    async (newSettings: Partial<LyricsSettings>) => {
      if (!user?.id) throw new Error('No user found');
      return updateSettings(newSettings, user.id);
    },
    [user?.id, updateSettings]
  );

  // Pass the wrapped version to LyricsSettingsForm
  const LyricsSettings = (
    <div className="flex flex-col h-full max-h-screen">
      {isLyricsLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <Spinner className="w-[30px] h-[30px]" />
            <p className="text-muted-foreground">Loading settings...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Header with URL input */}
          <div className="flex-none p-6 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
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

          <div className="flex-1 overflow-y-auto">
            <LyricsSettingsForm
              settings={settings}
              onSettingsChange={handleSettingsUpdate}
              publicUrl={publicUrl}
              onCopyPublicUrl={handleCopyPublicUrl}
              fontFamilies={fontFamilies}
              isFontLoading={isFontLoading}
              injectFont={injectFont}
              isVideoAvailable={isVideoAvailable}
            />
          </div>
        </>
      )}
    </div>
  );

  // Add this effect to check video availability when videoLink changes
  useEffect(() => {
    setIsVideoAvailable(!!videoLink);
  }, [videoLink]);

  // Load settings on mount
  useEffect(() => {
    async function loadSettings() {
      if (!user?.id) return;
      try {
        const { data, error } = await supabase
          .from('VisualizerWidget')
          .select('lyrics_settings')
          .eq('user_id', user.id)
          .single();

        if (error) throw error;

        if (data?.lyrics_settings) {
          await updateSettings(data.lyrics_settings, user.id);
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    }

    loadSettings();
  }, [user?.id, updateSettings]);

  // Update broadcast function
  const broadcastLyrics = useCallback(async (lyrics: any[], currentLine: number) => {
    if (!user?.username) return;

    try {
      const channel = createRealtimeChannel(`lyrics:${user.username}`);
      await channel.subscribe();
      
      // Broadcast current lyrics
      await channel.send({
        type: 'broadcast',
        event: 'lyrics',
        payload: { lyrics }
      });

      // Broadcast current line
      await channel.send({
        type: 'broadcast',
        event: 'currentLine',
        payload: { currentLine }
      });

      // Clean up channel after broadcast
      await supabase.removeChannel(channel);
    } catch (error) {
      console.error('Error broadcasting lyrics:', error);
    }
  }, [user?.username]);

  // Add effect to broadcast lyrics changes
  useEffect(() => {
    if (!lyrics || !user?.username || !currentTrack) return;
    
    const currentLineIndex = lyrics.findIndex(
      (line, index, arr) =>
        (currentTrack.elapsed || 0) >= line.startTimeMs &&
        (index === arr.length - 1 || (currentTrack.elapsed || 0) < arr[index + 1].startTimeMs)
    );

    broadcastLyrics(
      lyrics.map(line => line.words),
      currentLineIndex
    );
  }, [lyrics, currentTrack?.elapsed, user?.username, broadcastLyrics, currentTrack]);

  return (
    <div className="h-screen overflow-hidden">
      <WidgetLayout preview={LyricsPreview} settings={LyricsSettings} />
      <Dialog
        open={isSpotifyTokenDialogOpen}
        onOpenChange={setIsSpotifyTokenDialogOpen}
      >
        <SpotifyKeysDialog />
      </Dialog>
    </div>
  );
}
