import { create } from "zustand";
import { defaultSettings, type VisualizerSettings } from "@/types/visualizer";
import { supabase } from "@/utils/supabase/client";
import type { Database } from "@/types/supabase";

type VisualizerWidget = Database["public"]["Tables"]["VisualizerWidget"]["Row"];

interface VisualizerStore {
  settings: VisualizerSettings;
  isLoading: boolean;
  updateSettings: (
    newSettings: Partial<VisualizerSettings>,
    userId: string
  ) => Promise<void>;
  setIsLoading: (loading: boolean) => void;
}

export const useVisualizerStore = create<VisualizerStore>((set, get) => ({
  settings: defaultSettings,
  isLoading: true,

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

      const { error } = await supabase.from("VisualizerWidget").upsert(
        {
          user_id: userId,
          type: "visualizer",
          visualizer_settings: mergedSettings,
          sensitivity: 1.0,
          colorScheme: "default",
        },
        {
          onConflict: "user_id",
        }
      );

      if (error) throw error;

      set({ settings: mergedSettings });
    } catch (error) {
      console.error("Failed to update settings:", error);
      throw error;
    }
  },

  setIsLoading: (loading) => set({ isLoading: loading }),
}));
