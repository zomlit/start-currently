import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/utils/supabase/client";
import { useUser } from "@clerk/tanstack-start";
import type { GamepadSettings } from "@/types/gamepad";

export function useUpdateGamepadSettings() {
  const { user } = useUser();

  return useMutation({
    mutationFn: async (newSettings: Partial<GamepadSettings>) => {
      if (!user?.id) {
        throw new Error("User not authenticated");
      }

      const { data, error } = await supabase
        .from("GamepadWidget")
        .update({
          settings: newSettings,
        })
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
    onError: (error) => {
      console.error("Failed to update gamepad settings:", error);
      throw error;
    },
  });
}
