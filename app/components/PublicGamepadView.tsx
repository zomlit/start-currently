import React, { useEffect, useState } from "react";
import { useParams } from "@tanstack/react-router";
import { GamepadViewer } from "@/components/GamepadViewer";
import { supabase } from "@/utils/supabase/client";
import { useGamepad } from "@/hooks/useGamepad";
import { defaultGamepadSettings } from "@/lib/gamepad-settings";
import type { GamepadSettings, GamepadState } from "@/types/gamepad";

export function PublicGamepadView() {
  const { username } = useParams({ from: "/$username/gamepad" });
  const [gamepadState, setGamepadState] = useState<GamepadState | null>(null);
  const [settings, setSettings] = useState<GamepadSettings>(
    defaultGamepadSettings
  );
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Load initial settings and get userId
  useEffect(() => {
    async function loadSettings() {
      if (!username) return;

      try {
        const { data: profileData } = await supabase
          .from("UserProfile")
          .select("user_id")
          .eq("username", username)
          .single();

        if (profileData?.user_id) {
          setUserId(profileData.user_id);

          const { data: widgetData } = await supabase
            .from("GamepadWidget")
            .select("settings")
            .eq("user_id", profileData.user_id)
            .single();

          if (widgetData?.settings) {
            setSettings({
              ...defaultGamepadSettings,
              ...widgetData.settings,
            });
          }
        }
      } catch (error) {
        console.error("Error loading gamepad settings:", error);
        setError("Failed to load gamepad settings");
      }
    }

    loadSettings();
  }, [username]);

  // Setup Supabase channel for receiving gamepad state
  useEffect(() => {
    if (!userId) return;

    const channel = supabase.channel(`gamepad:${userId}`, {
      config: {
        broadcast: { self: false },
      },
    });

    channel
      .on("broadcast", { event: "gamepadState" }, (payload) => {
        console.log("Received gamepad state:", payload);
        if (payload.payload?.gamepadState) {
          setGamepadState(payload.payload.gamepadState);
        }
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [userId]);

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <GamepadViewer
      settings={settings}
      username={username}
      gamepadState={gamepadState}
      isPublicView={true}
    />
  );
}
