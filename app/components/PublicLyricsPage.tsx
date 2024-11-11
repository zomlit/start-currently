import React, { useEffect, useState } from "react";
import { useParams } from "@tanstack/react-router";
import { useLyricsStore } from "@/store/lyricsStore";
import { supabase } from "@/utils/supabase/client";
import { Loader2 } from "lucide-react";
import { LyricsDisplay } from "./lyrics/LyricsDisplay";

// Font injection helper
const injectFont = (fontFamily: string) => {
  if (!fontFamily) return;

  // Skip system fonts
  if (['Arial', 'Helvetica', 'Times New Roman', 'serif', 'sans-serif'].includes(fontFamily)) {
    return;
  }

  // Check if font link already exists
  const existingLink = document.querySelector(`link[data-font="${fontFamily}"]`);
  if (existingLink) return;

  // Create and append new font link
  const link = document.createElement('link');
  link.href = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(/\s+/g, '+')}:wght@400;700&display=swap`;
  link.rel = 'stylesheet';
  link.setAttribute('data-font', fontFamily);
  document.head.appendChild(link);
};

export function PublicLyricsPage() {
  const { username } = useParams({ from: "/$username/lyrics" });
  const { settings, loadPublicSettings } = useLyricsStore();
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [currentLyrics, setCurrentLyrics] = useState<string[]>([]);
  const [currentLine, setCurrentLine] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Handle font injection when settings change
  useEffect(() => {
    if (settings?.fontFamily) {
      console.log('Loading font:', settings.fontFamily);
      injectFont(settings.fontFamily);
    }
  }, [settings?.fontFamily]);

  // Cleanup fonts on unmount
  useEffect(() => {
    return () => {
      // Remove any fonts we injected
      document.querySelectorAll('link[data-font]').forEach(link => {
        link.remove();
      });
    };
  }, []);

  // Load settings and subscribe to changes
  useEffect(() => {
    let mounted = true;

    async function loadUserAndSettings() {
      if (!username) return;
      try {
        // Get user_id first
        const { data: profileData, error: profileError } = await supabase
          .from('UserProfile')
          .select('user_id')
          .eq('username', username)
          .single();

        if (profileError) throw profileError;
        if (!profileData?.user_id) throw new Error('User not found');

        // Load initial settings
        await loadPublicSettings(username);

        // Subscribe to settings changes
        const channel = supabase
          .channel(`visualizer-settings:${profileData.user_id}`)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'VisualizerWidget',
              filter: `user_id=eq.${profileData.user_id}`,
            },
            async (payload: any) => {
              console.log('Settings changed:', payload);
              if (mounted && payload.new?.lyrics_settings) {
                await loadPublicSettings(username);
                // Font will be injected automatically when settings update
              }
            }
          )
          .subscribe();

        return () => {
          supabase.removeChannel(channel);
        };
      } catch (error) {
        console.error('Error loading settings:', error);
        if (mounted) {
          setError('Failed to load settings');
        }
      } finally {
        if (mounted) {
          setIsLoadingSettings(false);
        }
      }
    }

    loadUserAndSettings();
    return () => {
      mounted = false;
    };
  }, [username, loadPublicSettings]);

  // Subscribe to lyrics updates
  useEffect(() => {
    if (!username) return;

    console.log('Setting up realtime subscription for:', username);
    const channel = supabase.channel(`lyrics:${username}`);
    
    channel
      .on('broadcast', { event: 'lyrics' }, (payload) => {
        console.log('Received lyrics payload:', payload);
        if (Array.isArray(payload.payload?.lyrics)) {
          setCurrentLyrics(payload.payload.lyrics);
        }
      })
      .on('broadcast', { event: 'currentLine' }, (payload) => {
        console.log('Received currentLine payload:', payload);
        if (typeof payload.payload?.currentLine === 'number') {
          setCurrentLine(payload.payload.currentLine);
        }
      })
      .subscribe((status) => {
        console.log('Subscription status:', status);
      });

    return () => {
      console.log('Cleaning up subscription');
      supabase.removeChannel(channel);
    };
  }, [username]);

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (isLoadingSettings) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-screen w-screen">
      <LyricsDisplay
        lyrics={currentLyrics}
        currentLine={currentLine}
        settings={settings}
      />
    </div>
  );
}
