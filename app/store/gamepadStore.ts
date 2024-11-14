import { create } from 'zustand';
import { supabase } from "@/utils/supabase/client";
import { defaultGamepadSettings } from "@/lib/gamepad-settings";
import type { GamepadSettings } from "@/lib/gamepad-settings";

interface GamepadStore {
  settings: GamepadSettings;
  updateSettings: (newSettings: Partial<GamepadSettings>, userId: string) => Promise<void>;
  loadPublicSettings: (username: string, settings?: Partial<GamepadSettings>) => Promise<void>;
}

export const useGamepadStore = create<GamepadStore>((set) => ({
  settings: defaultGamepadSettings,
  
  updateSettings: async (newSettings: Partial<GamepadSettings>, userId: string) => {
    try {
      if (!userId) throw new Error('No user ID provided');

      const mergedSettings = {
        ...defaultGamepadSettings,
        ...newSettings,
      } as GamepadSettings;

      // First check if entry exists
      const { data: existingData } = await supabase
        .from('GamepadWidget')
        .select('id')
        .eq('user_id', userId)
        .single();

      // If no entry exists, create one with default settings
      if (!existingData) {
        const { error: insertError } = await supabase
          .from('GamepadWidget')
          .insert({
            user_id: userId,
            gamepad_settings: mergedSettings,
            layout: {},
            showPressedButtons: true,
            style: 'default'
          });

        if (insertError) throw insertError;
      } else {
        // Update existing entry
        const { error: updateError } = await supabase
          .from('GamepadWidget')
          .update({
            gamepad_settings: mergedSettings
          })
          .eq('user_id', userId);

        if (updateError) throw updateError;
      }

      set({ settings: mergedSettings });

    } catch (error) {
      console.error('Error in updateSettings:', error);
      throw error;
    }
  },

  loadPublicSettings: async (username: string, settings?: Partial<GamepadSettings>) => {
    try {
      // If settings are provided directly, use them
      if (settings) {
        set({ 
          settings: {
            ...defaultGamepadSettings,
            ...settings
          } as GamepadSettings
        });
        return;
      }

      // Get user_id from User table
      const { data: userData } = await supabase
        .from('User')
        .select('id')
        .eq('user_id', username)
        .single();

      if (!userData?.id) {
        console.log('User not found, using default settings');
        set({ settings: defaultGamepadSettings });
        return;
      }

      // Get gamepad_settings from GamepadWidget
      const { data: widgetData } = await supabase
        .from('GamepadWidget')
        .select('gamepad_settings')
        .eq('user_id', userData.id)
        .single();

      if (!widgetData?.gamepad_settings) {
        console.log('No settings found, using defaults');
        set({ settings: defaultGamepadSettings });
        return;
      }

      // Handle the settings data
      const loadedSettings = widgetData.gamepad_settings;
      
      if (loadedSettings && typeof loadedSettings === 'object') {
        set({ 
          settings: {
            ...defaultGamepadSettings,
            ...loadedSettings
          } as GamepadSettings
        });
      } else {
        set({ settings: defaultGamepadSettings });
      }

    } catch (error) {
      console.error('Error loading public settings:', error);
      set({ settings: defaultGamepadSettings });
    }
  }
})); 