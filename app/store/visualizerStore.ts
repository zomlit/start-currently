import { create } from "zustand";
import { defaultSettings, type VisualizerSettings } from "@/types/visualizer";
import { supabase } from "@/utils/supabase/client";
import type { Tables } from "@/types/supabase";

type Profile = Tables<"Profiles">;

interface VisualizerStore {
  settings: VisualizerSettings;
  currentProfile: Profile | null;
  profiles: Profile[];
  isLoading: boolean;
  updateSettings: (
    newSettings: Partial<VisualizerSettings>,
    userId: string
  ) => Promise<void>;
  setCurrentProfile: (profile: Profile | null) => void;
  setProfiles: (profiles: Profile[]) => void;
  setIsLoading: (loading: boolean) => void;
}

export const useVisualizerStore = create<VisualizerStore>((set, get) => ({
  settings: defaultSettings,
  currentProfile: null,
  profiles: [],
  isLoading: true,

  updateSettings: async (newSettings, userId) => {
    console.log("🏪 Store Update:", { newSettings, userId }); // Log store updates
    try {
      set((state) => ({
        settings: {
          ...state.settings,
          ...newSettings,
        },
      }));

      // Log before database update
      console.log("💾 Saving to database...", newSettings);

      const { error } = await supabase.from("VisualizerWidget").upsert({
        user_id: userId,
        settings: newSettings,
      });

      if (error) {
        console.error("❌ Database Error:", error); // Log database errors
        throw error;
      }

      console.log("✅ Database Updated Successfully");
    } catch (error) {
      console.error("❌ Store Update Error:", error);
      throw error;
    }
  },

  setCurrentProfile: (profile) => {
    if (profile?.settings) {
      set({
        currentProfile: profile,
        settings: profile.settings as VisualizerSettings,
      });
    } else {
      set({
        currentProfile: profile,
        settings: defaultSettings,
      });
    }
  },

  setProfiles: (profiles) => set({ profiles }),
  setIsLoading: (loading) => set({ isLoading: loading }),
}));
