import React, { useCallback, useEffect, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@clerk/tanstack-start";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { WidgetLayout } from "@/components/layouts/WidgetLayout";
import { useQueryClient } from "@tanstack/react-query";
import { useProfile, useProfiles } from "@/hooks/useProfile";
import { useVisualizerStore } from "@/store/visualizerStore";
import { VisualizerPreview } from "@/components/widget-settings/visualizer/VisualizerPreview";
import { CreateProfileDialog } from "@/components/widget-settings/visualizer/CreateProfileDialog";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Accordion } from "@/components/ui/accordion";
import { useDebouncedCallback } from "use-debounce";
import { toast } from "sonner";
import { RotateCcw } from "lucide-react";
import { supabase } from "@/utils/supabase/client";

import { ColorSection } from "@/components/widget-settings/ColorSection";
import { TypographySection } from "@/components/widget-settings/TypographySection";
import { BorderAndSpacingSection } from "@/components/widget-settings/BorderAndSpacingSection";
import { AppearanceSection } from "@/components/widget-settings/visualizer/sections/AppearanceSection";
import { AudioSection } from "@/components/widget-settings/visualizer/sections/AudioSection";
import { VisualsSection } from "@/components/widget-settings/visualizer/sections/VisualsSection";
import { AdvancedSection } from "@/components/widget-settings/visualizer/sections/AdvancedSection";

import type { VisualizerProfile, VisualizerSettings } from "@/types/visualizer";
import { visualizerSettingsSchema } from "@/types/visualizer";

export const Route = createFileRoute("/_app/widgets/visualizer")({
  component: () => <VisualizerPage />,
});

function VisualizerPage() {
  const { userId, isLoaded, user } = useAuth();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const { selectedProfileId, setSelectedProfileId } = useVisualizerStore();

  const {
    data: profiles = [],
    isLoading: isProfilesLoading,
    error: profilesError,
  } = useProfiles("visualizer", {
    onSuccess: (data: VisualizerProfile[]) => {
      if (data.length > 0 && !selectedProfileId) {
        const defaultProfile = data.find((p) => p.settings.isDefault);
        setSelectedProfileId(defaultProfile?.id || data[0].id);
      }
    },
  });

  const {
    data: profile,
    isLoading: isProfileLoading,
    mutate: updateProfile,
  } = useProfile("visualizer", selectedProfileId);

  const form = useForm<VisualizerSettings>({
    resolver: zodResolver(visualizerSettingsSchema),
    defaultValues: {
      commonSettings: {
        fontFamily: "Inter",
        fontSize: 16,
        lineHeight: 1.5,
        textTransform: "none",
        backgroundColor: "rgba(0, 0, 0, 1)",
        fontColor: "rgba(255, 255, 255, 1)",
        borderRadius: 0,
        borderTopWidth: 0,
        borderRightWidth: 0,
        borderBottomWidth: 0,
        borderLeftWidth: 0,
        paddingTop: 0,
        paddingRight: 0,
        paddingBottom: 0,
        paddingLeft: 0,
        gap: 0,
      },
      specificSettings: {
        selectedSkin: "rounded",
        hideOnDisabled: false,
        pauseEnabled: false,
        canvasEnabled: false,
        backgroundCanvas: false,
        backgroundCanvasOpacity: 0.5,
        micEnabled: false,
        progressBarForegroundColor: "#ffffff",
        progressBarBackgroundColor: "#000000",
        mode: 0,
        gradient: "rainbow",
        fillAlpha: 0.5,
        lineWidth: 1,
        channelLayout: "dual-combined",
        frequencyScale: "bark",
        linearAmplitude: true,
        linearBoost: 1.8,
        showPeaks: false,
        outlineBars: true,
        weightingFilter: "D",
        barSpace: 0.1,
        ledBars: false,
        lumiBars: false,
        reflexRatio: 0,
        reflexAlpha: 0.15,
        reflexBright: 1,
        mirror: 0,
        splitGradient: false,
      },
    },
    values: profile?.settings,
  });

  // Add settings persistence
  const handleSettingsUpdate = useCallback(
    async (newSettings: Partial<VisualizerSettings>) => {
      if (!user?.id) throw new Error("No user found");

      try {
        const { data, error } = await supabase
          .from("VisualizerWidget")
          .upsert({
            user_id: user.id,
            visualizer_settings: newSettings,
          })
          .select()
          .single();

        if (error) throw error;

        toast.success("Settings saved successfully");
        return data;
      } catch (error) {
        console.error("Error saving settings:", error);
        toast.error("Failed to save settings");
        throw error;
      }
    },
    [user?.id]
  );

  // Load settings on mount
  useEffect(() => {
    async function loadSettings() {
      if (!user?.id) return;
      try {
        const { data, error } = await supabase
          .from("VisualizerWidget")
          .select("visualizer_settings")
          .eq("user_id", user.id)
          .single();

        if (error) throw error;

        if (data?.visualizer_settings) {
          form.reset(data.visualizer_settings);
        }
      } catch (error) {
        console.error("Error loading settings:", error);
      }
    }

    loadSettings();
  }, [user?.id, form]);

  // Update the debouncedSettingsChange to use handleSettingsUpdate
  const debouncedSettingsChange = useDebouncedCallback(
    async (updatedSettings: Partial<VisualizerSettings>) => {
      try {
        await handleSettingsUpdate(updatedSettings);
      } catch (error) {
        console.error("Error saving settings:", error);
      }
    },
    500
  );

  // Update the preview component to use the settings
  const VisualizerPreviewContent = useMemo(() => {
    if (!profile) return null;

    const { commonSettings, specificSettings } = form.getValues();

    return (
      <div
        className="h-full w-full relative"
        style={{
          backgroundColor: commonSettings.backgroundColor,
          padding: `${commonSettings.padding}px`,
          fontFamily: `'${commonSettings.fontFamily}', sans-serif`,
          fontSize: `${commonSettings.fontSize}px`,
          lineHeight: commonSettings.lineHeight,
          color: commonSettings.fontColor,
          borderRadius: `${commonSettings.borderRadius}px`,
          borderWidth: `${commonSettings.borderWidth}px`,
          gap: `${commonSettings.gap}px`,
        }}
      >
        <VisualizerPreview
          profile={profile}
          userId={userId || ""}
          settings={form.getValues()}
        />
      </div>
    );
  }, [profile, form, userId]);

  const handleSettingChange = useCallback(
    (
      field: keyof VisualizerSettings | `${keyof VisualizerSettings}.${string}`,
      value: any
    ) => {
      form.setValue(field, value, { shouldDirty: true });

      const updatedSettings = {
        ...form.getValues(),
        [field]: value,
      };

      debouncedSettingsChange(updatedSettings);
    },
    [form, debouncedSettingsChange]
  );

  const handleResetToDefaults = async () => {
    try {
      const defaultSettings = visualizerSettingsSchema.parse({});
      form.reset(defaultSettings);
      await debouncedSettingsChange(defaultSettings);

      toast({
        description: "All settings have been restored to their default values.",
      });
    } catch (error) {
      console.error("Error resetting settings:", error);
      toast({
        variant: "destructive",
        description: "Your settings couldn't be reset. Please try again.",
      });
    }
  };

  // Loading state
  if (!isLoaded || isProfilesLoading || isProfileLoading) {
    return (
      <div className="flex flex-col items-center justify-center">
        <Spinner className="h-10 w-10" />
        <p>Please sign in to access the visualizer settings</p>
      </div>
    );
  }

  // Error state
  if (profilesError) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4">
        <p className="text-red-500">
          Error loading profiles: {profilesError.message}
        </p>
        <Button
          onClick={() =>
            queryClient.invalidateQueries({
              queryKey: ["profiles", "visualizer"],
            })
          }
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <>
      <WidgetLayout
        preview={VisualizerPreviewContent}
        settings={
          <Form {...form}>
            <form className="space-y-4">
              <Accordion
                type="multiple"
                defaultValue={[
                  "colors",
                  "typography",
                  "border-and-spacing",
                  "appearance",
                  "audio",
                  "visuals",
                  "advanced",
                ]}
              >
                <ColorSection
                  form={form}
                  handleSettingChange={handleSettingChange}
                  handleSettingCommit={handleSettingChange}
                  widgetType="visualizer"
                />
                <TypographySection
                  form={form}
                  handleSettingChange={handleSettingChange}
                  handleSettingCommit={handleSettingChange}
                  currentProfile={profile}
                  widgetType="visualizer"
                />
                <BorderAndSpacingSection
                  form={form}
                  handleSettingChange={handleSettingChange}
                  handleSettingCommit={handleSettingChange}
                  localSettings={profile?.settings.specificSettings || {}}
                  widgetType="visualizer"
                  currentProfile={profile}
                />
                <AppearanceSection form={form} profile={profile} />
                <AudioSection form={form} />
                <VisualsSection form={form} />
                <AdvancedSection form={form} />
              </Accordion>

              <div className="flex !overflow-hidden">
                <Button
                  type="button"
                  onClick={handleResetToDefaults}
                  variant="outline"
                  className="w-full"
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Reset to Defaults
                </Button>

                <Button
                  type="submit"
                  className="w-full ml-2"
                  disabled={!form.formState.isDirty}
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </Form>
        }
      />
      <CreateProfileDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
      />
    </>
  );
}
