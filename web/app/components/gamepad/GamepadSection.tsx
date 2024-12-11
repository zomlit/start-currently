import React, { useEffect, useCallback, useRef, useState } from "react";
import { useUser } from "@clerk/tanstack-start";
import { WidgetLayout } from "@/components/layouts/WidgetLayout";
import { GamepadViewer } from "@/components/GamepadViewer";
import { Button } from "@/components/ui/button";
import { Chrome, Copy, Download, Gauge } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "@/utils/toast";
import _ from "lodash";

import { GamepadSettingsForm } from "@/components/widget-settings/GamepadSettingsForm";
import { defaultGamepadSettings } from "@/lib/gamepad-settings";
import type { GamepadSettings } from "@/types/gamepad";
import {
  useUpdateGamepadSettings,
  useGamepadSettings,
} from "@/hooks/useUpdateGamepadSettings";

import { useVisibilityChange } from "@/hooks/useVisibilityChange";
import { useGamepadContext } from "@/providers/GamepadProvider";
import { cn } from "@/lib/utils";

export function GamepadSection() {
  const { user } = useUser();
  const { gamepadState, isConnected, isExtensionEnabled, toggleExtension } =
    useGamepadContext();
  const { mutateAsync: updateSettings } = useUpdateGamepadSettings();
  const { data: savedSettings, isLoading } = useGamepadSettings(user?.id);

  // Initialize states with defaults
  const [settings, setSettings] = useState<GamepadSettings>(
    defaultGamepadSettings
  );
  const [previewSettings, setPreviewSettings] = useState<GamepadSettings>(
    defaultGamepadSettings
  );
  const [pendingSettings, setPendingSettings] = useState<
    Partial<GamepadSettings>
  >({});

  // Debounced save function
  const debouncedSave = useCallback(
    _.debounce(async (newSettings: GamepadSettings) => {
      try {
        await updateSettings({
          userId: user?.id,
          settings: newSettings,
        });
      } catch (error) {
        console.error("Failed to save settings:", error);
        toast.error("Failed to save settings");
      }
    }, 1000),
    [user?.id]
  );

  // Handle settings changes
  const handleSettingsChange = useCallback(
    async (newSettings: Partial<GamepadSettings>) => {
      const mergedSettings: GamepadSettings = {
        ...settings,
        ...newSettings,
        debugMode: settings.debugMode, // Preserve debug mode
      };

      setSettings(mergedSettings);
      setPreviewSettings(mergedSettings);

      // Debounced save
      debouncedSave(mergedSettings);
    },
    [settings, debouncedSave]
  );

  // Load saved settings only once when they're available
  useEffect(() => {
    if (savedSettings?.settings) {
      const loadedSettings = {
        ...defaultGamepadSettings,
        ...savedSettings.settings,
      };
      setSettings(loadedSettings);
      setPreviewSettings(loadedSettings);
    }
  }, [savedSettings]);

  // Handle debug mode toggle
  const handleDebugModeToggle = useCallback(() => {
    const newDebugMode = !settings.debugMode;
    const newSettings = {
      ...settings,
      debugMode: newDebugMode,
    };

    setSettings(newSettings);
    setPreviewSettings(newSettings);

    // Save immediately
    updateSettings({
      userId: user?.id,
      settings: newSettings,
    }).catch(console.error);
  }, [settings, user?.id, updateSettings]);

  // Get the public URL
  const publicUrl = user?.username
    ? `${window.location.origin}/${user.username}/gamepad`
    : "";

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

  // Add visibility tracking
  const isVisible = useVisibilityChange();
  const lastFrameTimeRef = useRef<number>(0);
  const MIN_FRAME_TIME = 1000 / 60; // Target 60fps

  // Extension message handling

  if (!user || !settings) return null;

  const GamepadPreview = (
    <div className="flex h-full flex-col">
      <div className="flex-1">
        <GamepadViewer
          settings={previewSettings}
          username={user?.username || undefined}
          gamepadState={gamepadState}
          isPublicView={false}
          onSettingsChange={handleSettingsChange}
          onDebugToggle={handleDebugModeToggle}
        />
      </div>
    </div>
  );

  const GamepadSettings = (
    <div className="flex flex-col">
      <div className="flex-none border-b bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
        <div className="flex items-center space-x-2">
          <Input
            value={publicUrl}
            readOnly
            className="flex-grow focus-visible:ring-offset-0 focus:ring-offset-0 ring-offset-0"
          />
          <Button
            onClick={handleCopyPublicUrl}
            size="icon"
            variant="outline"
            className="focus-visible:ring-offset-0 focus:ring-offset-0 ring-offset-0"
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>

        <div className="mt-4">
          <Button
            onClick={handleDebugModeToggle}
            className={cn("w-full", settings.debugMode ? "bg-pink-950" : "")}
            disabled={!isConnected}
          >
            <Gauge className="h-4 w-4" />
            {!isConnected
              ? "No Controller Detected"
              : settings.debugMode
                ? "Close Drift Tool"
                : "Open Drift Tool"}
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <GamepadSettingsForm
          settings={settings}
          onSettingsChange={handleSettingsChange}
          onPreviewUpdate={handleSettingsChange}
          isExtensionEnabled={isExtensionEnabled}
          toggleExtension={toggleExtension}
        />
      </div>
    </div>
  );

  return (
    <>
      <div className="h-full overflow-hidden">
        <WidgetLayout
          preview={GamepadPreview}
          settings={GamepadSettings}
          className="min-h-[500px]"
        />
      </div>
    </>
  );
}
