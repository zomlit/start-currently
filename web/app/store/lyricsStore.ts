import { create } from "zustand";
import { LyricsSettings } from "@/schemas/lyrics";
import { api } from "@/lib/eden";
import { handleAuthError } from "@/lib/auth";

// Define default settings here since we can't import from routes
export const defaultLyricsSettings: LyricsSettings = {
  backgroundColor: "rgba(0, 0, 0, 1)",
  textColor: "rgba(255, 255, 255, 1)",
  currentTextColor: "rgba(220, 40, 220, 1)",
  fontSize: 24,
  padding: 20,
  currentLineScale: 1.2,
  showFade: true,
  fadeDistance: 64,
  lineHeight: 1.5,
  fontFamily: "Sofia Sans Condensed",
  greenScreenMode: false,
  colorSync: false,
  showVideoCanvas: false,
  videoCanvasOpacity: 0.2,
  textAlign: "left",
  textShadowColor: "rgba(0, 0, 0, 0.5)",
  textShadowBlur: 2,
  textShadowOffsetX: 1,
  textShadowOffsetY: 1,
  animationEasing: "easeOut",
  animationSpeed: 300,
  glowEffect: false,
  glowColor: "rgba(255, 255, 255, 0.5)",
  glowIntensity: 5,
  hideExplicitContent: false,
  animationStyle: "scale",
  margin: 8,
};

interface LyricsStore {
  settings: LyricsSettings;
  updateSettings: (
    newSettings: Partial<LyricsSettings>,
    userId: string
  ) => Promise<void>;
  loadPublicSettings: (
    username: string,
    settings?: Partial<LyricsSettings>
  ) => Promise<void>;
}

export const useLyricsStore = create<LyricsStore>((set) => ({
  settings: defaultLyricsSettings,

  updateSettings: async (
    newSettings: Partial<LyricsSettings>,
    userId: string
  ) => {
    try {
      console.log("[Settings Update]", { userId: userId.slice(0, 8) });

      const { data, error } = await api.put(
        "/api/lyrics/settings",
        {
          settings: {
            ...defaultLyricsSettings,
            ...newSettings,
          },
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      if (error) {
        console.error("[Settings Update Error]:", error);
        handleAuthError(error);
      }

      set((state) => ({
        settings: {
          ...state.settings,
          ...newSettings,
        },
      }));
    } catch (error) {
      console.error("[Settings Update Error]:", error);
      throw error;
    }
  },

  loadPublicSettings: async (
    username: string,
    settings?: Partial<LyricsSettings>
  ) => {
    try {
      if (settings) {
        set({
          settings: {
            ...defaultLyricsSettings,
            ...settings,
          },
        });
        return;
      }

      const { data, error } = await api.get(`/api/lyrics/settings/${username}`);

      if (error) {
        handleAuthError(error);
      }

      if (data && typeof data === "object") {
        set({
          settings: {
            ...defaultLyricsSettings,
            ...data,
          },
        });
      } else {
        set({ settings: defaultLyricsSettings });
      }
    } catch (error) {
      console.error("Error loading public settings:", error);
      set({ settings: defaultLyricsSettings });
    }
  },
}));
