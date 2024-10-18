import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface PauseOverlayProps {
  settings: {
    selectedFont: string;
    pauseEnabled: boolean;
    borderRadius: number;
  };
  track?: {
    isPlaying: boolean;
  };
}

const PauseOverlay: React.FC<PauseOverlayProps> = ({ settings, track }) => {
  if (!settings.pauseEnabled) {
    return null;
  }

  return (
    <AnimatePresence>
      {!track?.isPlaying && (
        <motion.div
          className="flex h-full w-full items-center justify-center bg-black bg-opacity-50 backdrop-blur-md backdrop-brightness-200"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-2xl font-bold text-white">Paused</div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PauseOverlay;
