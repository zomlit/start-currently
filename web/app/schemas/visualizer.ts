import { z } from "zod";
import { createWidgetSchema } from "@/shared/schemas/widget";

const visualizerSettingsSchema = z.object({
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
    layout: z.object({
      padding: z.number().min(0).max(100).default(20),
      gap: z.number().min(0).max(20).default(2),
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

export const visualizerProfileSchema = createWidgetSchema(
  visualizerSettingsSchema
).extend({
  widgetType: z.literal("visualizer"),
});

export type VisualizerProfile = z.infer<typeof visualizerProfileSchema>;

export const defaultProfile: VisualizerProfile = {
  name: "Default",
  isDefault: true,
  settings: {
    visual: {
      background: {
        color: "#000000",
        opacity: 0.6,
        useAlbumArt: true,
        useVideo: false,
        videoOpacity: 0.2,
      },
      text: {
        font: "Sofia Sans Condensed",
        size: 16,
        color: "#ffffff",
        weight: 400,
        lineHeight: 1.8,
        letterSpacing: 0,
        align: "left",
      },
      border: {
        show: false,
        color: "#ffffff",
        width: 0,
        radius: 8,
      },
      layout: {
        padding: 20,
        gap: 2,
      },
    },
    functional: {
      visualizer: {
        type: "bar",
        sensitivity: 1,
        smoothing: 0.5,
        mirror: 0,
        barSpace: 0,
      },
      behavior: {
        hideWhenPaused: false,
        syncColors: true,
        useMicrophone: false,
      },
      audio: {
        fftSize: 2048,
        minDecibels: -90,
        maxDecibels: -10,
      },
    },
  },
} as const;
