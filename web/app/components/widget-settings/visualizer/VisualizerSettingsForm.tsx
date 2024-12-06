import { SettingsForm } from "@/components/widget-settings/SettingsForm";
import type { UseFormReturn } from "react-hook-form";
import { FormProvider } from "react-hook-form";
import type { VisualizerSettings } from "@/types/visualizer";

interface VisualizerSettingsFormProps {
  settings: VisualizerSettings;
  onSettingsChange: (newSettings: Partial<VisualizerSettings>) => void;
}

export const VisualizerSettingsForm: React.FC<VisualizerSettingsFormProps> = ({
  settings,
  onSettingsChange,
}) => {
  return (
    <FormProvider>
      <div className="space-y-4">
        <SettingsForm settings={settings} onSettingsChange={onSettingsChange} />
      </div>
    </FormProvider>
  );
};
