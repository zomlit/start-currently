import React from "react";
import { motion } from "framer-motion";
import { formatTime } from "@/utils/index";

const songChangeAnimation = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.5 },
};

interface TrackInformationProps {
  track: {
    title: string;
    artist: string;
    album: string;
    artwork: string;
    elapsed: number;
    duration: number;
    progress: number;
    isPlaying: boolean;
  };
  commonSettings: {
    customNowPlayingText?: string;
  };
  darkVibrantColor: string;
}

const TrackInformation: React.FC<TrackInformationProps> = ({
  track,
  commonSettings,
  darkVibrantColor,
}) => {
  return (
    <div className="z-20">
      <motion.p
        key={`${track?.title}-${track?.artist}`}
        variants={songChangeAnimation}
        initial="initial"
        animate="animate"
        exit="exit"
        className="artist-name text-shadow m-0 p-0 leading-6"
        style={{ textShadow: `1px 1px 2px ${darkVibrantColor}` }}
      >
        {track?.artist}
      </motion.p>
      <motion.p
        key={track?.title}
        variants={songChangeAnimation}
        initial="initial"
        animate="animate"
        exit="exit"
        className="song-title text-shadow text-sm"
        style={{ textShadow: `1px 1px 2px ${darkVibrantColor}` }}
      >
        {commonSettings?.customNowPlayingText && (
          <span>{commonSettings.customNowPlayingText} </span>
        )}
        {track?.title}
      </motion.p>
      <p className="text-shadow text-sm" style={{ textShadow: `1px 1px 2px ${darkVibrantColor}` }}>
        {formatTime(track?.elapsed || 0)} / {formatTime(track?.duration || 0)}
      </p>
    </div>
  );
};

export default TrackInformation;
