import { z } from "zod";

export const visualizerSettingsSchema = z.object({
  mode: z.number(),
  colorSync: z.boolean(),
  canvasEnabled: z.boolean(),
  micEnabled: z.boolean(),
  backgroundOpacity: z.number(),
  albumCanvas: z.boolean(),
  backgroundCanvas: z.boolean(),
  backgroundCanvasOpacity: z.number(),
  pauseEnabled: z.boolean(),
  hideOnDisabled: z.boolean(),
  selectedSkin: z.string(),
  progressBarForegroundColor: z.string(),
  progressBarBackgroundColor: z.string().optional(),
  gradient: z.boolean().optional(),
  fillAlpha: z.number().optional(),
  lineWidth: z.number().optional(),
  channelLayout: z.string().optional(),
  frequencyScale: z.string().optional(),
  syncTextShadow: z.boolean().optional(),
  linearAmplitude: z.boolean().optional(),
  customGradientStart: z
    .object({
      r: z.number(),
      g: z.number(),
      b: z.number(),
    })
    .optional(),
  customGradientEnd: z
    .object({
      r: z.number(),
      g: z.number(),
      b: z.number(),
    })
    .optional(),
});

export type VisualizerSettings = z.infer<typeof visualizerSettingsSchema>;
