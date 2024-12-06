import React from "react";
import { useLyricsStore } from "@/store/lyricsStore";
import { useLyrics } from "@/hooks/useLyrics";
import { useBackgroundVideo } from "@/hooks/useBackgroundVideo";
import { motion, AnimatePresence } from "framer-motion";
import { Spinner } from "@/components/ui/spinner";

interface WidgetContentProps {
  type: string;
  selected: boolean;
}

export function WidgetContent({ type, selected }: WidgetContentProps) {
  const { settings: lyricsSettings } = useLyricsStore();
  const {
    track,
    lyrics,
    isLyricsLoading,
    formatColor,
    censorExplicitContent,
    getTextStyle,
  } = useLyrics({
    settings: lyricsSettings,
  });

  console.log("Widget Content:", { type, track, lyrics, isLyricsLoading });

  const videoLink = useBackgroundVideo(track?.id);

  const renderLyrics = () => {
    if (isLyricsLoading) {
      return (
        <div className="flex items-center justify-center h-full">
          <Spinner className="w-[20px] h-[20px]" />
        </div>
      );
    }

    if (!lyrics?.length) {
      return (
        <div className="flex items-center justify-center h-full text-center">
          <p style={{ color: lyricsSettings.textColor }}>
            Waiting for lyrics...
          </p>
        </div>
      );
    }

    const currentLineIndex = lyrics.findIndex((line, index, arr) => {
      const nextLine = arr[index + 1];
      return (
        track?.elapsed &&
        track.elapsed >= line.startTimeMs &&
        (!nextLine || track.elapsed < nextLine.startTimeMs)
      );
    });

    return (
      <AnimatePresence>
        {lyrics.map((line, index) => {
          const isCurrentLine = index === currentLineIndex;
          return (
            <motion.p
              key={index}
              initial={{ opacity: 0 }}
              animate={{
                opacity: isCurrentLine ? 1 : 0.6,
                scale: isCurrentLine ? 1.1 : 1,
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: lyricsSettings.animationSpeed / 1000,
                ease: lyricsSettings.animationEasing,
              }}
              style={getTextStyle(isCurrentLine)}
              className="text-center truncate"
            >
              {lyricsSettings.hideExplicitContent
                ? censorExplicitContent(line.words)
                : line.words}
            </motion.p>
          );
        })}
      </AnimatePresence>
    );
  };

  switch (type) {
    case "lyrics":
      return (
        <div
          className="w-full h-full overflow-hidden"
          style={{
            backgroundColor: lyricsSettings.greenScreenMode
              ? "#00FF00"
              : lyricsSettings.backgroundColor,
            padding: `${lyricsSettings.padding}px`,
          }}
        >
          {lyricsSettings.showVideoCanvas && videoLink && (
            <video
              src={videoLink}
              className="absolute top-0 left-0 w-full h-full object-cover"
              style={{ opacity: lyricsSettings.videoCanvasOpacity }}
              autoPlay
              loop
              muted
              playsInline
            />
          )}
          <div
            className="h-full w-full overflow-visible scrollbar-hide relative z-20 flex flex-col"
            style={{
              fontFamily: `'${lyricsSettings.fontFamily}', 'Sofia Sans Condensed', sans-serif`,
            }}
          >
            {renderLyrics()}
          </div>
        </div>
      );

    case "visualizer":
      return (
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">Visualizer Widget</p>
        </div>
      );

    case "nowPlaying":
      return (
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">Now Playing Widget</p>
        </div>
      );

    case "chat":
      return (
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">Chat Widget</p>
        </div>
      );

    case "alerts":
      return (
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">Alerts Widget</p>
        </div>
      );

    default:
      return (
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">Unknown Widget Type</p>
        </div>
      );
  }
}
