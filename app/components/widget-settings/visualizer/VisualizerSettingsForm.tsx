import { SettingsForm } from "@/components/widget-settings/SettingsForm";
import type { UseFormReturn } from "react-hook-form";
import { FormProvider } from "react-hook-form";
import type { VisualizerSettings } from "@/types/visualizer";

interface VisualizerSettingsFormProps {
  form: UseFormReturn<VisualizerSettings>;
  handleSettingChange: (key: string, value: any) => void;
  handleSettingCommit: (key: string, value: any) => void;
  currentProfile: {
    id: string;
    name: string;
    color: string;
    settings: {
      commonSettings: {
        backgroundColor?: string;
        textColor?: string;
        fontSize?: number;
        padding?: number;
        fontFamily?: string;
        fontVariant?: string;
        borderStyle?: string;
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
        channelLayout?: string;
        frequencyScale?: string;
        syncTextShadow?: boolean;
        linearAmplitude?: boolean;
        customGradientStart?: { r: number; g: number; b: number };
        customGradientEnd?: { r: number; g: number; b: number };
      };
    };
    widgetType: "visualizer" | "timer" | "lyrics";
  };
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
      <div className="space-y-4">
        <SettingsForm
          handleSettingChange={handleSettingChange}
          handleSettingCommit={handleSettingCommit}
          currentProfile={currentProfile}
          colorSyncEnabled={colorSyncEnabled}
        />
      </div>
    </FormProvider>
  );
};
