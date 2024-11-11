import { useEffect, useState } from "react";
import { useParams } from "@tanstack/react-router";
import { useLyricsStore } from "@/store/lyricsStore";
import { supabase } from "@/utils/supabase/client";
import { Loader2 } from "lucide-react";
import { LyricsDisplay } from "@/components/lyrics/LyricsDisplay";

export function PublicLyricsPage() {
  const { username } = useParams({ from: "/_lyrics/$username/lyrics" });
  const { settings, loadPublicSettings } = useLyricsStore();
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [currentLyrics, setCurrentLyrics] = useState<string[]>([]);
  const [currentLine, setCurrentLine] = useState(0);

  // Load settings on mount
  useEffect(() => {
    async function loadUserAndSettings() {
      if (!username) return;
      try {
        await loadPublicSettings(username);
      } catch (error) {
        console.error('Error loading settings:', error);
      } finally {
        setIsLoadingSettings(false);
      }
    }

    loadUserAndSettings();
  }, [username, loadPublicSettings]);

  // Subscribe to lyrics updates
  useEffect(() => {
    if (!username) return;

    // Subscribe to lyrics channel
    const channel = supabase.channel(`public-lyrics:${username}`);
    
    channel
      .on('broadcast', { event: 'lyrics' }, ({ payload }) => {
        if (payload.lyrics) {
          setCurrentLyrics(payload.lyrics);
        }
      })
      .on('broadcast', { event: 'currentLine' }, ({ payload }) => {
        if (typeof payload.currentLine === 'number') {
          setCurrentLine(payload.currentLine);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [username]);

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