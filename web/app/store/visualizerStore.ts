import { create } from "zustand";
import { defaultSettings, type VisualizerSettings } from "@/schemas/visualizer";
import { supabase } from "@/utils/supabase/client";
import { cleanVisualizerSettings } from "@/utils/settings";
import type { Database } from "@/types/supabase";

type VisualizerWidget = Database["public"]["Tables"]["VisualizerWidget"]["Row"];

interface VisualizerStore {
  settings: VisualizerSettings;
  isLoading: boolean;
  loadSettings: (userId: string) => Promise<void>;
  updateSettings: (
    newSettings: Partial<VisualizerSettings>,
    userId: string
  ) => Promise<void>;
  setIsLoading: (loading: boolean) => void;
}

export const useVisualizerStore = create<VisualizerStore>((set, get) => ({
  settings: defaultSettings,
  isLoading: true,

  loadSettings: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("VisualizerWidget")
        .select("visualizer_settings")
        .eq("user_id", userId)
        .single();

      if (error) throw error;

      if (data?.visualizer_settings) {
        // Merge with default settings to ensure all properties exist
        const mergedSettings = {
          ...defaultSettings,
          ...data.visualizer_settings,
          commonSettings: {
            ...defaultSettings.commonSettings,
            ...data.visualizer_settings.commonSettings,
          },
          visualSettings: {
            ...defaultSettings.visualSettings,
            ...data.visualizer_settings.visualSettings,
          },
        };
        set({ settings: mergedSettings });
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  updateSettings: async (
    newSettings: Partial<VisualizerSettings>,
    userId: string
  ) => {
    try {
      const currentSettings = get().settings;
      const mergedSettings = {
        ...currentSettings,
        ...newSettings,
      };

      // Clean the settings before sending to the database
      const cleanedPayload = cleanVisualizerSettings({
        user_id: userId,
        visualizer_settings: mergedSettings,
      });

      const { error } = await supabase.from("VisualizerWidget").upsert(
        {
          ...cleanedPayload,
          sensitivity: 1.0,
          colorScheme: "default",
        },
        {
          onConflict: "user_id",
        }
      );

      if (error) throw error;

      // Update local state with cleaned settings
      set({ settings: cleanedPayload.visualizer_settings });
    } catch (error) {
      console.error("Failed to update settings:", error);
      throw error;
    }
  },

  setIsLoading: (loading) => set({ isLoading: loading }),
}));
