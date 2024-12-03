import { useFormContext } from "react-hook-form";
import { Accordion } from "@/components/ui/accordion";
import type { VisualizerSettings } from "@/types/visualizer";
import { AppearanceSection } from "./sections/AppearanceSection";
import { AudioSection } from "./sections/AudioSection";
import { VisualsSection } from "./sections/VisualsSection";
import { AdvancedSection } from "./sections/AdvancedSection";

interface SettingsFormProps {
  handleSettingChange: (key: keyof VisualizerSettings, value: any) => void;
  handleSettingCommit: (key: keyof VisualizerSettings, value: any) => void;
  currentProfile: VisualizerSettings;
  colorSyncEnabled?: boolean;
}

export function SettingsForm({
  handleSettingChange,
  handleSettingCommit,
  currentProfile,
  colorSyncEnabled = false,
}: SettingsFormProps) {
  const methods = useFormContext<VisualizerSettings>();

  if (!methods) {
    throw new Error("SettingsForm must be used within a FormProvider");
  }

  const { watch, control } = methods;

  return (
    <Accordion type="multiple" className="w-full space-y-4">
      <AppearanceSection
        control={control}
        watch={watch}
        onSettingChange={handleSettingChange}
        onSettingCommit={handleSettingCommit}
        colorSyncEnabled={colorSyncEnabled}
      />
      <AudioSection
        control={control}
        watch={watch}
        onSettingChange={handleSettingChange}
        onSettingCommit={handleSettingCommit}
      />
      <VisualsSection
        control={control}
        watch={watch}
        onSettingChange={handleSettingChange}
        onSettingCommit={handleSettingCommit}
      />
      <AdvancedSection
        control={control}
        watch={watch}
        onSettingChange={handleSettingChange}
        onSettingCommit={handleSettingCommit}
      />
    </Accordion>
  );
}
