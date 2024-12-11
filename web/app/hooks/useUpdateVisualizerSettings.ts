import { useMutation } from "@tanstack/react-query";
import { cleanVisualizerSettings } from "@/utils/settings";
import { supabase } from "@/utils/supabase/client";
import type { VisualizerSettings } from "@/schemas/visualizer";

interface UpdateSettingsParams {
  userId: string;
  settings: Partial<VisualizerSettings>;
}

export const useUpdateVisualizerSettings = () => {
  return useMutation({
    mutationFn: async ({ userId, settings }: UpdateSettingsParams) => {
      // Clean up any flattened or duplicate fields
      const cleanedSettings = cleanVisualizerSettings({
        user_id: userId,
        visualizer_settings: settings,
      });

      // Remove any extra top-level fields that shouldn't be there
      const { user_id, type, visualizer_settings } = cleanedSettings;

      const payload = {
        user_id,
        type: "visualizer",
        visualizer_settings,
      };

      const { data, error } = await supabase
        .from("VisualizerWidget")
        .upsert(payload, {
          onConflict: "user_id",
        });

      if (error) throw error;
      return data;
    },
  });
};
