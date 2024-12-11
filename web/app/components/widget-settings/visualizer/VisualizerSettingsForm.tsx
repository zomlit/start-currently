import { SettingsForm } from "@/components/widget-settings/SettingsForm";
import type { UseFormReturn } from "react-hook-form";
import { FormProvider } from "react-hook-form";
import type { VisualizerSettings } from "@/types/visualizer";

interface VisualizerSettingsFormProps {
  settings: VisualizerSettings;
  onSettingsChange: (settings: Partial<VisualizerSettings>) => Promise<void>;
  onPreviewUpdate?: (settings: Partial<VisualizerSettings>) => void;
  isLoading?: boolean;
}

export function VisualizerSettingsForm({
  settings,
  onSettingsChange,
  onPreviewUpdate,
  isLoading,
}: VisualizerSettingsFormProps) {
  return (
    <FormProvider>
      <div className="space-y-4">
        <SettingsForm
          settings={settings}
          onSettingsChange={onSettingsChange}
          onPreviewUpdate={onPreviewUpdate}
        />
      </div>
    </FormProvider>
  );
}
