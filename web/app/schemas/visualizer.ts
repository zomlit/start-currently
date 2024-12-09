import { z } from "zod";

// Common settings schema
const commonSettingsSchema = z.object({
  fontSize: z.number().min(8).max(72).default(16),
  lineHeight: z.number().min(0.5).max(3).default(1.5),
  // Add other common settings as needed
});

// Main visualizer schema
export const visualizerSchema = z.object({
  commonSettings: commonSettingsSchema.default({
    fontSize: 16,
    lineHeight: 1.5,
  }),
  mode: z.number().min(0).max(5).default(0),
  colorSync: z.boolean().default(true),
  canvasEnabled: z.boolean().default(true),
  micEnabled: z.boolean().default(false),
  backgroundOpacity: z.number().min(0).max(1).default(0.1),
  // Add other settings as needed
});

// Infer TypeScript type from schema
export type VisualizerSettings = z.infer<typeof visualizerSchema>;

// Default settings that match the schema defaults
export const defaultVisualizerSettings: VisualizerSettings = {
  commonSettings: {
    fontSize: 16,
    lineHeight: 1.5,
  },
  mode: 0,
  colorSync: true,
  canvasEnabled: true,
  micEnabled: false,
  backgroundOpacity: 0.1,
};
