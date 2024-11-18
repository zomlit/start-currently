import { UseFormReturn } from "react-hook-form";
import { z } from "zod";

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

export interface VisualizerProfile {
  id: string;
  user_id: string;
  section_id: string;
  settings: {
    name: string;
    isDefault: boolean;
    specificSettings: {
      selectedSkin: "default" | "minimal" | "rounded";
      hideOnDisabled: boolean;
      pauseEnabled: boolean;
      canvasEnabled: boolean;
      backgroundCanvas: boolean;
      backgroundCanvasOpacity: number;
      micEnabled: boolean;
      progressBarForegroundColor: string;
      progressBarBackgroundColor: string;
      mode: number;
      gradient: string;
      fillAlpha: number;
      lineWidth: number;
      channelLayout: string;
      frequencyScale: string;
      linearAmplitude: boolean;
      linearBoost: number;
      showPeaks: boolean;
      outlineBars: boolean;
      weightingFilter: string;
      barSpace: number;
      ledBars: boolean;
      lumiBars: boolean;
      reflexRatio: number;
      reflexAlpha: number;
      reflexBright: number;
      mirror: number;
      splitGradient: boolean;
      roundBars: boolean;
    };
    commonSettings: Record<string, any>;
  };
  created_at?: string;
  updated_at?: string;
}

export interface Track {
  albumArt: string;
  title: string;
  artist: string;
  album: string;
  isPlaying: boolean;
  elapsed: number;
  duration: number;
}

export interface VisualizerWidget {
  track?: Track;
  colorScheme: string;
  id: string;
  lyrics_settings: Json | null;
  sensitivity: number;
  type: string;
  user_id: string;
  visualization: Json;
}
