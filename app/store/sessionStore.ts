import { create } from "zustand";

interface ApiStats {
  apiHits: number;
  timestamp: string;
  userId: string;
}

interface SessionStore {
  isSessionActive: boolean;
  isServerAvailable: boolean;
  lastPing: number | null;
  apiStats: ApiStats | null;
  nowPlaying: any;
  setIsSessionActive: (active: boolean) => void;
  setIsServerAvailable: (available: boolean) => void;
  setLastPing: (timestamp: number | null) => void;
  setApiStats: (stats: ApiStats | null) => void;
  setNowPlaying: (track: any) => void;
}

export const useSessionStore = create<SessionStore>((set) => ({
  isSessionActive: false,
  isServerAvailable: false,
  lastPing: null,
  apiStats: null,
  nowPlaying: null,
  setIsSessionActive: (active: boolean) => set({ isSessionActive: active }),
  setIsServerAvailable: (available: boolean) =>
    set({ isServerAvailable: available }),
  setLastPing: (timestamp: number | null) => set({ lastPing: timestamp }),
  setApiStats: (stats: ApiStats | null) => set({ apiStats: stats }),
  setNowPlaying: (track: any) => set({ nowPlaying: track }),
}));
