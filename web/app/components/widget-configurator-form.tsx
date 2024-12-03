import React, { useMemo, useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WidgetType, WidgetProfile, Widget, ProfileSettings } from "@/types";
import { Form } from "@/components/ui/form";
import { useDynamicColors } from "@/hooks/useDynamicColors";
import StyleOptions from "@/components/widget-configurator/StyleOptions";
import WidgetOptions from "./widget-configurator/WidgetOptions";
import ChatOptions from "./widget-configurator/ChatOptions";
import { useOptimisticProfileSettings } from "@/contexts/OptimisticProfileSettingsContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/utils/toast";

type SettingType = "commonSettings" | "specificSettings";

type PreviewSettings = {
  commonSettings: Partial<ProfileSettings["commonSettings"]>;
  specificSettings: Partial<ProfileSettings["specificSettings"]>;
};

export const WidgetConfiguratorForm = React.memo(
  ({
    widgets,
    selectedWidget,
    selectedProfile,
    updateWidgetSettings,
  }: {
    widgets: Record<WidgetType, Widget>;
    selectedWidget: WidgetType;
    selectedProfile: string;
    updateWidgetSettings: (
      widgetType: WidgetType,
      profileId: string,
      settings: any
    ) => Promise<any>;
  }) => {
    const { optimisticProfileSettings, updateProfileSetting } =
      useOptimisticProfileSettings();
    const queryClient = useQueryClient();
    const form = useForm();

    const currentProfile = useMemo(() => {
      return widgets[selectedWidget]?.profiles.find(
        (profile) => profile.id === selectedProfile
      );
    }, [widgets, selectedWidget, selectedProfile]);

    const { palette, colorSyncEnabled } = useDynamicColors(
      {} as any,
      currentProfile?.settings?.specificSettings || {}
    );

    const [previewSettings, setPreviewSettings] = useState<PreviewSettings>(
      currentProfile?.settings || { commonSettings: {}, specificSettings: {} }
    );

    useEffect(() => {
      if (currentProfile?.settings) {
        form.reset(currentProfile.settings);
        setPreviewSettings(currentProfile.settings);
      }
    }, [currentProfile, form]);

    const handleProfileChange = useCallback(
      (settingType: keyof ProfileSettings, fieldName: string, value: any) => {
        if (!currentProfile) return;
        updateProfileSetting(settingType, fieldName, value);
      },
      [currentProfile, updateProfileSetting]
    );

    const updateSettingsMutation = useMutation({
      mutationFn: (data: any) =>
        updateWidgetSettings(selectedWidget, selectedProfile, data),
      onMutate: async (newData) => {
        await queryClient.cancelQueries({
          queryKey: ["profiles", selectedProfile],
        });
        const previousData = queryClient.getQueryData([
          "profiles",
          selectedProfile,
        ]);
        queryClient.setQueryData(["profiles", selectedProfile], (old: any) => ({
          ...old,
          settings: {
            ...old?.settings,
            ...newData,
          },
        }));
        return { previousData };
      },
      onError: (err, newData, context: any) => {
        if (context?.previousData) {
          queryClient.setQueryData(
            ["profiles", selectedProfile],
            context.previousData
          );
        }
        console.error("Error updating widget settings:", err);
        toast.error({
          title: "Failed to update settings",
          description: "Please try again later.",
        });
      },
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: ["profiles", selectedProfile],
        });
      },
    });

    const handleFinalChange = useCallback(
      async (settingType: SettingType, fieldName: string, value: any) => {
        if (!currentProfile) return;

        const updatedSettings = {
          ...currentProfile.settings,
          [settingType]: {
            ...currentProfile.settings[settingType],
            [fieldName]: value,
          },
        };

        try {
          const response = await updateSettingsMutation.mutateAsync({
            settings: updatedSettings,
          });
          if (response && response.status === 200) {
            toast.success({ title: "Settings updated successfully" });
          } else {
            console.error("Unexpected response:", response);
            toast.error({ title: "Failed to update settings" });
          }
        } catch (error) {
          console.error("Error updating widget settings:", error);
          // Error is now handled in the onError callback of the mutation
        }
      },
      [currentProfile, updateSettingsMutation]
    );

    const handlePreviewUpdate = useCallback(
      (newSettings: Partial<PreviewSettings>) => {
        setPreviewSettings((prevSettings) => ({
          ...prevSettings,
          ...newSettings,
          commonSettings: {
            ...prevSettings.commonSettings,
            ...(newSettings.commonSettings || {}),
          },
          specificSettings: {
            ...prevSettings.specificSettings,
            ...(newSettings.specificSettings || {}),
          },
        }));
      },
      []
    );

    if (!currentProfile) {
      return <div>No profile selected</div>;
    }

    return (
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((data) => console.log("form data", data))}
        >
          <div className="">
            <Card className="border-0 p-0">
              <CardContent className="border-0 p-0">
                <Tabs defaultValue="style">
                  <TabsList className="duration-2000 grid w-full grid-cols-3 !rounded-none bg-gradient/10 shadow-lg">
                    <TabsTrigger
                      value="style"
                      className="data-[state=active]:dark:bg-white/10"
                    >
                      Style
                    </TabsTrigger>
                    <TabsTrigger
                      value="options"
                      className="data-[state=active]:dark:bg-white/10"
                    >
                      Options
                    </TabsTrigger>
                    <TabsTrigger
                      value="chat"
                      className="data-[state=active]:dark:bg-white/10"
                    >
                      Chat
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="style" className="space-y-4 p-6">
                    <StyleOptions
                      currentProfile={currentProfile}
                      handleProfileChange={handleProfileChange}
                      handleFinalChange={handleFinalChange}
                      colorSyncEnabled={colorSyncEnabled}
                      initialOptimisticSettings={optimisticProfileSettings}
                      updateProfileSettingProp={updateProfileSetting}
                      onPreviewUpdate={handlePreviewUpdate}
                    />
                  </TabsContent>
                  <TabsContent value="options" className="space-y-4 px-6 py-2">
                    <WidgetOptions
                      form={form}
                      currentProfile={currentProfile}
                      handleProfileChange={handleProfileChange}
                      handleFinalChange={handleFinalChange}
                      selectedWidget={selectedWidget}
                      colorSyncEnabled={colorSyncEnabled}
                      palette={palette}
                      optimisticProfileSettings={optimisticProfileSettings}
                      updateProfileSetting={updateProfileSetting}
                    />
                  </TabsContent>
                  <TabsContent value="chat" className="space-y-4 px-6 py-2">
                    <ChatOptions
                      currentProfile={currentProfile}
                      handleProfileChange={handleProfileChange}
                      handleFinalChange={handleFinalChange}
                    />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </form>
      </Form>
    );
  }
);
