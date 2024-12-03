import { create } from "zustand";

interface SpotifyStore {
  spotifyRefreshToken: string | null;
  setSpotifyRefreshToken: (token: string | null) => void;
  spotifyAccessToken: string | null;
  setSpotifyAccessToken: (token: string | null) => void;
}

export const useSpotifyStore = create<SpotifyStore>((set) => ({
  spotifyRefreshToken: null,
  setSpotifyRefreshToken: (token: string | null) =>
    set({ spotifyRefreshToken: token }),
  spotifyAccessToken: null,
  setSpotifyAccessToken: (token: string | null) =>
    set({ spotifyAccessToken: token }),
}));
