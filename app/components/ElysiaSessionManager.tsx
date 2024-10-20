"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
// import {
//   ChevronDown,
//   ChevronUp,
//   Unplug,
//   Plug2,
//   AlertTriangle,
// } from "lucide-react";
// import { IconBrandSpotify, IconBrandTwitch } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { useElysiaSessionContext } from "@/contexts/ElysiaSessionContext";
import { useAuth } from "@clerk/tanstack-start";

interface Track {
  title: string;
  artist: string;
  progress: number;
  duration: number;
}

export const ElysiaSessionManager: React.FC = () => {
  const {
    isSessionActive,
    isServerAvailable,
    lastPing,
    apiStats,
    nowPlaying,
    twitchToken,
    spotifyRefreshToken,
    handleToggleSession,
  } = useElysiaSessionContext();
  const [isExpanded, setIsExpanded] = useState(false);
  const { userId, sessionId } = useAuth();

  const getApiHitColor = (hits: number) => {
    const percentage = (hits / 60) * 100; // Changed from 180 to 60
    if (percentage < 50) return "text-emerald-400";
    if (percentage < 75) return "text-yellow-300";
    return "text-pink-500";
  };

  const truncateUserId = (id: string | null) => {
    if (!id) return "Missing";
    return `${id.slice(0, 6)}...${id.slice(-4)}`;
  };

  const StatusIndicator = ({ isPresent }: { isPresent: boolean }) => (
    <span
      className={cn("ml-2", isPresent ? "text-emerald-400" : "text-pink-500")}
    >
      {isPresent ? "Available" : "Missing"}
    </span>
  );

  const isApiUsageHigh = apiStats && apiStats.apiHits > 45;
  return (
    <motion.div
      className="fixed bottom-0 left-0 right-0 z-10 bg-gray-900/90 pl-20 font-mono text-xs text-cyan-300 backdrop-blur-sm"
      initial={{ height: "24px" }}
      animate={{ height: isExpanded ? "auto" : "24px" }}
    >
      <div
        className="flex cursor-pointer items-center justify-between border-b-[1px] border-cyan-800/60 p-1"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-2">
          <span>
            Elysia:{" "}
            {isServerAvailable
              ? isSessionActive
                ? "Online"
                : "Offline"
              : "Unavailable"}
          </span>
        </div>
        {isApiUsageHigh && (
          <div className="flex items-center text-red-500">
            {/* <AlertTriangle className="mr-1 h-3 w-3" /> */}
            <span>High API Usage</span>
          </div>
        )}
        {/* {isExpanded ? <ChevronDown size={12} /> : <ChevronUp size={12} />} */}
      </div>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-2 gap-2 p-2"
          >
            <div className="space-y-1">
              <p className="flex items-center">
                {/* <IconBrandTwitch className="mr-1 h-3 w-3 text-purple-400" /> */}
                Twitch:
                <StatusIndicator isPresent={!!twitchToken} />
              </p>
              <p className="flex items-center">
                {/* <IconBrandSpotify className="mr-1 h-3 w-3 text-green-400" /> */}
                Spotify:
                <StatusIndicator isPresent={!!spotifyRefreshToken} />
              </p>
              <p>
                User ID:{" "}
                <span className="text-yellow-300">
                  {truncateUserId(userId)}
                </span>
              </p>
              <p>
                Session:{" "}
                <span
                  className={sessionId ? "text-emerald-400" : "text-pink-500"}
                >
                  {sessionId ? "Active" : "Inactive"}
                </span>
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-fuchsia-400">Now Playing:</p>
              {nowPlaying?.track &&
                typeof nowPlaying.track === "object" &&
                "title" in nowPlaying.track && (
                  <>
                    <p className="truncate text-yellow-300">
                      {(nowPlaying.track as Track).title}
                    </p>
                    <p className="truncate text-cyan-300">
                      {(nowPlaying.track as Track).artist}
                    </p>
                    <p className="text-emerald-400">
                      {Math.floor((nowPlaying.track as Track).progress / 1000)}s
                      /{Math.floor((nowPlaying.track as Track).duration / 1000)}
                      s
                    </p>
                  </>
                )}
            </div>
            <div className="space-y-1">
              <p className="text-fuchsia-400">Spotify API Usage:</p>
              {apiStats ? (
                <>
                  <p>
                    Hits (60s):{" "}
                    <span
                      className={cn(
                        "font-bold",
                        getApiHitColor(apiStats.apiHits)
                      )}
                    >
                      {apiStats.apiHits}/60
                    </span>
                  </p>
                  <p className="text-cyan-300">
                    Updated: {new Date(apiStats.timestamp).toLocaleTimeString()}
                  </p>
                  {isApiUsageHigh && (
                    <p className="text-red-500">
                      Warning: API usage is unusually high. Please check your
                      application.
                    </p>
                  )}
                </>
              ) : (
                <p className="text-gray-500">No stats available</p>
              )}
            </div>
            <div className="space-y-1">
              <p>
                Last Ping:{" "}
                <span className="text-yellow-300">
                  {lastPing ? `${Date.now() - lastPing}ms ago` : "N/A"}
                </span>
              </p>
              <button
                onClick={handleToggleSession}
                className={cn(
                  "mt-1 rounded px-2 py-1 text-xs",
                  isSessionActive
                    ? "bg-pink-900 text-white hover:bg-pink-800"
                    : "bg-emerald-900 text-white hover:bg-emerald-800"
                )}
              >
                {isSessionActive ? "Stop Session" : "Start Session"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {!isServerAvailable && (
        <div className="mt-1 text-xs text-red-500">
          Elysia server is currently unavailable. Some features may not work.
        </div>
      )}
    </motion.div>
  );
};
