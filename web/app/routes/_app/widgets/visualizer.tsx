import React, { useCallback, useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useUser } from "@clerk/tanstack-start";
import { WidgetLayout } from "@/components/layouts/WidgetLayout";

import { useVisualizerStore } from "@/store/visualizerStore";
import { supabase } from "@/utils/supabase/client";
import { toast } from "sonner";
import { VisualizerPreview } from "@/components/widget-settings/visualizer/VisualizerPreview";
import { defaultSettings } from "@/types/visualizer";
import { WidgetAuthGuard } from "@/components/auth/WidgetAuthGuard";
import { VisualizerSettingsForm } from "@/components/widget-settings/visualizer/VisualizerSettingsForm";
import type { VisualizerSettings } from "@/types/visualizer";
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
  const { settings, updateSettings } = useVisualizerStore();
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
    async function loadSettings() {
      if (!user?.id) return;
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from("VisualizerWidget")
          .select("visualizer_settings")
          .eq("user_id", user.id)
          .single();

        if (error) throw error;

        if (data?.visualizer_settings) {
          const mergedSettings = {
            ...defaultSettings,
            ...data.visualizer_settings,
          };
          useVisualizerStore.setState({ settings: mergedSettings });
        }
      } catch (error) {
        console.error("Failed to load visualizer settings:", error);
        toast.error("Failed to load settings");
      } finally {
        setIsLoading(false);
      }
    }

    loadSettings();
  }, [user?.id]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner className="w-8 h-8 dark:fill-white" />
      </div>
    );
  }

  return (
    <WidgetLayout
      preview={<VisualizerPreview settings={settings} />}
      settings={
        <div className="flex flex-col">
          <PublicUrlHeader publicUrl={publicUrl} />
          <div className="flex-1">
            <VisualizerSettingsForm
              settings={settings}
              onSettingsChange={handleSettingsUpdate}
              onPreviewUpdate={handlePreviewUpdate}
              isLoading={isLoading}
            />
          </div>
        </div>
      }
    />
  );
}
