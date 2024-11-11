import { create } from 'zustand';
import { LyricsSettings } from '@/types/lyrics';
import { defaultLyricsSettings } from '@/routes/_lyrics/lyrics.index';
import { supabase } from '@/utils/supabase/client';

interface LyricsStore {
  settings: LyricsSettings;
  updateSettings: (newSettings: LyricsSettings) => Promise<void>;
}

export const useLyricsStore = create<LyricsStore>((set) => ({
  settings: defaultLyricsSettings,
  updateSettings: async (newSettings: LyricsSettings) => {
    console.log('Store updateSettings called with:', newSettings);
    
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) {
        console.error('Auth error:', authError);
        throw authError;
      }
      
      if (!user) {
        throw new Error('No user found');
      }

      // Use upsert operation (insert if not exists, update if exists)
      const { data, error } = await supabase
        .from('VisualizerWidget')
        .upsert({
          user_id: user.id,
          type: 'default',
          sensitivity: 0.5,
          colorScheme: 'default',
          visualization: 'bars',
          lyrics_settings: newSettings
        }, {
          onConflict: 'user_id',  // Specify the unique constraint
          ignoreDuplicates: false // We want to update if exists
        })
        .select()
        .single();

      console.log('Upsert response:', { data, error });
      
      if (error) {
        console.error('Upsert error:', error);
        throw error;
      }

      // Update local state
      set({ settings: newSettings });
      console.log('Settings updated successfully in store');
      
    } catch (error) {
      console.error('Error in store updateSettings:', error);
      throw error;
    }
  },
})); 