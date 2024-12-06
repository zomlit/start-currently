import { useEffect, useState } from "react";
import { useElysiaSessionContext } from "@/contexts/ElysiaSessionContext";
import { usePlaybackStore } from "@/store/playbackStore";
import type { SpotifyTrack } from "@/types/spotify";
import { supabase } from "@/utils/supabase/client";

interface PlaybackState {
  track: SpotifyTrack | null;
  isPlaying: boolean;
  elapsed: number;
}

export const usePlaybackPolling = () => {
  const { isSessionActive, sessionStatus } = useElysiaSessionContext();
  const [playbackState, setPlaybackState] = useState<PlaybackState>({
    track: null,
    isPlaying: false,
    elapsed: 0,
  });

  useEffect(() => {
    if (!isSessionActive || !sessionStatus.spotify.isConnected) return;

    // Initial fetch
    const fetchInitialState = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_ELYSIA_API_URL}/api/spotify/current-playback`
        );
        if (response.ok) {
          const data = await response.json();
          if (data?.success && data?.data) {
            setPlaybackState({
              track: data.data,
              isPlaying: data.data.isPlaying,
              elapsed: data.data.elapsed,
            });
          }
        }
      } catch (error) {
        console.error("Error fetching playback:", error);
      }
    };

    // Add logging to debug
    console.log("Starting playback polling");
    void fetchInitialState();

    // Set up polling interval
    const interval = setInterval(fetchInitialState, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [isSessionActive, sessionStatus.spotify.isConnected]);

  return playbackState;
};
