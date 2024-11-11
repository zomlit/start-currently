import { z } from "zod";

export const lyricsSchema = z.object({
  backgroundColor: z.string().default("rgba(0, 0, 0, 1)"),
  textColor: z.string().default("rgba(255, 255, 255, 1)"),
  currentTextColor: z.string().default("rgba(220, 40, 220, 1)"),
  fontSize: z.number().min(10).max(72).default(24),
  padding: z.number().min(0).max(100).default(20),
  currentLineScale: z.number().min(1).max(2).default(1.2),
  showFade: z.boolean().default(true),
  fadeDistance: z.number().min(0).max(200).default(64),
  lineHeight: z.number().min(1).max(3).default(1.5),
  fontFamily: z.string().default("Sofia Sans Condensed"),
  greenScreenMode: z.boolean().default(false),
  colorSync: z.boolean().default(false),
  showVideoCanvas: z.boolean().default(false),
  videoCanvasOpacity: z.number().min(0).max(1).default(0.2),
  textAlign: z.enum(["left", "center", "right"]).default("left"),
  textShadowColor: z.string().default("rgba(0, 0, 0, 0.5)"),
  textShadowBlur: z.number().min(0).max(20).default(2),
  textShadowOffsetX: z.number().min(-20).max(20).default(1),
  textShadowOffsetY: z.number().min(-20).max(20).default(1),
  animationEasing: z.enum([
    "linear",
    "easeIn",
    "easeOut",
    "easeInOut",
    "circIn",
    "circOut",
    "circInOut",
    "backIn",
    "backOut",
    "backInOut",
  ]).default("easeOut"),
  animationSpeed: z.number().min(100).max(1000).default(300),
  glowEffect: z.boolean().default(false),
  glowColor: z.string().default("rgba(255, 255, 255, 0.5)"),
  glowIntensity: z.number().min(0).max(20).default(5),
  hideExplicitContent: z.boolean().default(false),
  animationStyle: z.enum(["scale", "glow", "slide", "fade", "bounce"]).default("scale"),
});

export type LyricsSettings = z.infer<typeof lyricsSchema>;

export const defaultLyricsSettings: LyricsSettings = lyricsSchema.parse({});
