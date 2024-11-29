import { SettingsForm } from "@/components/widget-settings/SettingsForm";
import type { UseFormReturn } from "react-hook-form";
import { FormProvider } from "react-hook-form";
import type { WidgetProfile } from "@/types/widget";
import type { VisualizerSettings } from "@/types/visualizer";

interface VisualizerSettingsFormProps {
  form: UseFormReturn<VisualizerSettings>;
  handleSettingChange: (key: string, value: any) => void;
  handleSettingCommit: (key: string, value: any) => void;
  currentProfile: WidgetProfile;
  colorSyncEnabled: boolean;
}

export const VisualizerSettingsForm: React.FC<VisualizerSettingsFormProps> = ({
  form,
  handleSettingChange,
  handleSettingCommit,
  currentProfile,
  colorSyncEnabled,
}) => {
  return (
    <FormProvider {...form}>
      <div className="space-y-6">
        <SettingsForm
          handleSettingChange={handleSettingChange}
          handleSettingCommit={handleSettingCommit}
          currentProfile={currentProfile}
          colorSyncEnabled={colorSyncEnabled}
        />
        {/* Other visualizer-specific settings */}
      </div>
    </FormProvider>
  );
};
