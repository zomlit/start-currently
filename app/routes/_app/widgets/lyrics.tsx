import React, { useRef, useState, useCallback, useEffect } from "react";
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

export const Route = createFileRoute("/_app/widgets/lyrics")({
  component: LyricsSection,
});

function LyricsSection() {
  const { user } = useUser();
  const [isSpotifyTokenDialogOpen, setIsSpotifyTokenDialogOpen] =
    useState(false);
  const { settings, updateSettings } = useLyricsStore();
  const lyricsContainerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [publicUrl, setPublicUrl] = useState("");

  const {
    track,
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

  const videoLink = useBackgroundVideo(track?.id);

  // Update container width
  useEffect(() => {
    const updateContainerWidth = () => {
      if (lyricsContainerRef.current) {
        setContainerWidth(lyricsContainerRef.current.offsetWidth);
      }
    };

    updateContainerWidth();
    window.addEventListener("resize", updateContainerWidth);
    return () => window.removeEventListener("resize", updateContainerWidth);
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

  const handleSettingChange = useCallback(
    (newSettings: Partial<typeof settings>) => {
      updateSettings(newSettings);
    },
    [updateSettings]
  );

  // Add scrolling effect
  useEffect(() => {
    if (lyrics && track && lyricsContainerRef.current) {
      const scrollToCurrentLyric = () => {
        const currentTime = track.elapsed || 0;
        const currentLineIndex = lyrics.findIndex(
          (line, index, arr) =>
            currentTime >= line.startTimeMs - 1000 &&
            (index === arr.length - 1 ||
              currentTime < arr[index + 1].startTimeMs - 1000)
        );

        if (currentLineIndex !== -1 && lyricsContainerRef.current) {
          const lyricsContainer = lyricsContainerRef.current;
          const lines = Array.from(lyricsContainer.children);

          // Skip the first spacer div
          const currentLineElement = lines[currentLineIndex + 1] as HTMLElement;

          if (currentLineElement) {
            const containerHeight = lyricsContainer.clientHeight;
            const lineHeight = currentLineElement.offsetHeight;

            // Calculate scroll position to center the current line
            const scrollPosition = Math.max(
              0,
              currentLineElement.offsetTop -
                containerHeight / 2 +
                lineHeight / 2
            );

            // Only scroll if the position has changed significantly
            const currentScroll = lyricsContainer.scrollTop;
            const scrollDiff = Math.abs(currentScroll - scrollPosition);

            if (scrollDiff > 10) {
              lyricsContainer.scrollTo({
                top: scrollPosition,
                behavior: "smooth",
              });
            }
          }
        }
      };

      // Run immediately and then set up interval
      scrollToCurrentLyric();
      const intervalId = setInterval(scrollToCurrentLyric, 250);

      return () => clearInterval(intervalId);
    }
  }, [lyrics, track]);

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

  const LyricsPreview = (
    <div
      className="h-full w-full overflow-hidden relative"
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
      )}
      <div
        ref={lyricsContainerRef}
        className="h-full w-full overflow-y-auto scrollbar-hide relative z-20 flex flex-col"
        style={{
          fontFamily: `'${settings.fontFamily}', 'Sofia Sans Condensed', sans-serif`,
        }}
      >
        {isLyricsLoading ? (
          <div className="flex items-center justify-center h-full">
            <Spinner className="w-[30px] h-[30px]" />
          </div>
        ) : isUnauthorized ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
            <p className="mb-4">Spotify token required to fetch lyrics</p>
            <Button
              onClick={() => setIsSpotifyTokenDialogOpen(true)}
              variant="outline"
            >
              Add Spotify Lyrics Token
            </Button>
          </div>
        ) : noLyricsAvailable ? (
          <div className="flex items-center justify-center h-full text-center text-gray-500">
            No lyrics available for this track
          </div>
        ) : lyrics && lyrics.length > 0 ? (
          <>
            <div className="flex-1 min-h-[50vh]" />
            {lyrics.map((line, index, arr) => {
              const isCurrentLine =
                (track?.elapsed || 0) >= line.startTimeMs - 1000 &&
                (index === arr.length - 1 ||
                  (track?.elapsed || 0) < arr[index + 1].startTimeMs - 1000);

              const displayedText = settings.hideExplicitContent
                ? censorExplicitContent(line.words)
                : line.words;

              const truncatedText = truncateText(
                displayedText,
                containerWidth - settings.padding * 2,
                isCurrentLine
                  ? settings.fontSize * settings.currentLineScale
                  : settings.fontSize,
                settings.fontFamily
              );

              return (
                <p
                  key={index}
                  className="transition-all duration-300 text-center"
                  style={getTextStyle(isCurrentLine)}
                >
                  {truncatedText}
                </p>
              );
            })}
            <div className="flex-1 min-h-[50vh]" />
          </>
        ) : null}
      </div>
    </div>
  );

  const LyricsSettings = (
    <>
      {lyrics && (
        <div className="flex flex-col h-full max-h-screen">
          {/* Header with URL input - fixed at top */}
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

          {/* Scrollable settings area - takes remaining space */}
          <div className="flex-1 min-h-0 overflow-y-auto">
            <div className="p-6 space-y-6">
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
          </div>

          {/* Footer with Spotify button - fixed at bottom */}
          <div className="flex-none p-6 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <Button
              onClick={() => setIsSpotifyTokenDialogOpen(true)}
              variant="outline"
              className="w-full"
            >
              {isTokenSet ? "Update" : "Add"} Spotify Lyrics Token
            </Button>
          </div>
        </div>
      )}
    </>
  );

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
