import React, { useCallback, useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useUser } from "@clerk/tanstack-start";
import { WidgetLayout } from "@/components/layouts/WidgetLayout";

import { useVisualizerStore } from "@/store/visualizerStore";
import { supabase } from "@/utils/supabase/client";
import { toast } from "@/utils/toast";
import { VisualizerPreview } from "@/components/widget-settings/visualizer/VisualizerPreview";
import { defaultSettings } from "@/schemas/visualizer";
import { WidgetAuthGuard } from "@/components/auth/WidgetAuthGuard";
import { VisualizerSettingsForm } from "@/components/widget-settings/visualizer/VisualizerSettingsForm";
import type { VisualizerSettings } from "@/schemas/visualizer";
import { Spinner } from "@/components/ui/spinner";
import { PublicUrlHeader } from "@/components/widget-settings/PublicUrlHeader";

export const Route = createFileRoute("/_app/widgets/visualizer")({
  component: () => (
    <WidgetAuthGuard>
      <VisualizerSection />
    </WidgetAuthGuard>
  ),
});

function VisualizerSection() {
  const { user } = useUser();
  const { settings, loadSettings, updateSettings } = useVisualizerStore();
  const [publicUrl, setPublicUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Update public URL
  useEffect(() => {
    if (user?.username) {
      const formattedUrl = `${window.location.origin}/${user.username}/visualizer`;
      setPublicUrl(formattedUrl);
    }
  }, [user?.username]);

  // Handlers
  const handlePreviewUpdate = useCallback(
    (newSettings: Partial<VisualizerSettings>) => {
      useVisualizerStore.setState((state) => ({
        settings: {
          ...state.settings,
          ...newSettings,
        },
      }));
    },
    []
  );

  const handleSettingsUpdate = useCallback(
    async (newSettings: Partial<VisualizerSettings>) => {
      if (!user?.id) return;
      try {
        await updateSettings(newSettings, user.id);
      } catch (error) {
        console.error("Failed to update settings:", error);
        toast.error("Failed to save settings");
      }
    },
    [user?.id, updateSettings]
  );

  // Load initial settings
  useEffect(() => {
    async function initializeSettings() {
      if (!user?.id) return;
      setIsLoading(true);
      try {
        await loadSettings(user.id);
      } catch (error) {
        console.error("Failed to load settings:", error);
        toast.error("Failed to load settings");
      } finally {
        setIsLoading(false);
      }
    }

    initializeSettings();
  }, [user?.id, loadSettings]);

  return (
    <WidgetLayout
      preview={<VisualizerPreview settings={settings} />}
      settings={
        <div className="flex flex-col">
          <PublicUrlHeader publicUrl={publicUrl} />
          <div className="flex-1">
            {!isLoading && (
              <VisualizerSettingsForm
                settings={settings}
                onSettingsChange={handleSettingsUpdate}
                onPreviewUpdate={handlePreviewUpdate}
              />
            )}
          </div>
        </div>
      }
    />
  );
}
