import { create } from 'zustand';
import { LyricsSettings, defaultLyricsSettings } from '@/types/lyrics';
import { supabase } from '@/utils/supabase/client';

interface LyricsStore {
  settings: LyricsSettings;
  updateSettings: (newSettings: Partial<LyricsSettings>, userId: string) => Promise<void>;
  loadPublicSettings: (username: string, settings?: Partial<LyricsSettings>) => Promise<void>;
}

export const useLyricsStore = create<LyricsStore>((set) => ({
  settings: defaultLyricsSettings,
  
  updateSettings: async (newSettings: Partial<LyricsSettings>, userId: string) => {
    try {
      if (!userId) throw new Error('No user ID provided');

      const mergedSettings = {
        ...defaultLyricsSettings,
        ...newSettings,
      };

      const { error } = await supabase
        .from('VisualizerWidget')
        .upsert({
          user_id: userId,
          type: 'lyrics',
          sensitivity: 1.0,
          colorScheme: 'default',
          visualization: 'bars',
          lyrics_settings: mergedSettings
        }, {
          onConflict: 'user_id',
          ignoreDuplicates: false
        });

      if (error) throw error;

      set((state) => ({
        settings: {
          ...state.settings,
          ...mergedSettings
        }
      }));

    } catch (error) {
      console.error('Error in updateSettings:', error);
      throw error;
    }
  },

  loadPublicSettings: async (username: string, settings?: Partial<LyricsSettings>) => {
    try {
      // If settings are provided directly, use them
      if (settings) {
        set({ 
          settings: {
            ...defaultLyricsSettings,
            ...settings
          }
        });
        return;
      }

      // Otherwise fetch from database
      const { data: profileData, error: profileError } = await supabase
        .from('UserProfile')
        .select('user_id')
        .eq('username', username)
        .single();

      if (profileError) throw profileError;

      // Then get the lyrics_settings from VisualizerWidget
      const { data: visualizerData, error: visualizerError } = await supabase
        .from('VisualizerWidget')
        .select('lyrics_settings')
        .eq('user_id', profileData.user_id)
        .single();

      if (visualizerError) {
        console.error('Error fetching settings:', visualizerError);
        set({ settings: defaultLyricsSettings });
        return;
      }

      // Safely parse the settings if they're a string
      let parsedSettings = visualizerData?.lyrics_settings;
      if (typeof parsedSettings === 'string') {
        try {
          parsedSettings = JSON.parse(parsedSettings);
        } catch (e) {
          console.error('Error parsing settings:', e);
          parsedSettings = defaultLyricsSettings;
        }
      }

      if (parsedSettings) {
        set({ 
          settings: {
            ...defaultLyricsSettings,
            ...parsedSettings
          }
        });
      } else {
        set({ settings: defaultLyricsSettings });
      }

    } catch (error) {
      console.error('Error loading public settings:', error);
      set({ settings: defaultLyricsSettings });
    }
  }
}));
