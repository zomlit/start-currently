import React, { useState } from "react";
import { useUser } from "@clerk/tanstack-start";
import { WidgetLayout } from "@/components/layouts/WidgetLayout";
import { GameOverlayViewer } from "@/components/GameOverlayViewer";
import { GameOverlaySettingsForm } from "@/components/widget-settings/GameOverlaySettingsForm";
import { defaultGameOverlaySettings } from "@/lib/game-overlay-settings";
import type { GameOverlaySettings } from "@/types/game-overlay";
import { useUpdateGameOverlaySettings } from "@/hooks/useUpdateGameOverlaySettings";

export function GameOverlaySection() {
  const { user } = useUser();
  const [settings, setSettings] = useState<GameOverlaySettings>({
    ...defaultGameOverlaySettings,
  });

  const { mutateAsync: updateSettings } = useUpdateGameOverlaySettings();

  const handleSettingsChange = async (
    newSettings: Partial<GameOverlaySettings>
  ) => {
    setSettings((current) => ({ ...current, ...newSettings }));
    try {
      await updateSettings(newSettings);
    } catch (error) {
      console.error("Failed to save settings:", error);
    }
  };

  const GameOverlayPreview = (
    <GameOverlayViewer
      settings={settings}
      username={user?.username}
      isPublicView={false}
      onSettingsChange={handleSettingsChange}
    />
  );

  const GameOverlaySettings = (
    <GameOverlaySettingsForm
      settings={settings}
      onSettingsChange={handleSettingsChange}
    />
  );

  return (
    <div className="max-h-[calc(100vh-var(--header-height)-var(--nav-height))] overflow-hidden">
      <WidgetLayout
        preview={GameOverlayPreview}
        settings={GameOverlaySettings}
      />
    </div>
  );
}
