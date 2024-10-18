import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@clerk/tanstack-start";
import { UserButton, SignInButton } from "@clerk/tanstack-start";
import { Spinner } from "./ui/spinner";

export function UserAvatarLoader() {
  const { isLoaded, isSignedIn } = useUser();
  const avatarRef = useRef<HTMLDivElement>(null);

  return (
    <div className="relative w-10 h-10">
      <AnimatePresence mode="wait">
        {!isLoaded && (
          <motion.div
            key="spinner"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute right-0 top-0 w-10 h-10 flex items-center justify-center z-10"
          >
            <Spinner className="text-white fill-white w-8 h-8" />
          </motion.div>
        )}
        {isLoaded && isSignedIn && (
          <motion.div
            key="avatar"
            ref={avatarRef}
            initial={{ opacity: 1 }}
            animate={{ opacity: isLoaded ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0"
          >
            <UserButton />
          </motion.div>
        )}
      </AnimatePresence>
      {isLoaded && !isSignedIn && <SignInButton mode="modal" />}
    </div>
  );
}
