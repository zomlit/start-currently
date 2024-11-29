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
    try {
      const currentProfile = get().currentProfile;
      const updatedSettings = {
        ...defaultSettings,
        ...newSettings,
      };

      if (!currentProfile) {
        // Create new profile if none exists
        const { data: newProfile, error: insertError } = await supabase
          .from("Profiles")
          .insert({
            user_id: userId,
            widget_type: "visualizer",
            name: "Default Profile",
            settings: updatedSettings,
            is_current: true,
            is_active: true,
            color: "#000000",
          })
          .select()
          .single();

        if (insertError) throw insertError;
        if (newProfile) {
          set({
            settings: updatedSettings,
            currentProfile: newProfile,
          });
        }
      } else {
        // Update existing profile
        const { error: updateError } = await supabase
          .from("Profiles")
          .update({
            settings: updatedSettings,
            updated_at: new Date().toISOString(),
          })
          .eq("id", currentProfile.id);

        if (updateError) throw updateError;

        set({
          settings: updatedSettings,
          currentProfile: {
            ...currentProfile,
            settings: updatedSettings,
            updated_at: new Date().toISOString(),
          },
        });
      }
    } catch (error) {
      console.error("Failed to update visualizer settings:", error);
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
