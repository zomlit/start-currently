import { create } from "zustand";
import { persist } from "zustand/middleware";

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
  sessionStartTime: number | null;
  userId: string | null;
  setIsSessionActive: (active: boolean) => void;
  setIsServerAvailable: (available: boolean) => void;
  setLastPing: (timestamp: number | null) => void;
  setApiStats: (stats: ApiStats | null) => void;
  setNowPlaying: (track: any) => void;
  initializeSession: (userId: string) => void;
  clearSession: () => void;
  isSessionValid: () => boolean;
}

const SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours

export const useSessionStore = create<SessionStore>()(
  persist(
    (set, get) => ({
      isSessionActive: false,
      isServerAvailable: false,
      lastPing: null,
      apiStats: null,
      nowPlaying: null,
      sessionStartTime: null,
      userId: null,

      setIsSessionActive: (active: boolean) => {
        if (active && !get().sessionStartTime) {
          set({
            isSessionActive: active,
            sessionStartTime: Date.now(),
          });
        } else if (!active) {
          set({
            isSessionActive: false,
            sessionStartTime: null,
          });
        } else {
          set({ isSessionActive: active });
        }
      },

      setIsServerAvailable: (available: boolean) =>
        set({ isServerAvailable: available }),

      setLastPing: (timestamp: number | null) => set({ lastPing: timestamp }),

      setApiStats: (stats: ApiStats | null) => set({ apiStats: stats }),

      setNowPlaying: (track: any) => set({ nowPlaying: track }),

      initializeSession: (userId: string) => {
        set({
          userId,
          sessionStartTime: Date.now(),
          isSessionActive: true,
        });
      },

      clearSession: () => {
        set({
          isSessionActive: false,
          sessionStartTime: null,
          userId: null,
          lastPing: null,
          apiStats: null,
          nowPlaying: null,
        });
      },

      isSessionValid: () => {
        const state = get();
        if (!state.sessionStartTime || !state.userId) return false;

        const sessionAge = Date.now() - state.sessionStartTime;
        return sessionAge < SESSION_TIMEOUT;
      },
    }),
    {
      name: "elysia-session-storage",
      partialize: (state) => ({
        isSessionActive: state.isSessionActive,
        sessionStartTime: state.sessionStartTime,
        userId: state.userId,
      }),
    }
  )
);
