import { z } from "zod";

export const visualizerSettingsSchema = z.object({
  visual: z.object({
    background: z.object({
      color: z.string().default("#000000"),
      opacity: z.number().min(0).max(1).default(0.6),
      useAlbumArt: z.boolean().default(true),
      useVideo: z.boolean().default(false),
      videoOpacity: z.number().min(0).max(1).default(0.2),
    }),
    text: z.object({
      font: z.string().default("Sofia Sans Condensed"),
      size: z.number().min(8).max(72).default(16),
      color: z.string().default("#ffffff"),
      weight: z.union([z.string(), z.number()]).default(400),
      lineHeight: z.number().min(0.5).max(2).default(1.8),
      letterSpacing: z.number().min(-2).max(10).default(0),
      align: z.enum(["left", "center", "right"]).default("left"),
    }),
    border: z.object({
      show: z.boolean().default(false),
      color: z.string().default("#ffffff"),
      width: z.number().min(0).max(10).default(0),
      radius: z.number().min(0).max(50).default(8),
    }),
  }),
  functional: z.object({
    visualizer: z.object({
      type: z.enum(["bar", "wave", "circle"]).default("bar"),
      sensitivity: z.number().min(0).max(2).default(1),
      smoothing: z.number().min(0).max(0.99).default(0.5),
      mirror: z.number().default(0),
      barSpace: z.number().default(0),
    }),
    behavior: z.object({
      hideWhenPaused: z.boolean().default(false),
      syncColors: z.boolean().default(true),
      useMicrophone: z.boolean().default(false),
    }),
    audio: z.object({
      fftSize: z.number().default(2048),
      minDecibels: z.number().min(-100).max(0).default(-90),
      maxDecibels: z.number().min(-100).max(0).default(-10),
    }),
  }),
});

export type VisualizerSettings = z.infer<typeof visualizerSettingsSchema>;

export const visualizerProfileSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  userId: z.string(),
  settings: visualizerSettingsSchema,
});

export type VisualizerProfile = z.infer<typeof visualizerProfileSchema>;
