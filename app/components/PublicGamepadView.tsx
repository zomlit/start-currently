import React, { useEffect, useState } from "react";
import { useParams } from "@tanstack/react-router";
import { supabase } from "@/utils/supabase/client";
import { GamepadViewer } from "./GamepadViewer";
import { defaultGamepadSettings } from "@/lib/gamepad-settings";
import type { GamepadState } from "@/types/gamepad";

interface GamepadSettings {
  backgroundColor: string;
  buttonColor: string;
  stickColor: string;
  scale: number;
}

export function PublicGamepadView() {
  const { username } = useParams({ from: "/$username/gamepad" });
  const [gamepadState, setGamepadState] = useState<GamepadState | null>(null);
  const [settings, setSettings] = useState<GamepadSettings>(defaultGamepadSettings);

  // Load initial settings
  useEffect(() => {
    async function loadSettings() {
      if (!username) return;

      try {
        const { data: profileData } = await supabase
          .from('UserProfile')
          .select('user_id')
          .eq('username', username)
          .single();

        if (profileData?.user_id) {
          const { data: widgetData } = await supabase
            .from('VisualizerWidget')
            .select('gamepad_settings')
            .eq('user_id', profileData.user_id)
            .single();

          if (widgetData?.gamepad_settings) {
            setSettings(widgetData.gamepad_settings);
          }
        }
      } catch (error) {
        console.error('Error loading gamepad settings:', error);
      }
    }

    loadSettings();
  }, [username]);

  // Subscribe to gamepad updates
  useEffect(() => {
    if (!username) return;

    console.log('Setting up gamepad subscription for:', username);
    const channel = supabase.channel(`gamepad:${username}`, {
      config: {
        broadcast: { self: true }
      }
    });
    
    channel
      .on('broadcast', { event: 'gamepadState' }, (payload) => {
        console.log('Received gamepad state:', payload);
        if (payload.payload?.gamepadState) {
          setGamepadState(payload.payload.gamepadState);
        }
      })
      .subscribe((status) => {
        console.log('Gamepad subscription status:', status);
      });

    return () => {
      console.log('Cleaning up gamepad subscription');
      supabase.removeChannel(channel);
    };
  }, [username]);

  return (
    <div className="h-screen w-screen">
      <GamepadViewer 
        settings={settings} 
        username={username}
        gamepadState={gamepadState}
      />
    </div>
  );
}