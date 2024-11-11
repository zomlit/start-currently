import { create } from "zustand";
import { SpotifyTrack } from "@/types/spotify";

type SpotifyStore = {
  currentTrack: SpotifyTrack | null;
  setCurrentTrack: (track: SpotifyTrack | null) => void;
};

export const useSpotifyStore = create<SpotifyStore>((set) => ({
  currentTrack: null,
  setCurrentTrack: (track) => set({ currentTrack: track }),
}));
