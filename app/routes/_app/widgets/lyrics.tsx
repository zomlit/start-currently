import React, { useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useDatabaseStore } from "@/store/supabaseCacheStore";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import type { VisualizerData } from "@/types/spotify";
import { Spinner } from "@/components/ui/spinner";
import { useLyricsStore } from "@/store/lyricsStore";
import { useLyrics } from "@/hooks/useLyrics";
import { Button } from "@/components/ui/button";
import { useBackgroundVideo } from "@/hooks/useBackgroundVideo";

export const Route = createFileRoute("/_app/widgets/lyrics")({
  component: LyricsSection,
});

function LyricsSection() {
  const [isSpotifyTokenDialogOpen, setIsSpotifyTokenDialogOpen] =
    useState(false);
  const { settings } = useLyricsStore();
  const lyricsContainerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  const {
    track,
    lyrics,
    isLyricsLoading,
    noLyricsAvailable,
    isUnauthorized,
    formatColor,
    censorExplicitContent,
    truncateText,
    getTextStyle,
  } = useLyrics({
    settings,
  });

  const videoLink = useBackgroundVideo(track?.id);

  React.useEffect(() => {
    const updateContainerWidth = () => {
      if (lyricsContainerRef.current) {
        setContainerWidth(lyricsContainerRef.current.offsetWidth);
      }
    };

    updateContainerWidth();
    window.addEventListener("resize", updateContainerWidth);
    return () => window.removeEventListener("resize", updateContainerWidth);
  }, []);

  return (
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
        ref={lyricsContainerRef}
        className="h-full overflow-y-auto scrollbar-hide relative z-20"
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
            <div style={{ height: "50vh" }}></div>
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
                  className="transition-all duration-300"
                  style={getTextStyle(isCurrentLine)}
                >
                  {truncatedText}
                </p>
              );
            })}
            <div style={{ height: "50vh" }}></div>
          </>
        ) : null}
      </div>
    </div>
  );
}
