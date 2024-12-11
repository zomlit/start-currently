import { create } from "zustand";
import { defaultAlertsSettings, type AlertsSettings } from "@/types/alerts";
import { supabase } from "@/utils/supabase/client";

interface AlertsStore {
  settings: AlertsSettings;
  updateSettings: (
    newSettings: Partial<AlertsSettings>,
    userId: string
  ) => Promise<void>;
}

export const useAlertsStore = create<AlertsStore>((set) => ({
  settings: defaultAlertsSettings,
  updateSettings: async (newSettings, userId) => {
    try {
      const { error } = await supabase.from("VisualizerWidget").upsert({
        user_id: userId,
        alerts_settings: newSettings,
      });

      if (error) throw error;

      set((state) => ({
        settings: {
          ...state.settings,
          ...newSettings,
        },
      }));
    } catch (error) {
      console.error("Failed to update alerts settings:", error);
      throw error;
    }
  },
}));
