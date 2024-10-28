import React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { SectionLayout } from "@/components/layouts/SectionLayout";
import { useDatabaseStore } from "@/store/supabaseCacheStore";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/sections/lyrics")({
  component: LyricsSection,
});

function LyricsSection() {
  const nowPlayingData = useDatabaseStore(
    (state) => state.VisualizerWidget?.[0]
  );

  return (
    <SectionLayout
      title="Lyrics"
      description="View and manage your song lyrics"
    >
      <AnimatePresence mode="wait">
        {nowPlayingData?.track ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="rounded-lg bg-white/5 p-6 backdrop-blur-sm"
          >
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-purple-400">
                  {nowPlayingData.track.title}
                </h2>
                <p className="text-lg text-blue-300">
                  {nowPlayingData.track.artist}
                </p>
              </div>
              {nowPlayingData.track.albumArt && (
                <img
                  src={nowPlayingData.track.albumArt}
                  alt="Album Art"
                  className="h-16 w-16 rounded-md shadow-lg ring-2 ring-purple-500/20"
                />
              )}
            </div>

            <div className="space-y-4">
              {nowPlayingData.track.lyrics ? (
                <div className="prose prose-invert max-w-none">
                  <div className="rounded-md bg-black/20 p-4">
                    {nowPlayingData.track.lyrics
                      .split("\n")
                      .map((line, index) => (
                        <motion.p
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={cn(
                            "my-2",
                            line.trim() === "" ? "my-4" : ""
                          )}
                        >
                          {line || "\u00A0"}
                        </motion.p>
                      ))}
                  </div>
                </div>
              ) : (
                <div className="rounded-md bg-black/20 p-6 text-center">
                  <p className="text-gray-400">
                    No lyrics available for this track
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-lg bg-white/5 p-6 text-center backdrop-blur-sm"
          >
            <p className="text-lg text-gray-400">
              Waiting for a track to play...
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </SectionLayout>
  );
}
