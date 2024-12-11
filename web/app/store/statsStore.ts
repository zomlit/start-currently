import { create } from "zustand";
import { defaultStatsSettings, type StatsSettings } from "@/types/stats";
import { supabase } from "@/utils/supabase/client";

interface StatsStore {
  settings: StatsSettings;
  updateSettings: (
    newSettings: Partial<StatsSettings>,
    userId: string
  ) => Promise<void>;
}

export const useStatsStore = create<StatsStore>((set) => ({
  settings: defaultStatsSettings,
  updateSettings: async (newSettings, userId) => {
    try {
      const { error } = await supabase.from("VisualizerWidget").upsert({
        user_id: userId,
        stats_settings: newSettings,
      });

      if (error) throw error;

      set((state) => ({
        settings: {
          ...state.settings,
          ...newSettings,
        },
      }));
    } catch (error) {
      console.error("Failed to update stats settings:", error);
      throw error;
    }
  },
}));
