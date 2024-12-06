import { create } from "zustand";
import { LyricsSettings } from "@/schemas/lyrics";
import { supabase } from "@/utils/supabase/client";

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
      if (!userId) throw new Error("No user ID provided");

      const mergedSettings = {
        ...defaultLyricsSettings,
        ...newSettings,
      };

      // Include all required fields in the upsert
      const { error } = await supabase.from("VisualizerWidget").upsert(
        {
          user_id: userId,
          type: "lyrics",
          sensitivity: 1.0,
          colorScheme: "default",
          lyrics_settings: mergedSettings, // This should be stored as JSONB in Supabase
        },
        {
          onConflict: "user_id",
          ignoreDuplicates: false,
        }
      );

      if (error) throw error;

      set({ settings: mergedSettings });
    } catch (error) {
      console.error("Error in updateSettings:", error);
      throw error;
    }
  },

  loadPublicSettings: async (
    username: string,
    settings?: Partial<LyricsSettings>
  ) => {
    try {
      // If settings are provided directly, use them
      if (settings) {
        set({
          settings: {
            ...defaultLyricsSettings,
            ...settings,
          },
        });
        return;
      }

      // Get user_id from UserProfile
      const { data: profileData, error: profileError } = await supabase
        .from("UserProfile")
        .select("user_id")
        .eq("username", username)
        .single();

      if (profileError) throw profileError;

      // Get lyrics_settings from VisualizerWidget
      const { data, error: visualizerError } = await supabase
        .from("VisualizerWidget")
        .select("lyrics_settings")
        .eq("user_id", profileData.user_id)
        .single();

      if (visualizerError) {
        console.error("Error fetching settings:", visualizerError);
        set({ settings: defaultLyricsSettings });
        return;
      }

      // Handle the settings data
      const loadedSettings = data?.lyrics_settings;

      if (loadedSettings && typeof loadedSettings === "object") {
        set({
          settings: {
            ...defaultLyricsSettings,
            ...loadedSettings,
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
