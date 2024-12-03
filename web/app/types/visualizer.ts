import { z } from "zod";
import { UseFormReturn } from "react-hook-form";
import { WidgetProfile } from "@/types/widget";

// Common settings that apply to all skins
export const commonSettingsSchema = z.object({
  backgroundColor: z.string().default("#000000"),
  padding: z.number().min(0).max(100).default(20),
  showBorders: z.boolean().default(false),
  fontFamily: z.string().default("Sofia Sans Condensed"),
  fontSize: z.number().min(8).max(72).default(16),
  textColor: z.string().default("#ffffff"),
  borderColor: z.string().default("#ffffff"),
  borderWidth: z.number().min(0).max(10).default(0),
  borderRadius: z.number().min(0).max(50).default(8),
  lineHeight: z.number().min(0.5).max(2).default(1.5),
  letterSpacing: z.number().min(-2).max(10).default(0),
  textAlign: z.enum(["left", "center", "right"]).default("left"),
  gap: z.number().min(0).max(20).default(2),
});

// Specific settings for the visualizer
export const visualSettingsSchema = z.object({
  chartType: z.enum(["bar", "wave", "circle"]).default("bar"),
  barWidth: z.number().min(1).max(50).default(2),
  barSpacing: z.number().min(0).max(50).default(1),
  barColor: z.string().default("#ffffff"),
  smoothing: z.number().min(0).max(0.99).default(0.5),
  sensitivity: z.number().min(0).max(2).default(1),
  colorSync: z.boolean().default(true),
  canvasEnabled: z.boolean().default(true),
  micEnabled: z.boolean().default(true),
  mode: z.number().min(0).max(10).default(0),
  backgroundOpacity: z.number().min(0).max(1).default(0.6),
  albumCanvas: z.boolean().default(true),
  backgroundCanvas: z.boolean().default(true),
  backgroundCanvasOpacity: z.number().min(0).max(1).default(0.5),
  pauseEnabled: z.boolean().default(true),
  hideOnDisabled: z.boolean().default(false),
});

export const visualizerSettingsSchema = z.object({
  commonSettings: commonSettingsSchema,
  visualSettings: visualSettingsSchema,
  audioSettings: z.object({
    fftSize: z.number().default(2048),
    minDecibels: z.number().min(-100).max(0).default(-90),
    maxDecibels: z.number().min(-100).max(0).default(-10),
  }),
});

export type VisualizerSettings = z.infer<typeof visualizerSettingsSchema>;
export type CommonSettings = z.infer<typeof commonSettingsSchema>;
export type VisualSettings = z.infer<typeof visualSettingsSchema>;

export const defaultSettings: VisualizerSettings = {
  commonSettings: {
    backgroundColor: "#000000",
    padding: 20,
    showBorders: false,
    fontFamily: "Inter",
    fontSize: 16,
    textColor: "#ffffff",
    borderColor: "#ffffff",
    borderWidth: 0,
    borderRadius: 8,
    lineHeight: 1.5,
    letterSpacing: 0,
    textAlign: "left",
    gap: 2,
  },
  visualSettings: {
    chartType: "bar",
    barWidth: 2,
    barSpacing: 1,
    barColor: "#ffffff",
    smoothing: 0.5,
    sensitivity: 1,
    colorSync: true,
    canvasEnabled: true,
    micEnabled: true,
    mode: 0,
    backgroundOpacity: 0.6,
    albumCanvas: true,
    backgroundCanvas: true,
    backgroundCanvasOpacity: 0.5,
    pauseEnabled: false,
    hideOnDisabled: false,
  },
  audioSettings: {
    fftSize: 2048,
    minDecibels: -90,
    maxDecibels: -10,
  },
};

export interface VisualizerComponentProps {
  form: UseFormReturn<any>;
  handleSettingChange: (key: string, value: any) => void;
  handleSettingCommit: (key: string, value: any) => void;
  colorSyncEnabled: boolean;
  currentProfile: WidgetProfile;
}

export interface TrackData {
  title: string;
  artist: string;
  artwork?: string;
  progress: number;
  isPlaying: boolean;
  elapsed: number;
  duration: number;
  id: string;
}
