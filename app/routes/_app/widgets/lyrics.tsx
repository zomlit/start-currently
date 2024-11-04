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
import { useMediaQuery } from "@/hooks/useMediaQuery";
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
  const [fontFamilies, setFontFamilies] = useState<string[]>([]);
  const [loadedFonts, setLoadedFonts] = useState<Set<string>>(new Set());
  const [isFontLoading, setIsFontLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  const videoLink = useBackgroundVideo(track?.id);

  // Update scrolling effect with debounced updates
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

      const intervalId = setInterval(scrollToCurrentLyric, 250);
      return () => clearInterval(intervalId);
    }
  }, [lyrics, track]);

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

  // Font loading logic
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

  const handleSettingChange = useCallback(
    (newSettings: Partial<typeof settings>) => {
      updateSettings(newSettings);
    },
    [updateSettings]
  );

  const handleCopyPublicUrl = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      if (publicUrl) {
        navigator.clipboard
          .writeText(publicUrl)
          .then(() => {
            toast.success({ title: "Public URL copied to clipboard" });
          })
          .catch((err) => {
            console.error("Failed to copy URL to clipboard:", err);
            toast.error({ title: "Failed to copy URL to clipboard" });
          });
      }
    },
    [publicUrl]
  );

  useEffect(() => {
    if (user?.username) {
      setPublicUrl(
        window.location.origin + "/" + user.username + window.location.pathname
      );
    }
  }, [user?.username]);

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
      {error ? (
        <div className="flex items-center justify-center h-full text-center text-red-500">
          <p>{error}</p>
        </div>
      ) : isLyricsLoading ? (
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
  );

  const LyricsSettings = (
    <>
      {lyrics && (
        <>
          <div className="flex items-center space-x-2 mb-6">
            <Input
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
          <Button
            onClick={() => setIsSpotifyTokenDialogOpen(true)}
            variant="outline"
            className="w-full"
          >
            {isTokenSet ? "Update" : "Add"} Spotify Lyrics Token
          </Button>
        </>
      )}
    </>
  );

  return (
    <>
      <WidgetLayout preview={LyricsPreview} settings={LyricsSettings} />
      <Dialog
        open={isSpotifyTokenDialogOpen}
        onOpenChange={setIsSpotifyTokenDialogOpen}
      >
        <SpotifyKeysDialog />
      </Dialog>
    </>
  );
}
