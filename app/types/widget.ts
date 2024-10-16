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
  // Add any other common settings here
});

// Define the specificSettingsSchema
const specificSettingsSchema = z.object({
  backgroundOpacity: z.number().optional(),
  syncTextShadow: z.boolean().optional(),
  enableTextShadow: z.boolean().optional(),
  textShadowColor: z.string().optional(),
  textShadowHorizontal: z.number().optional(),
  textShadowVertical: z.number().optional(),
  textShadowBlur: z.number().optional(),
  colorSync: z.boolean().optional(),
  // Add any other specific settings here
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

export const WidgetProfileSchema = z.object({
  id: z.string(),
  name: z.string(),
  widgetType: WidgetTypeSchema,
  settings: z.object({
    commonSettings: commonSettingsSchema,
    specificSettings: specificSettingsSchema,
  }),
  color: z.string(),
  is_active: z.boolean(),
  is_current: z.boolean(),
});

export type WidgetType = z.infer<typeof WidgetTypeSchema>;
export type WidgetProfile = z.infer<typeof WidgetProfileSchema>;

export const WidgetSchema = z.object({
  profiles: z.array(WidgetProfileSchema),
});

export type Widget = z.infer<typeof WidgetSchema>;
