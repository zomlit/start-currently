import React, { useCallback, useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useUser } from "@clerk/tanstack-start";
import { WidgetLayout } from "@/components/layouts/WidgetLayout";

import { useVisualizerStore } from "@/store/visualizerStore";
import { supabase } from "@/utils/supabase/client";
import { toast } from "sonner";
import { Copy } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { VisualizerPreview } from "@/components/widget-settings/visualizer/VisualizerPreview";
import { defaultSettings } from "@/types/visualizer";
import { WidgetAuthGuard } from "@/components/auth/WidgetAuthGuard";
import { VisualizerSettingsForm } from "@/components/widget-settings/visualizer/VisualizerSettingsForm";
import { useForm } from "react-hook-form";
import type { VisualizerSettings } from "@/types/visualizer";

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
          useVisualizerStore.setState((state) => ({
            settings: {
              ...defaultSettings,
              ...data.visualizer_settings,
            },
          }));
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

  // Separate handlers for preview and save
  const handlePreviewUpdate = useCallback(
    (newSettings: Partial<VisualizerSettings>) => {
      // Preserve existing settings structure
      useVisualizerStore.setState((state) => {
        if ("commonSettings" in newSettings) {
          return {
            settings: {
              ...state.settings,
              commonSettings: {
                ...state.settings.commonSettings,
                ...newSettings.commonSettings,
              },
            },
          };
        }
        return {
          settings: {
            ...state.settings,
            ...newSettings,
          },
        };
      });
    },
    []
  );

  const handleSettingsUpdate = useCallback(
    async (newSettings: Partial<VisualizerSettings>) => {
      if (!user?.id) return;

      try {
        // This will now properly merge with existing settings
        await updateSettings(newSettings, user.id);
      } catch (error) {
        console.error("Failed to update settings:", error);
        toast.error("Failed to save settings");
      }
    },
    [user?.id, updateSettings]
  );

  // Log when settings change
  useEffect(() => {
    console.log("📊 Current Settings:", settings);
  }, [settings]);

  // Update public URL
  useEffect(() => {
    if (user?.username) {
      const formattedUrl = `${window.location.origin}/${user.username}/visualizer`;
      setPublicUrl(formattedUrl);
    }
  }, [user?.username]);

  const handleCopyPublicUrl = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      navigator.clipboard.writeText(publicUrl);
      toast.success("The public URL has been copied to your clipboard.");
    },
    [publicUrl]
  );

  return (
    <WidgetLayout
      preview={<VisualizerPreview settings={settings} />}
      settings={
        <div className="flex flex-col">
          <div className="flex-none p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex items-center space-x-2">
              <Input
                key={publicUrl}
                value={publicUrl}
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
