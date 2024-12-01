import React, { useEffect, useCallback, useRef, useState } from "react";
import { useUser } from "@clerk/tanstack-start";
import { WidgetLayout } from "@/components/layouts/WidgetLayout";
import { GamepadViewer } from "@/components/GamepadViewer";
import { Button } from "@/components/ui/button";
import { Chrome, Copy, Download, Gauge } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

import { GamepadSettingsForm } from "@/components/widget-settings/GamepadSettingsForm";
import { defaultGamepadSettings } from "@/lib/gamepad-settings";
import type { GamepadSettings } from "@/types/gamepad";
import {
  useUpdateGamepadSettings,
  useGamepadSettings,
} from "@/hooks/useUpdateGamepadSettings";

import { useVisibilityChange } from "@/hooks/useVisibilityChange";
import { useGamepadContext } from "@/providers/GamepadProvider";
import { WidgetCTA } from "@/components/WidgetCTA";

export function GamepadSection() {
  const { user } = useUser();
  const { gamepadState, isConnected } = useGamepadContext();
  const [settings, setSettings] = useState<GamepadSettings>(
    defaultGamepadSettings
  );
  const [extensionError, setExtensionError] = useState<string | null>(null);

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

  const { mutateAsync: updateSettings } = useUpdateGamepadSettings();
  const { data: savedSettings, isLoading } = useGamepadSettings(user?.id);

  const handleSettingsChange = async (
    newSettings: Partial<GamepadSettings>
  ) => {
    try {
      const mergedSettings: GamepadSettings = {
        ...settings,
        ...newSettings,
      };

      setSettings(mergedSettings);

      await updateSettings({
        userId: user?.id,
        settings: mergedSettings,
      });
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast.error("Failed to save settings");
    }
  };

  // Load saved settings
  useEffect(() => {
    if (savedSettings?.settings) {
      setSettings({
        ...defaultGamepadSettings,
        ...savedSettings.settings,
      });
    } else if (!isLoading && user?.id) {
      updateSettings({
        userId: user.id,
        settings: defaultGamepadSettings,
      }).catch((error) => {
        console.error("Error creating default settings:", error);
      });
    }
  }, [savedSettings, isLoading, user?.id]);

  // Extension message handling
  useEffect(() => {
    const handleExtensionMessage = (event: MessageEvent) => {
      if (event.data.source !== "GAMEPAD_EXTENSION") return;

      switch (event.data.type) {
        case "EXTENSION_ERROR":
          if (event.data.error?.message === "Monitoring is disabled") {
            setExtensionError(null);
          } else {
            setExtensionError(
              event.data.error?.message || "Extension communication failed"
            );
            toast.error(
              "Gamepad extension error: " + event.data.error?.message
            );
          }
          break;
        case "MONITORING_STATE_CHANGED":
          if (event.data.enabled) {
            setExtensionError(null);
          }
          break;
        case "CONTENT_SCRIPT_READY":
          setExtensionError(null);
          console.log("Extension connected with ID:", event.data.extensionId);
          break;
      }
    };

    window.addEventListener("message", handleExtensionMessage);
    return () => window.removeEventListener("message", handleExtensionMessage);
  }, []);

  if (!user || !settings) return null;

  const GamepadPreview = (
    <div className="flex h-full flex-col">
      <div className="flex-1">
        <GamepadViewer
          settings={settings}
          username={user?.username || undefined}
          gamepadState={gamepadState}
          isPublicView={false}
          onSettingsChange={handleSettingsChange}
        />
      </div>
    </div>
  );

  const GamepadSettings = (
    <div className="flex flex-col">
      <div className="flex-none border-b bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
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
            onClick={() =>
              handleSettingsChange({ debugMode: !settings.debugMode })
            }
            variant={settings.debugMode ? "default" : "outline"}
            className="w-full"
            disabled={!isConnected}
          >
            <Gauge className="mr-2 h-4 w-4" />
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
        />
      </div>
    </div>
  );

  return (
    <>
      <WidgetCTA
        title="Chrome Extension"
        description={
          extensionError
            ? `Extension error: ${extensionError}. Please check if the extension is installed and enabled.`
            : "Install our Chrome extension to keep gamepad inputs working when minimized (great for dual streaming setups!)"
        }
        icon={Chrome}
        primaryAction={{
          label: extensionError
            ? "Troubleshoot Extension"
            : "Download Extension",
          icon: Download,
          onClick: () =>
            window.open(
              extensionError && window.chrome?.runtime?.id
                ? `chrome://extensions/?id=${window.chrome.runtime.id}`
                : import.meta.env.VITE_CHROME_STORE_URL ||
                    "https://livestreaming.tools/downloads/currently-gamepad-tracker.zip",
              "_blank"
            ),
        }}
      />
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
