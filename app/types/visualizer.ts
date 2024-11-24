import { z } from "zod";

export const visualizerSettingsSchema = z.object({
  commonSettings: z.object({
    fontFamily: z.string().default("Inter"),
    fontSize: z.number().min(8).max(120).default(16),
    lineHeight: z.number().min(0.5).max(3).default(1.5),
    textTransform: z
      .enum(["none", "capitalize", "uppercase", "lowercase"])
      .default("none"),
    backgroundColor: z.string().default("rgba(0, 0, 0, 1)"),
    fontColor: z.string().default("rgba(255, 255, 255, 1)"),
    borderRadius: z.number().min(0).max(100).default(0),
    borderTopWidth: z.number().min(0).max(20).default(0),
    borderRightWidth: z.number().min(0).max(20).default(0),
    borderBottomWidth: z.number().min(0).max(20).default(0),
    borderLeftWidth: z.number().min(0).max(20).default(0),
    paddingTop: z.number().min(0).max(100).default(0),
    paddingRight: z.number().min(0).max(100).default(0),
    paddingBottom: z.number().min(0).max(100).default(0),
    paddingLeft: z.number().min(0).max(100).default(0),
    gap: z.number().min(0).max(8).default(0),
  }),
  specificSettings: z.object({
    selectedSkin: z.enum(["default", "minimal", "rounded"]).default("rounded"),
    hideOnDisabled: z.boolean().default(false),
    pauseEnabled: z.boolean().default(false),
    canvasEnabled: z.boolean().default(false),
    backgroundCanvas: z.boolean().default(false),
    backgroundCanvasOpacity: z.number().min(0).max(1).default(0.5),
    micEnabled: z.boolean().default(false),
    progressBarForegroundColor: z.string().default("#ffffff"),
    progressBarBackgroundColor: z.string().default("#000000"),
    mode: z.number().min(0).max(10).default(0),
    gradient: z.string().default("rainbow"),
    fillAlpha: z.number().min(0).max(1).default(0.5),
    lineWidth: z.number().min(0).max(5).default(1),
    channelLayout: z.string().default("dual-combined"),
    frequencyScale: z.string().default("bark"),
    linearAmplitude: z.boolean().default(true),
    linearBoost: z.number().default(1.8),
    showPeaks: z.boolean().default(false),
    outlineBars: z.boolean().default(true),
    weightingFilter: z.string().default("D"),
    barSpace: z.number().min(0).max(1).default(0.1),
    ledBars: z.boolean().default(false),
    lumiBars: z.boolean().default(false),
    reflexRatio: z.number().min(0).max(1).default(0),
    reflexAlpha: z.number().min(0).max(1).default(0.15),
    reflexBright: z.number().min(0).max(2).default(1),
    mirror: z.number().min(0).max(3).default(0),
    splitGradient: z.boolean().default(false),
  }),
});

export type VisualizerSettings = z.infer<typeof visualizerSettingsSchema>;

export interface VisualizerProfile {
  id: string;
  name: string;
  settings: VisualizerSettings & {
    isDefault?: boolean;
  };
}
