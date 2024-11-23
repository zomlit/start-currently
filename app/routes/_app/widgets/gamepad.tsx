import React, { useEffect, useCallback, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useUser } from "@clerk/tanstack-start";
import { WidgetLayout } from "@/components/layouts/WidgetLayout";
import { GamepadViewer } from "@/components/GamepadViewer";
import { useGamepad } from "@/hooks/useGamepad";
import { Button } from "@/components/ui/button";
import { Copy, Gauge } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

import { GamepadSettingsForm } from "@/components/widget-settings/GamepadSettingsForm";
import { defaultGamepadSettings } from "@/lib/gamepad-settings";
import {
  GamepadSettings,
  HookGamepadState,
  isGamepadButtonState,
} from "@/types/gamepad";
import {
  useUpdateGamepadSettings,
  useGamepadSettings,
} from "@/hooks/useUpdateGamepadSettings";

import DS4Base from "@/icons/gamepad/ds4-base.svg?react";
import MachoBase from "@/icons/gamepad/macho-base.svg?react";
import DS4Buttons from "@/icons/gamepad/ds4-base-buttons.svg?react";
import DS4Sticks from "@/icons/gamepad/ds4-sticks.svg?react";

import { useVisibilityChange } from "@/hooks/useVisibilityChange";

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

function GamepadSection() {
  const { user } = useUser();
  const workerRef = useRef<Worker | null>(null);
  const [currentGamepadState, setCurrentGamepadState] =
    useState<GamepadState | null>(null);
  const [settings, setSettings] = useState<GamepadSettings>(
    defaultGamepadSettings
  );

  // Use the useGamepad hook with settings.deadzone or fallback
  const { gamepadState, isConnected: isGamepadConnected } = useGamepad(
    settings?.deadzone || defaultGamepadSettings.deadzone
  );

  // Add visibility tracking
  const isVisible = useVisibilityChange();
  const lastFrameTimeRef = useRef<number>(0);
  const MIN_FRAME_TIME = 1000 / 60; // Target 60fps

  // Initialize worker on client-side only
  useEffect(() => {
    if (typeof window !== "undefined") {
      workerRef.current = new Worker(
        new URL("@/workers/gamepad.worker.ts", import.meta.url)
      );

      // Cleanup worker on unmount
      return () => {
        workerRef.current?.terminate();
        workerRef.current = null;
      };
    }
  }, []);

  // Update the gamepad state processing
  useEffect(() => {
    if (!gamepadState || !user?.id) return;

    if (workerRef.current) {
      workerRef.current.postMessage({
        type: "INIT",
        gamepadState,
        userId: user.id,
      });

      workerRef.current.onmessage = async (event) => {
        const { type, state } = event.data;
        if (type === "STATE_UPDATE") {
          setCurrentGamepadState(state);
        }
      };
    }

    return () => {
      if (workerRef.current) {
        workerRef.current.postMessage({ type: "CLEANUP" });
      }
    };
  }, [gamepadState, user?.id]);

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
  const { data: savedSettings, isLoading } = useGamepadSettings(user?.id);

  const handleSettingsChange = async (
    newSettings: Partial<GamepadSettings>
  ) => {
    try {
      // Create a properly typed merged settings object
      const mergedSettings: GamepadSettings = {
        ...settings,
        ...newSettings,
      };

      // Update local state with properly typed object
      setSettings(mergedSettings);

      // Use the mutation to update settings in the database
      await updateSettings({
        userId: user?.id,
        settings: mergedSettings, // Send complete settings object
      });
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast.error("Failed to save settings");
    }
  };

  // Load saved settings when data is available
  useEffect(() => {
    if (savedSettings?.settings) {
      // Ensure we have a complete settings object
      setSettings({
        ...defaultGamepadSettings,
        ...savedSettings.settings,
      });
    } else if (!isLoading && user?.id) {
      // Only create default settings if we've finished loading and no settings exist
      updateSettings({
        userId: user.id,
        settings: defaultGamepadSettings,
      }).catch((error) => {
        console.error("Error creating default settings:", error);
      });
    }
  }, [savedSettings, isLoading, user?.id]);

  // Don't render until we have a user
  if (!user) {
    return null;
  }

  // Don't render until we have settings
  if (!settings) {
    return null; // Or a loading spinner
  }

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
                  buttons: gamepadState.buttons.map((button) =>
                    isGamepadButtonState(button) ? button.pressed : button
                  ),
                  axes: gamepadState.axes,
                }
              : null
          }
          isPublicView={false}
          onSettingsChange={handleSettingsChange}
        />
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

        {/* Add Drift Tool Button */}
        <div className="mt-4">
          <Button
            onClick={() =>
              handleSettingsChange({ debugMode: !settings.debugMode })
            }
            variant={settings.debugMode ? "default" : "outline"}
            className="w-full"
            disabled={!isGamepadConnected}
          >
            <Gauge className="mr-2 h-4 w-4" />
            {!isGamepadConnected
              ? "No Controller Detected"
              : settings.debugMode
                ? "Close Drift Tool"
                : "Open Drift Tool"}
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
    <div className="h-full overflow-hidden">
      <WidgetLayout
        preview={GamepadPreview}
        settings={GamepadSettings}
        className="min-h-[500px]" // Ensure minimum height
      />
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
