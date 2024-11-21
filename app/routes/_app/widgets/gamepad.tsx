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

// Add these helper functions at the top level
const AXIS_THRESHOLD = 0.05; // Minimum change in axis value to trigger an update

function hasSignificantAxisChange(
  oldAxes: number[],
  newAxes: number[]
): boolean {
  return newAxes.some((value, index) => {
    const oldValue = oldAxes[index] || 0;
    return Math.abs(value - oldValue) > AXIS_THRESHOLD;
  });
}

function hasButtonStateChanged(
  oldButtons: boolean[],
  newButtons: boolean[]
): boolean {
  return newButtons.some((value, index) => value !== oldButtons[index]);
}

export function GamepadSection() {
  const { user } = useUser();
  const channelRef = useRef<RealtimeChannel | null>(null);
  const [currentGamepadState, setCurrentGamepadState] =
    useState<GamepadState | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const frameRef = useRef<number>();
  const lastBroadcastRef = useRef<number>(0);
  const BROADCAST_INTERVAL = 16;
  const lastStateRef = useRef<string>("");

  // Use the useGamepad hook with the default deadzone
  const { gamepadState, isConnected: isGamepadConnected } = useGamepad(
    defaultGamepadSettings.deadzone || 0.1
  );

  const channelId = `gamepad:${user?.id}`;

  const lastValidStateRef = useRef<GamepadState>({
    buttons: Array(18).fill(false),
    axes: Array(4).fill(0),
  });

  const broadcastGamepadState = useCallback(
    async (state: HookGamepadState) => {
      if (!user?.id || !channelRef.current || !state) return;

      const now = performance.now();
      if (now - lastBroadcastRef.current < BROADCAST_INTERVAL) return;

      // Transform HookGamepadState to GamepadState
      const transformedState: GamepadState = {
        buttons: state.buttons.map((button) => button.pressed),
        axes: state.axes.map((value) =>
          Math.abs(value) < defaultGamepadSettings.deadzone ? 0 : value
        ),
      };

      // Check if the state has changed significantly
      const hasSignificantChange =
        hasSignificantAxisChange(
          lastValidStateRef.current.axes,
          transformedState.axes
        ) ||
        hasButtonStateChanged(
          lastValidStateRef.current.buttons,
          transformedState.buttons
        );

      if (!hasSignificantChange) return;

      // Update the last valid state
      lastValidStateRef.current = transformedState;
      lastBroadcastRef.current = now;

      try {
        await channelRef.current.send({
          type: "broadcast",
          event: "gamepadState",
          payload: { gamepadState: transformedState },
        });
      } catch (error) {
        console.error("Error broadcasting gamepad state:", error);
      }
    },
    [user?.id]
  );

  // Setup Supabase channel
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase.channel(channelId, {
      config: {
        broadcast: { self: false },
        presence: { key: user.id },
      },
    });

    channel
      .on("broadcast", { event: "gamepadState" }, (payload) => {
        if (payload.payload?.gamepadState) {
          setCurrentGamepadState(payload.payload.gamepadState);
        }
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          channelRef.current = channel;
          setIsConnected(true);
        } else {
          setIsConnected(false);
        }
      });

    return () => {
      channel.unsubscribe();
      channelRef.current = null;
    };
  }, [user?.id, channelId]);

  // Use RAF for smoother updates
  useEffect(() => {
    if (!gamepadState) return;

    const updateFrame = () => {
      const transformedState: GamepadState = {
        buttons: gamepadState.buttons.map((button) => button.pressed),
        axes: gamepadState.axes.map((value) =>
          Math.abs(value) < defaultGamepadSettings.deadzone ? 0 : value
        ),
      };

      // Check if the state has changed significantly
      const hasSignificantChange =
        hasSignificantAxisChange(
          lastValidStateRef.current.axes,
          transformedState.axes
        ) ||
        hasButtonStateChanged(
          lastValidStateRef.current.buttons,
          transformedState.buttons
        );

      if (hasSignificantChange) {
        setCurrentGamepadState(transformedState);
        broadcastGamepadState(gamepadState);
        lastValidStateRef.current = transformedState;
      }

      frameRef.current = requestAnimationFrame(updateFrame);
    };

    frameRef.current = requestAnimationFrame(updateFrame);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [gamepadState, broadcastGamepadState]);

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

  // Initialize settings with the imported default
  const [settings, setSettings] = useState<GamepadSettings>({
    ...defaultGamepadSettings,
  });

  const { mutateAsync: updateSettings } = useUpdateGamepadSettings();

  const handleSettingsChange = async (
    newSettings: Partial<GamepadSettings>
  ) => {
    setSettings((current) => ({ ...current, ...newSettings }));

    try {
      await updateSettings(newSettings);
    } catch (error) {
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
      <div className="flex-1 space-y-4">
        <GamepadViewer
          settings={settings}
          username={user?.username || undefined}
          gamepadState={currentGamepadState}
          isPublicView={false}
          onSettingsChange={handleSettingsChange}
        />

        {/* Stick Values Display */}
        {currentGamepadState && (
          <div className="mx-auto max-w-md rounded-lg border bg-card p-4 shadow-sm">
            {renderStickValues(currentGamepadState.axes)}
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
});
