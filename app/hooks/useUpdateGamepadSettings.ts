import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/utils/supabase/client";
import type { GamepadSettings } from "@/types/gamepad";

interface UpdateGamepadSettingsParams {
  userId: string | undefined;
  settings: Partial<GamepadSettings>;
}

export function useUpdateGamepadSettings() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ userId, settings }: UpdateGamepadSettingsParams) => {
      if (!userId) throw new Error("No user ID provided");

      // First get existing settings
      const { data: existingData, error: fetchError } = await supabase
        .from("GamepadWidget")
        .select("settings")
        .eq("user_id", userId)
        .single();

      // Merge existing settings with new changes
      const mergedSettings = {
        ...(existingData?.settings || {}),
        ...settings,
      };

      // If no existing settings, create new row
      if (fetchError && fetchError.code === "PGRST116") {
        const { data, error } = await supabase
          .from("GamepadWidget")
          .insert({
            user_id: userId,
            settings: mergedSettings,
            style: "default",
            layout: {},
            showPressedButtons: true,
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }

      // Otherwise update existing row
      const { data, error } = await supabase
        .from("GamepadWidget")
        .update({
          settings: mergedSettings,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gamepadSettings"] });
    },
  });

  return mutation;
}

// Keep the useGamepadSettings hook the same
export function useGamepadSettings(userId: string | undefined) {
  return useQuery({
    queryKey: ["gamepadSettings", userId],
    queryFn: async () => {
      if (!userId) return null;

      const { data, error } = await supabase
        .from("GamepadWidget")
        .select("settings, style, layout, showPressedButtons")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      return data;
    },
    enabled: !!userId,
  });
}
