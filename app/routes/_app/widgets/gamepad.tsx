import React, { useEffect, useCallback, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useUser } from "@clerk/tanstack-start";
import { WidgetLayout } from "@/components/layouts/WidgetLayout";
import { GamepadViewer } from "@/components/GamepadViewer";
import { supabase } from "@/utils/supabase/client";
import { useGamepad } from "@/hooks/useGamepad";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

import { GamepadSettingsForm } from "@/components/widget-settings/GamepadSettingsForm";
import { defaultGamepadSettings } from "@/lib/gamepad-settings";
import { GamepadSettings, HookGamepadState } from "@/types/gamepad";
import { useUpdateGamepadSettings } from "@/hooks/useUpdateGamepadSettings";

interface GamepadState {
  buttons: boolean[];
  axes: number[];
}

const BUTTON_MAPPINGS = [
  "A",
  "B",
  "X",
  "Y",
  "LB",
  "RB",
  "LT",
  "RT",
  "Back",
  "Start",
  "LS",
  "RS",
  "DPad-Up",
  "DPad-Down",
  "DPad-Left",
  "DPad-Right",
  "Home",
  "Share",
];

const TOKEN_REFRESH_BUFFER = 60 * 1000; // Refresh 60 seconds before expiry
const TOKEN_UPDATE_INTERVAL = 60 * 1000; // Check token every 60 seconds

const DRIFT_THRESHOLD = 0.15; // Only filter movements below this threshold

export function GamepadSection() {
  const { user } = useUser();
  const channelRef = useRef<RealtimeChannel | null>(null);
  const [currentGamepadState, setCurrentGamepadState] =
    useState<GamepadState | null>(null);
  const [settings, setSettings] = useState<GamepadSettings>({
    ...defaultGamepadSettings,
  });

  // Use the useGamepad hook with the default deadzone
  const { gamepadState, isConnected: isGamepadConnected } = useGamepad(
    defaultGamepadSettings.deadzone || 0.1
  );

  // Setup Supabase channel
  useEffect(() => {
    if (!user?.id || !user?.username) return;

    const channel = supabase.channel(`gamepad:${user.username}`, {
      config: {
        broadcast: { self: false },
      },
    });

    channel.subscribe((status) => {
      if (status === "SUBSCRIBED") {
        channelRef.current = channel;
      }
    });

    return () => {
      channel.unsubscribe();
      channelRef.current = null;
    };
  }, [user?.id, user?.username]);

  // Watch gamepadState and broadcast changes
  useEffect(() => {
    if (!channelRef.current || !gamepadState) return;

    // Send the state directly
    channelRef.current.send({
      type: "broadcast",
      event: "gamepadState",
      payload: {
        gamepadState: {
          buttons: gamepadState.buttons.map((button) => button.pressed),
          axes: gamepadState.axes,
        },
      },
    });
  }, [gamepadState]);

  // Get the public URL
  const publicUrl = user?.username
    ? `${window.location.origin}/${user.username}/gamepad`
    : null;

  const handleCopyPublicUrl = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      if (user?.username) {
        const urlToCopy = `${window.location.origin}/${user.username}/gamepad`;
        navigator.clipboard
          .writeText(urlToCopy)
          .then(() => {
            toast.success("Public URL copied to clipboard");
          })
          .catch((err) => {
            console.error("Failed to copy URL to clipboard:", err);
            toast.error("Failed to copy URL to clipboard");
          });
      }
    },
    [user?.username]
  );

  const { mutateAsync: updateSettings } = useUpdateGamepadSettings();

  const handleSettingsChange = async (
    newSettings: Partial<GamepadSettings>
  ) => {
    // Update local state by merging with current settings
    setSettings((current) => ({ ...current, ...newSettings }));

    try {
      // Get current settings from database first
      const { data: currentData, error: fetchError } = await supabase
        .from("GamepadWidget")
        .select("settings")
        .eq("user_id", user?.id)
        .single();

      if (fetchError && fetchError.code !== "PGRST116") {
        throw fetchError;
      }

      // Merge existing settings with new changes
      const mergedSettings = {
        ...(currentData?.settings || {}),
        ...newSettings,
      };

      // Update database with merged settings
      const { error } = await supabase
        .from("GamepadWidget")
        .update({
          settings: mergedSettings,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user?.id);

      if (error) throw error;
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast.error("Failed to save settings");
    }
  };

  // Load saved settings on mount
  useEffect(() => {
    async function loadSettings() {
      if (!user?.id) return;

      try {
        // Try to get existing settings
        const { data, error } = await supabase
          .from("GamepadWidget")
          .select("settings")
          .eq("user_id", user.id)
          .single();

        if (error) {
          // If no row exists, create one with default settings
          if (error.code === "PGRST116") {
            const { error: insertError } = await supabase
              .from("GamepadWidget")
              .insert({
                user_id: user.id,
                settings: defaultGamepadSettings,
                style: "default",
                layout: {},
                showPressedButtons: true,
              });

            if (insertError) throw insertError;
            setSettings(defaultGamepadSettings);
            return;
          }
          throw error;
        }

        if (data?.settings) {
          setSettings({
            ...defaultGamepadSettings,
            ...data.settings,
          });
        }
      } catch (error) {
        console.error("Error loading settings:", error);
      }
    }

    loadSettings();
  }, [user?.id]);

  const renderStickValues = (axes: number[]) => {
    return (
      <div className="mt-4 grid grid-cols-2 gap-4 text-sm text-muted-foreground">
        <div>
          <p className="font-semibold">Left Stick</p>
          <p>X: {axes[0]?.toFixed(4) || "0.0000"}</p>
          <p>Y: {axes[1]?.toFixed(4) || "0.0000"}</p>
        </div>
        <div>
          <p className="font-semibold">Right Stick</p>
          <p>X: {axes[2]?.toFixed(4) || "0.0000"}</p>
          <p>Y: {axes[3]?.toFixed(4) || "0.0000"}</p>
        </div>
      </div>
    );
  };

  // Update GamepadViewer props in the preview
  const GamepadPreview = (
    <div className="flex h-full flex-col">
      <div className="flex-1">
        <GamepadViewer
          settings={settings}
          username={user?.username || undefined}
          gamepadState={
            gamepadState
              ? {
                  buttons: gamepadState.buttons.map((button) => button.pressed),
                  axes: gamepadState.axes,
                }
              : null
          }
          isPublicView={false}
          onSettingsChange={handleSettingsChange}
        />

        {/* Stick Values Display - Only show when gamepadState exists */}
        {gamepadState && (
          <div className="mx-auto max-w-md rounded-lg border bg-card p-4 shadow-sm">
            {renderStickValues(gamepadState.axes)}
          </div>
        )}
      </div>
    </div>
  );

  const GamepadSettings = (
    <div className="flex flex-col">
      {/* Header with URL input */}
      <div className="flex-none p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center space-x-2">
          <Input
            key={publicUrl}
            value={publicUrl || ""}
            readOnly
            className="flex-grow ring-offset-0 focus:ring-offset-0 focus-visible:ring-offset-0"
          />
          <Button
            onClick={handleCopyPublicUrl}
            size="icon"
            variant="outline"
            className="ring-offset-0 focus:ring-offset-0 focus-visible:ring-offset-0"
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="">
          <GamepadSettingsForm
            settings={settings}
            onSettingsChange={handleSettingsChange}
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-h-[calc(100vh-var(--header-height)-var(--nav-height))] overflow-hidden">
      <WidgetLayout preview={GamepadPreview} settings={GamepadSettings} />
    </div>
  );
}

export const Route = createFileRoute("/_app/widgets/gamepad")({
  component: GamepadSection,
  loader: async () => {
    return {
      keepAlive: true,
      backgroundPolling: true,
    };
  },
});
