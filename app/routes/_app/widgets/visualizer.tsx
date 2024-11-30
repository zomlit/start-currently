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
  const {
    settings,
    updateSettings,
    setProfiles,
    setCurrentProfile,
    currentProfile,
  } = useVisualizerStore();
  const [publicUrl, setPublicUrl] = useState("");

  // Update public URL
  useEffect(() => {
    const updateUrl = () => {
      if (user?.username) {
        const formattedUrl = `${window.location.origin}/${user.username}/visualizer`;
        setPublicUrl(formattedUrl);
      }
    };

    updateUrl();
  }, [user?.username]);

  // Create a wrapped version of updateSettings that includes the user ID
  const handleSettingsUpdate = useCallback(
    async (newSettings: Partial<VisualizerSettings>) => {
      if (!user?.id) throw new Error("No user found");
      return updateSettings(newSettings, user.id);
    },
    [user?.id, updateSettings]
  );

  // Load or create default profile on mount
  useEffect(() => {
    async function loadOrCreateProfile() {
      if (!user?.id) return;

      try {
        // First try to get existing profile
        const { data: profiles, error: fetchError } = await supabase
          .from("Profiles")
          .select("*")
          .eq("user_id", user.id)
          .eq("widget_type", "visualizer")
          .order("created_at", { ascending: false });

        if (fetchError) throw fetchError;

        setProfiles(profiles || []);

        const currentProfile =
          profiles?.find((p) => p.is_current) || profiles?.[0];
        if (currentProfile) {
          setCurrentProfile(currentProfile);
        } else {
          // Create default profile
          const { data: newProfile, error: insertError } = await supabase
            .from("Profiles")
            .insert({
              user_id: user.id,
              widget_type: "visualizer",
              name: "Default Profile",
              settings: defaultSettings,
              is_current: true,
              is_active: true,
              color: "#000000",
            })
            .select()
            .single();

          if (insertError) throw insertError;

          if (newProfile?.settings) {
            await updateSettings(newProfile.settings, user.id);
          }
        }
      } catch (error) {
        console.error("Error loading/creating visualizer profile:", error);
        toast.error("Failed to load visualizer settings");
      }
    }

    loadOrCreateProfile();
  }, [user?.id, updateSettings, setProfiles, setCurrentProfile]);

  const handleCopyPublicUrl = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      navigator.clipboard.writeText(publicUrl);
      toast.success("The public URL has been copied to your clipboard.");
    },
    [publicUrl]
  );

  const form = useForm<VisualizerSettings>({
    defaultValues: settings,
  });

  // Pass the form to VisualizerSettingsForm
  const VisualizerSettings = useMemo(() => {
    if (!currentProfile) return null;

    return (
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

        <div className="flex-1 overflow-y-auto">
          <VisualizerSettingsForm
            form={form}
            handleSettingChange={(key, value) => {
              form.setValue(key as keyof VisualizerSettings, value);
              handleSettingsUpdate({ [key]: value });
            }}
            handleSettingCommit={(key, value) => {
              handleSettingsUpdate({ [key]: value });
            }}
            currentProfile={currentProfile as WidgetProfile}
            colorSyncEnabled={settings.visualSettings.colorSync}
          />
        </div>
      </div>
    );
  }, [
    currentProfile,
    publicUrl,
    form,
    handleCopyPublicUrl,
    handleSettingsUpdate,
    settings.visualSettings.colorSync,
  ]);

  if (!currentProfile) {
    return <div>Loading...</div>;
  }

  return (
    <WidgetLayout
      preview={<VisualizerPreview settings={settings} />}
      settings={VisualizerSettings}
    />
  );
}
