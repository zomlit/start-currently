import { create } from "zustand";
import type { SpotifyTrack } from "@/types/spotify";
import { useElysiaSessionContext } from "@/contexts/ElysiaSessionContext";

interface PlaybackState {
  track: SpotifyTrack | null;
  isPlaying: boolean;
  elapsed: number;
  setTrack: (track: SpotifyTrack | null) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setElapsed: (elapsed: number) => void;
  fetchCurrentPlayback: () => Promise<void>;
}

export const usePlaybackStore = create<PlaybackState>((set, get) => ({
  track: null,
  isPlaying: false,
  elapsed: 0,
  setTrack: (track) => set({ track }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setElapsed: (elapsed) => set({ elapsed }),
  fetchCurrentPlayback: async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_ELYSIA_API_URL}/api/spotify/current-playback`
      );

      if (!response.ok) return;

      const data = await response.json();
      if (data?.success && data?.data) {
        set({
          track: data.data,
          isPlaying: data.data.isPlaying,
          elapsed: data.data.elapsed,
        });
      }
    } catch (error) {
      console.error("Error fetching playback:", error);
    }
  },
}));

// Hook to manage playback polling
export const usePlaybackPolling = () => {
  const { isSessionActive, sessionStatus } = useElysiaSessionContext();
  const fetchCurrentPlayback = usePlaybackStore(
    (state) => state.fetchCurrentPlayback
  );

  useEffect(() => {
    if (!isSessionActive || !sessionStatus.spotify.isConnected) return;

    fetchCurrentPlayback();
    const interval = setInterval(fetchCurrentPlayback, 1000);

    return () => clearInterval(interval);
  }, [isSessionActive, sessionStatus.spotify.isConnected]);

  return usePlaybackStore((state) => ({
    track: state.track,
    isPlaying: state.isPlaying,
    elapsed: state.elapsed,
  }));
};
