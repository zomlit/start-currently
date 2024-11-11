import { UseFormReturn } from "react-hook-form";

export interface VisualizerSettingsFormProps {
  mode: number;
  colorSync: boolean;
  gradient: "rainbow" | "custom" | "Color Sync";
  customGradientStart: { r: number; g: number; b: number; a: number };
  customGradientEnd: { r: number; g: number; b: number; a: number };
  fillAlpha: number;
  lineWidth: number;
  channelLayout:
    | "single"
    | "dual-combined"
    | "dual-horizontal"
    | "dual-vertical";
  frequencyScale: "linear" | "logarithmic" | "bark" | "mel";
  linearAmplitude: boolean;
  linearBoost: number;
  showPeaks: boolean;
  outlineBars: boolean;
  weightingFilter: "A" | "B" | "C" | "D" | "none";
  barSpace: number;
  ledBars: boolean;
  lumiBars: boolean;
  reflexRatio: number;
  reflexAlpha: number;
  reflexBright: number;
  mirror: 0 | 1 | 2; // 0: none, 1: horizontal, 2: vertical
  splitGradient: boolean;
  roundBars: boolean;
  micEnabled: boolean;
  selectedMicId?: string;
  hideOnDisabled: boolean;
  selectedSkin: "default" | "minimal" | "rounded";
}

export interface VisualizerComponentProps {
  form: UseFormReturn<VisualizerSettingsFormProps>;
  handleSettingChange: (field: string, value: any) => void;
  handleSettingCommit: (field: string, value: any) => void;
  currentProfile?: any;
  setCanvasAvailable?: (value: boolean) => void;
  colorSyncEnabled?: boolean;
}
