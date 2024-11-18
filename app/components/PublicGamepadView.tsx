import { useEffect, useState } from "react";
import { useParams } from "@tanstack/react-router";
import { supabase } from "@/utils/supabase/client";
import { GamepadViewer } from "@/components/GamepadViewer";
import { defaultSettings } from "@/routes/_app/widgets/gamepad";
import type { GamepadState } from "@/types/gamepad";

export function PublicGamepadView() {
  const { username } = useParams({ from: "/$username/gamepad" });
  const [gamepadState, setGamepadState] = useState<GamepadState | null>(null);
  const [settings, setSettings] = useState(defaultSettings);
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
            setSettings(widgetData.settings);
          }
        }
      } catch (error) {
        console.error("Error loading gamepad settings:", error);
        setError("Failed to load gamepad settings");
      }
    }

    loadSettings();
  }, [username]);

  // Subscribe to gamepad updates using userId instead of username
  useEffect(() => {
    if (!userId) return;

    console.log("Setting up gamepad subscription for user:", userId);
    const channel = supabase.channel(`gamepad:${userId}`, {
      config: {
        broadcast: { self: true },
      },
    });

    channel
      .on("broadcast", { event: "gamepadState" }, (payload) => {
        console.log("Received gamepad state:", payload);
        if (payload.payload?.gamepadState) {
          setGamepadState(payload.payload.gamepadState);
        }
      })
      .subscribe((status) => {
        console.log("Gamepad subscription status:", status);
      });

    return () => {
      console.log("Cleaning up gamepad subscription");
      channel.unsubscribe();
    };
  }, [userId]);

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen items-center justify-center bg-transparent">
      <GamepadViewer
        settings={settings}
        username={username}
        gamepadState={gamepadState}
        isPublicView={true}
      />
    </div>
  );
}
