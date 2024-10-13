import React from "react";
import { Spinner } from "./spinner";
import { useUser } from "@clerk/tanstack-start";
import { AnimatePresence, motion } from "framer-motion";

interface BackgroundImageProps {
  src: string;
  alt: string;
  opacity?: number;
  zIndex?: number;
  className?: string;
}

const BackgroundImage: React.FC<BackgroundImageProps> = ({
  src,
  alt,
  opacity = 1,
  zIndex = -10,
  className = "",
}) => {
  const { isLoaded } = useUser();

  return (
    <>
      <AnimatePresence>
        {!isLoaded && (
          <motion.div
            className="flex h-full w-full fixed flex-col items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Spinner className="w-8 fill-violet-300 text-white" />
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className={`fixed left-0 top-0 h-lvh w-full ${className}`}
        style={{ zIndex, opacity: isLoaded ? opacity : 0 }}
      >
        <img src={src} alt={alt} className="object-cover w-full h-full" />
      </div>
    </>
  );
};

export default BackgroundImage;
