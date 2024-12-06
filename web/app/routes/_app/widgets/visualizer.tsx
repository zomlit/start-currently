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
import { usePlaybackPolling } from "@/store/playbackStore";

export const Route = createFileRoute("/_app/widgets/visualizer")({
  component: () => (
    <WidgetAuthGuard>
      <VisualizerSection />
    </WidgetAuthGuard>
  ),
});

// Update the WidgetProfile type to match the form requirements
type WidgetProfile = {
  id: string;
  name: string;
  color: string;
  is_active: boolean;
  is_current: boolean;
  settings: {
    commonSettings: {
      backgroundColor?: string;
      textColor?: string;
      fontSize?: number;
      padding?: number;
      fontFamily?: string;
    };
    specificSettings: {
      mode: number;
      colorSync: boolean;
      canvasEnabled: boolean;
      micEnabled: boolean;
      backgroundOpacity: number;
      albumCanvas: boolean;
      backgroundCanvas: boolean;
      backgroundCanvasOpacity: number;
      pauseEnabled: boolean;
      hideOnDisabled: boolean;
      selectedSkin: string;
      progressBarForegroundColor: string;
      progressBarBackgroundColor?: string;
      gradient?: boolean;
      fillAlpha?: number;
      lineWidth?: number;
    };
  };
  widgetType: "visualizer" | "timer" | "lyrics";
};

function VisualizerSection() {
  const { user } = useUser();
  const { settings, updateSettings } = useVisualizerStore();
  const { track } = usePlaybackPolling();
  const [publicUrl, setPublicUrl] = useState("");

  // Create a wrapped version of updateSettings that includes the user ID
  const handleSettingsUpdate = useCallback(
    async (newSettings: Partial<VisualizerSettings>) => {
      console.log("🔃 Updating Settings:", newSettings); // Log settings updates
      if (!user?.id) {
        console.error("❌ No user found"); // Log error if no user
        throw new Error("No user found");
      }
      try {
        await updateSettings(newSettings, user.id);
        console.log("✨ Settings Updated Successfully"); // Log success
      } catch (error) {
        console.error("❌ Error updating settings:", error); // Log errors
        throw error;
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

  // Pass the wrapped version to VisualizerSettingsForm
  const VisualizerSettings = (
    <div className="flex flex-col">
      {/* Header with URL input */}
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
          settings={settings as VisualizerSettings}
          onSettingsChange={handleSettingsUpdate}
        />
      </div>
    </div>
  );

  return (
    <WidgetLayout
      preview={<VisualizerPreview settings={settings} />}
      settings={VisualizerSettings}
    />
  );
}
