import { create } from "zustand";
import { defaultChatSettings, type ChatSettings } from "@/types/chat";
import { supabase } from "@/utils/supabase/client";

interface ChatStore {
  settings: ChatSettings;
  updateSettings: (
    newSettings: Partial<ChatSettings>,
    userId: string
  ) => Promise<void>;
}

export const useChatStore = create<ChatStore>((set) => ({
  settings: defaultChatSettings,
  updateSettings: async (newSettings, userId) => {
    try {
      const { error } = await supabase.from("VisualizerWidget").upsert({
        user_id: userId,
        chat_settings: newSettings,
      });

      if (error) throw error;

      set((state) => ({
        settings: {
          ...state.settings,
          ...newSettings,
        },
      }));
    } catch (error) {
      console.error("Failed to update chat settings:", error);
      throw error;
    }
  },
}));
