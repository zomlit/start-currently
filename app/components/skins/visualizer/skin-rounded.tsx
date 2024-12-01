import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  memo,
} from "react";
import { cn } from "@/lib/utils";
import { CommonSettings, VisualizerSettings } from "@/types/widget";
import { AnimatePresence, motion } from "framer-motion";
import { useDynamicColors } from "@/hooks/useDynamicColors";
import { formatTime, rgbaToString } from "@/utils/index";
import { useBackgroundVideo } from "@/hooks/useBackgroundVideo";
import PauseOverlay from "@/components/widget-settings/visualizer/PauseOverlay";
import DynamicBackground from "@/components/widget-settings/visualizer/DynamicBackground";
import { useAudioVisualizer } from "@/hooks/useAudioVisualizer";
import { Spinner } from "@/components/ui/spinner";
import { useDatabaseStore } from "@/store/supabaseCacheStore";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Slider } from "@/components/ui/slider";
import { GradientColorPicker } from "@/components/GradientColorPicker";
import { Button } from "@/components/ui/button";

interface SkinRoundedProps {
  track?: {
    title: string;
    artist: string;
    artwork?: string;
    progress: number;
    isPlaying: boolean;
    elapsed: number;
    duration: number;
    id: string;
  };
  commonSettings: CommonSettings;
  specificSettings: VisualizerSettings;
  onSettingsChange?: (newSettings: Partial<VisualizerSettings>) => void;
  isPublicView?: boolean;
  style?: React.CSSProperties;
}

const variants = {
  enter: { opacity: 0, scale: 0.95 },
  center: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.3 } },
};

const containerVariants = {
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
  hidden: { opacity: 0, scale: 0.95, transition: { duration: 0.3 } },
};

const TrackProgress = memo(
  ({ elapsed, duration }: { elapsed: number; duration: number }) => (
    <div className="relative flex h-full w-full items-center justify-between gap-1">
      <p className="z-10 flex w-12 justify-start truncate text-sm font-bold">
        {formatTime(elapsed)}
      </p>
      <p className="z-10 flex w-12 justify-end truncate text-sm font-bold">
        {formatTime(duration)}
      </p>
    </div>
  )
);

const ProgressBar = memo(
  ({
    progress,
    colors,
  }: {
    progress: number;
    colors: { background: string; foreground: string };
  }) => (
    <div
      className="relative bottom-0 h-2 w-full rounded-lg"
      style={{ backgroundColor: colors.background }}
    >
      <div
        className="absolute left-0 top-0 h-full rounded-lg"
        style={{
          width: `${progress}%`,
          backgroundColor: colors.foreground,
        }}
      />
    </div>
  )
);

const TrackArtwork = memo(
  ({ artwork, borderRadius }: { artwork?: string; borderRadius: number }) => (
    <motion.img
      key={artwork}
      src={artwork}
      variants={variants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{
        opacity: { duration: 0.5 },
        scale: { duration: 0.5 },
      }}
      className="absolute left-0 top-0 z-10 h-full w-full object-cover object-center"
      style={{ borderRadius: `${borderRadius}px` }}
    />
  )
);

const computeContainerStyle = (
  commonSettings: CommonSettings,
  specificSettings: VisualizerSettings,
  palette: any
): React.CSSProperties => ({
  color:
    specificSettings?.colorSync && palette?.Muted
      ? `color-mix(in srgb, ${palette.Muted.hex} 20%, white)`
      : commonSettings?.textColor || "inherit",
  backgroundColor:
    specificSettings?.colorSync && palette?.DarkVibrant
      ? `${palette.DarkVibrant.hex}${Math.round(
          (specificSettings?.backgroundOpacity || 0.6) * 255
        )
          .toString(16)
          .padStart(2, "0")}`
      : commonSettings?.backgroundColor || "transparent",
  fontFamily: `'${commonSettings?.fontFamily || "sans-serif"}', sans-serif`,
  fontWeight: commonSettings?.fontWeight || "normal",
  fontSize: `${commonSettings?.fontSize || 16}px`,
  borderColor:
    specificSettings?.colorSync && palette?.DarkVibrant
      ? palette.DarkVibrant.hex
      : commonSettings?.borderColor || "transparent",
  borderWidth: commonSettings?.borderWidth || 0,
  borderStyle:
    (commonSettings?.borderStyle as React.CSSProperties["borderStyle"]) ||
    "none",
  borderRadius: `${commonSettings?.borderRadius || 0}px`,
  padding: `${commonSettings?.padding || 0}px`,
  lineHeight: commonSettings?.lineHeight || "normal",
  letterSpacing: `${commonSettings?.letterSpacing || 0}px`,
  textAlign:
    (commonSettings?.textAlign as React.CSSProperties["textAlign"]) || "left",
  transformOrigin: "top left",
});

const computeTextStyle = (
  specificSettings: VisualizerSettings,
  palette: any
): React.CSSProperties => {
  const getTextShadowColor = () => {
    if (specificSettings?.enableTextShadow) {
      if (
        specificSettings?.syncTextShadow &&
        specificSettings?.colorSync &&
        palette?.DarkVibrant
      ) {
        const { r, g, b } = palette.DarkVibrant.rgb;
        if (r !== undefined && g !== undefined && b !== undefined) {
          return `rgba(${r}, ${g}, ${b}, 0.6)`;
        }
      }
      return specificSettings?.textShadowColor || "rgba(0, 0, 0, 0.6)";
    }
    return "none";
  };

  return {
    textShadow: specificSettings?.enableTextShadow
      ? `${specificSettings?.textShadowHorizontal || 0}px ${
          specificSettings?.textShadowVertical || 0
        }px ${specificSettings?.textShadowBlur || 0}px ${getTextShadowColor()}`
      : "none",
  };
};

const SkinRounded: React.FC<SkinRoundedProps> = ({
  track,
  commonSettings,
  specificSettings,
  onSettingsChange,
  isPublicView = false,
  style,
}) => {
  const { palette, colorSyncEnabled } = useDynamicColors(
    track,
    specificSettings
  );
  const videoLink = useBackgroundVideo(track?.id);

  const pauseOverlayVariants = {
    visible: { opacity: 1, transition: { duration: 0.3 } },
    hidden: { opacity: 0, transition: { duration: 0.3 } },
  };

  const [isVideoAvailable, setIsVideoAvailable] = useState(false);
  const [isVideoTaller, setIsVideoTaller] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const sourceRef = useRef<HTMLSourceElement>(null);
  const [videoError, setVideoError] = useState<string | null>(null);

  const audioMotionRef = useAudioVisualizer(specificSettings, track, {
    darkVibrant: palette?.DarkVibrant?.hex,
    lightVibrant: palette?.LightVibrant?.hex,
  });

  const containerStyle = useMemo(
    () => computeContainerStyle(commonSettings, specificSettings, palette),
    [commonSettings, specificSettings, palette]
  );

  const textStyle = useMemo(
    () => computeTextStyle(specificSettings, palette),
    [specificSettings, palette]
  );

  const handleVideoLoad = useCallback(
    (event: React.SyntheticEvent<HTMLVideoElement, Event>) => {
      const video = event.currentTarget;
      setIsVideoTaller(video.videoHeight > video.videoWidth);
      setVideoError(null);
      setIsVideoAvailable(true);
    },
    []
  );

  const TrackInfo = useMemo(
    () => (
      <div className="whitespace relative overflow-x-clip rounded-lg px-3 py-1">
        <p
          className="track-name relative z-10 truncate"
          style={{ ...textStyle, fontWeight: "600" }}
        >
          {track?.title || "No track playing"}
        </p>
        <p className="artist-name relative z-10 truncate" style={textStyle}>
          {track?.artist || "Artist N/A"}
        </p>
      </div>
    ),
    [track?.title, track?.artist, textStyle]
  );

  const progressColors = useMemo(
    () => ({
      background:
        specificSettings?.colorSync && palette?.LightMuted
          ? palette.LightMuted.hex
          : specificSettings?.progressBarBackgroundColor || "transparent",
      foreground:
        specificSettings?.colorSync && palette?.Vibrant
          ? palette.Vibrant.hex
          : specificSettings?.progressBarForegroundColor || "transparent",
    }),
    [specificSettings, palette]
  );

  useEffect(() => {
    if (videoLink) {
      setIsVideoAvailable(true);
    } else {
      setIsVideoAvailable(false);
    }
  }, [videoLink]);

  const handleVideoError = () => {
    console.error("Error loading video");
    setVideoError("Error loading video");
    setIsVideoAvailable(false);
  };

  if (!track) {
    return (
      <div className="flex items-center justify-center">
        <Spinner className="mr-2 h-4 w-4 fill-white" />
      </div>
    );
  }

  return (
    <div style={style}>
      <div
        className={`relative w-full overflow-hidden rounded-lg ${
          specificSettings?.canvasEnabled ? "bg-transparent" : ""
        }`}
        style={{
          borderRadius: `${commonSettings?.borderRadius || 0}px`,
        }}
      >
        <AnimatePresence mode="wait">
          {(!specificSettings?.hideOnDisabled || track?.isPlaying) && (
            <motion.div
              key={track?.id || "default"}
              style={{
                fontWeight: commonSettings?.fontWeight + "200" || "normal",
              }}
              className="relative z-0 transition"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <AnimatePresence>
                {!track?.isPlaying && specificSettings?.pauseEnabled && (
                  <motion.div
                    variants={pauseOverlayVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    className="absolute left-0 top-0 z-50 flex h-full w-full items-center justify-center backdrop-blur-md"
                  >
                    <PauseOverlay settings={specificSettings} track={track} />
                  </motion.div>
                )}
              </AnimatePresence>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div
                  className={cn(
                    "flex select-none flex-col",
                    `gap-${commonSettings?.gap || 0}`
                  )}
                >
                  <div
                    className={cn(
                      "flex w-full",
                      `gap-${commonSettings?.gap || 0}`
                    )}
                  >
                    <div className="relative aspect-square h-full">
                      <div className="relative z-40">
                        <div className="aspect-square h-full min-w-[114px]">
                          <div className="relative flex aspect-square items-center justify-center overflow-hidden transition duration-500">
                            <div className="relative flex h-full w-full scale-[101%] items-center justify-center overflow-hidden">
                              {isVideoAvailable &&
                                specificSettings?.canvasEnabled &&
                                videoLink && (
                                  <motion.video
                                    ref={videoRef}
                                    key={`${track?.id || "default"}-video`}
                                    autoPlay
                                    loop
                                    muted
                                    playsInline
                                    crossOrigin="anonymous"
                                    className={cn(
                                      "absolute z-20 h-full w-full object-cover",
                                      isVideoTaller && "animate-pan-video"
                                    )}
                                    style={{
                                      opacity: 1,
                                      borderRadius: `${commonSettings?.borderRadius || 0}px`,
                                    }}
                                    variants={variants}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                    onLoadedMetadata={handleVideoLoad}
                                    onError={handleVideoError}
                                  >
                                    <source
                                      ref={sourceRef}
                                      type="video/mp4"
                                      src={videoLink}
                                    />
                                    Your browser does not support the video tag.
                                  </motion.video>
                                )}
                              {!isVideoAvailable &&
                                specificSettings?.canvasEnabled &&
                                specificSettings?.albumCanvas && (
                                  <div className="absolute z-20 flex h-full w-full items-center justify-center">
                                    <p>Loading video...</p>
                                  </div>
                                )}
                              {videoError && (
                                <div className="absolute z-30 flex h-full w-full items-center justify-center bg-black bg-opacity-50 text-white">
                                  <p>{videoError}</p>
                                </div>
                              )}
                              <AnimatePresence initial={false}>
                                <TrackArtwork
                                  artwork={track?.artwork}
                                  borderRadius={
                                    commonSettings?.borderRadius || 0
                                  }
                                />
                              </AnimatePresence>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div
                      className={cn(
                        "z-0 flex w-full min-w-0 flex-col",
                        `gap-${commonSettings?.gap || 0}`
                      )}
                    >
                      {specificSettings?.canvasEnabled &&
                        specificSettings?.backgroundCanvas &&
                        videoLink && (
                          <DynamicBackground
                            videoLink={videoLink}
                            opacity={specificSettings?.backgroundCanvasOpacity}
                          />
                        )}
                      <div
                        className="whitespace relative overflow-x-clip rounded-lg px-3 py-1"
                        style={{
                          backgroundColor: specificSettings?.colorSync
                            ? palette?.DarkVibrant?.hex
                            : commonSettings?.backgroundColor || "transparent",
                          borderRadius: `${commonSettings?.borderRadius || 0}px`,
                        }}
                      >
                        {TrackInfo}
                        {specificSettings?.micEnabled && (
                          <div
                            ref={audioMotionRef}
                            className="absolute -bottom-[1px] left-0 z-0 h-full w-full rounded-lg [&_canvas]:rounded-lg"
                            id="container"
                          />
                        )}
                      </div>
                      <TrackProgress
                        elapsed={track?.elapsed || 0}
                        duration={track?.duration || 0}
                      />
                      <ProgressBar
                        progress={track?.progress || 0}
                        colors={progressColors}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

function getFontWeight(
  baseFontWeight: string | number | undefined,
  increment: number
): number {
  const baseWeight =
    typeof baseFontWeight === "number"
      ? baseFontWeight
      : parseInt(baseFontWeight || "400", 10);

  const newWeight = Math.min(Math.max(baseWeight + increment, 100), 900);
  return newWeight - (newWeight % 100);
}

export default memo(SkinRounded);
