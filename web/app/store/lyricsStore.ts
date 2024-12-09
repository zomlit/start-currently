import { create } from "zustand";
import { type LyricsSettings, defaultLyricsSettings } from "@/schemas/lyrics";
import { supabase } from "@/utils/supabase/client";

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
      // Update Supabase
      const { error } = await supabase.from("VisualizerWidget").upsert(
        {
          user_id: userId,
          type: "lyrics",
          lyrics_settings: {
            ...defaultLyricsSettings,
            ...newSettings,
          },
          sensitivity: 1.0,
          colorScheme: "default",
        },
        { onConflict: "user_id" }
      );

      if (error) throw error;

      // Update local state
      set((state) => ({
        settings: {
          ...state.settings,
          ...newSettings,
        },
      }));
    } catch (error) {
      console.error("Failed to update settings:", error);
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
