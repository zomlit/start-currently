import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDynamicColors } from "@/hooks/useDynamicColors";

interface AlbumArtworkProps {
  track: {
    title: string;
    artwork: string;
  };
  settings: {
    canvasEnabled: boolean;
    albumCanvas: boolean;
  };
  videoLink: string | null;
}

const AlbumArtwork: React.FC<AlbumArtworkProps> = ({ track, settings, videoLink }) => {
  const albumArtUrl = track?.artwork || undefined;
  console.log("TRACK", albumArtUrl);

  const { darkVibrantColor } = useDynamicColors(albumArtUrl, settings);

  const variants = {
    enter: { opacity: 0, scale: 0.95 },
    center: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
  };

  return (
    <div className="relative aspect-square h-full">
      {settings.canvasEnabled && settings.albumCanvas && videoLink && (
        <motion.video
          key={`${track?.title}-video`}
          autoPlay
          loop
          muted
          className="absolute z-20 h-full w-full object-cover"
          style={{ opacity: 0.5 }}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
        >
          <source src={videoLink} type="video/mp4" />
        </motion.video>
      )}
      <AnimatePresence initial={false}>
        <motion.img
          key={track?.title || "placeholder"}
          src={track?.artwork}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            opacity: { duration: 0.5 },
            scale: { duration: 0.5 },
          }}
          className="relative left-0 top-0 z-10 h-full w-full object-cover object-center"
          style={{ boxShadow: `0 10px 15px ${darkVibrantColor}` }}
        />
      </AnimatePresence>
    </div>
  );
};

export default AlbumArtwork;
