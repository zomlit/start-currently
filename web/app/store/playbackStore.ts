import { create } from "zustand";
import type { SpotifyTrack } from "@/types/spotify";

interface PlaybackStore {
  track: SpotifyTrack | null;
  isPlaying: boolean;
  elapsed: number;
  pollingInterval: NodeJS.Timeout | null;
  fetchCurrentPlayback: () => Promise<void>;
  startPolling: () => void;
  stopPolling: () => void;
}

export const usePlaybackStore = create<PlaybackStore>((set, get) => ({
  track: null,
  isPlaying: false,
  elapsed: 0,
  pollingInterval: null,

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

  startPolling: () => {
    const { fetchCurrentPlayback, pollingInterval } = get();

    // Clear any existing interval
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }

    // Initial fetch
    void fetchCurrentPlayback();

    // Start new polling
    const interval = setInterval(() => {
      void fetchCurrentPlayback();
    }, 1000);

    set({ pollingInterval: interval });
  },

  stopPolling: () => {
    const { pollingInterval } = get();
    if (pollingInterval) {
      clearInterval(pollingInterval);
      set({ pollingInterval: null });
    }
  },
}));
