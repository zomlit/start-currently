import { create } from "zustand";

interface OAuthStore {
  twitchToken: string | null;
  setTwitchToken: (token: string | null) => void;
}

export const useOAuthStore = create<OAuthStore>((set) => ({
  twitchToken: null,
  setTwitchToken: (token: string | null) => set({ twitchToken: token }),
}));
