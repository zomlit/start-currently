import { z } from "zod";

// Define the commonSettingsSchema
const commonSettingsSchema = z.object({
  fontFamily: z.string().optional(),
  fontVariant: z.string().optional(),
  fontSize: z.number().optional(),
  textColor: z.string().optional(),
  backgroundColor: z.string().optional(),
  borderColor: z.string().optional(),
  borderStyle: z.string().optional(),
  borderRadius: z.number().optional(),
  borderWidth: z.number().optional(),
  padding: z.number().optional(),
  gap: z.number().optional(),
});

export const WidgetTypeSchema = z.enum([
  "visualizer",
  "chat",
  "alerts",
  "game_stats",
  "game_overlay",
  "gamepad",
  "timer",
  "configure",
  "freeform",
]);

export const visualizerSettingsSchema = z.object({
  selectedSkin: z.enum(["default", "minimal", "rounded"]).default("rounded"),
  hideOnDisabled: z.boolean().default(false),
  pauseEnabled: z.boolean().default(false),
  canvasEnabled: z.boolean().default(false),
  backgroundCanvas: z.boolean().default(false),
  backgroundCanvasOpacity: z.number().min(0).max(1).default(0.5),
  albumCanvas: z.boolean().default(false),
  micEnabled: z.boolean().default(false),
  selectedMicId: z.string().optional(),
  progressBarForegroundColor: z.string().default("#ffffff"),
  progressBarBackgroundColor: z.string().default("#000000"),
  mode: z.number().default(10),
  gradient: z.string().default("rainbow"),
  fillAlpha: z.number().min(0).max(1).default(0.5),
  lineWidth: z.number().min(0).max(5).default(1),
  channelLayout: z.string().default("dual-combined"),
  frequencyScale: z.string().default("bark"),
  colorSync: z.boolean().default(true),
  backgroundOpacity: z.number().min(0).max(1).default(0.8),
  syncTextShadow: z.boolean().default(false),
  customGradientStart: z
    .object({
      r: z.number().min(0).max(255).default(255),
      g: z.number().min(0).max(255).default(0),
      b: z.number().min(0).max(255).default(0),
      a: z.number().min(0).max(1).default(1),
    })
    .optional(),
  customGradientEnd: z
    .object({
      r: z.number().min(0).max(255).default(0),
      g: z.number().min(0).max(255).default(0),
      b: z.number().min(0).max(255).default(255),
      a: z.number().min(0).max(1).default(1),
    })
    .optional(),
  linearAmplitude: z.boolean().default(true),
  linearBoost: z.number().default(1.8),
  showPeaks: z.boolean().default(false),
  outlineBars: z.boolean().default(true),
  weightingFilter: z.string().default("D"),
  barSpace: z.number().min(0).max(1).default(0.1),
  ledBars: z.boolean().default(false),
  lumiBars: z.boolean().default(false),
  roundBars: z.boolean().default(false),
  reflexRatio: z.number().min(0).max(1).default(0),
  reflexAlpha: z.number().min(0).max(1).default(0.15),
  reflexBright: z.number().min(0).max(2).default(1),
  mirror: z.number().min(0).max(3).default(0),
  splitGradient: z.boolean().default(false),
});

export type VisualizerSettings = z.infer<typeof visualizerSettingsSchema>;

// Single definition of WidgetProfileSchema
export const WidgetProfileSchema = z.object({
  id: z.string(),
  name: z.string(),
  widgetType: WidgetTypeSchema,
  settings: z.object({
    commonSettings: commonSettingsSchema,
    specificSettings: visualizerSettingsSchema,
  }),
  color: z.string(),
  is_active: z.boolean(),
  is_current: z.boolean(),
});

export type WidgetProfile = z.infer<typeof WidgetProfileSchema>;

export const WidgetSchema = z.object({
  profiles: z.array(WidgetProfileSchema),
});

export type Widget = z.infer<typeof WidgetSchema>;
