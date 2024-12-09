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

export const useVisualizerStore = create<VisualizerStore>((set) => ({
  settings: defaultSettings,
  isLoading: true,

  updateSettings: async (newSettings, userId) => {
    try {
      set((state) => ({
        settings: {
          ...state.settings,
          ...newSettings,
        },
      }));

      const { data: currentData } = await supabase
        .from("VisualizerWidget")
        .select("visualizer_settings")
        .eq("user_id", userId)
        .single();

      const mergedSettings = {
        ...defaultSettings,
        ...((currentData?.visualizer_settings as VisualizerSettings) || {}),
        ...newSettings,
      };

      const { error } = await supabase
        .from("VisualizerWidget")
        .update({
          visualizer_settings: mergedSettings,
        })
        .eq("user_id", userId);

      if (error) throw error;
    } catch (error) {
      console.error("Failed to update settings:", error);
      throw error;
    }
  },

  setIsLoading: (loading) => set({ isLoading: loading }),
}));
