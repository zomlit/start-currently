import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form } from "@/components/ui/form";
import { useWidgetProfiles } from "@/hooks/useWidgetProfiles";
import VisualizerSettingsFormFields from "./VisualizerSettingsFormFields";

const visualizerSettingsSchema = z.object({
  // Skin & Display Settings
  selectedSkin: z.enum(["default", "minimal", "rounded"]).default("rounded"),
  hideOnDisabled: z.boolean().default(false),
  pauseEnabled: z.boolean().default(false),

  // Canvas Settings
  canvasEnabled: z.boolean().default(false),
  backgroundCanvas: z.boolean().default(false),
  backgroundCanvasOpacity: z.number().min(0).max(1).default(0.5),
  albumCanvas: z.boolean().default(false),

  // Audio Settings
  micEnabled: z.boolean().default(false),

  // Progress Bar Settings
  progressBarForegroundColor: z.string().default("#ffffff"),
  progressBarBackgroundColor: z.string().default("#000000"),

  // Visualizer Style Settings
  mode: z.number().default(10),
  gradient: z.string().default("rainbow"),
  fillAlpha: z.number().min(0).max(1).default(0.5),
  lineWidth: z.number().min(0).max(5).default(1),

  // Layout Settings
  channelLayout: z.string().default("dual-combined"),
  frequencyScale: z.string().default("bark"),

  // Color Settings
  colorSync: z.boolean().default(true),
  backgroundOpacity: z.number().min(0).max(1).default(0.8),
  syncTextShadow: z.boolean().default(false),

  // Custom Gradient Settings
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

  // Audio Analysis Settings
  linearAmplitude: z.boolean().default(true),
  linearBoost: z.number().default(1.8),
  showPeaks: z.boolean().default(false),
  outlineBars: z.boolean().default(true),
  weightingFilter: z.string().default("D"),

  // Bar Settings
  barSpace: z.number().min(0).max(1).default(0.1),
  ledBars: z.boolean().default(false),
  lumiBars: z.boolean().default(false),
  roundBars: z.boolean().default(false),

  // Reflection Settings
  reflexRatio: z.number().min(0).max(1).default(0),
  reflexAlpha: z.number().min(0).max(1).default(0.15),
  reflexBright: z.number().min(0).max(2).default(1),

  // Mirror Settings
  mirror: z.number().min(0).max(3).default(0),
  splitGradient: z.boolean().default(false),

  // Text Settings
  fontSize: z.number().min(8).max(72).default(16),
  fontFamily: z.string().default("Sofia Sans Condensed"),
  textColor: z.string().default("#FFFFFF"),
  textShadowColor: z.string().default("rgba(0, 0, 0, 0.5)"),
  textShadowBlur: z.number().min(0).max(20).default(2),
  textShadowOffsetX: z.number().min(-20).max(20).default(1),
  textShadowOffsetY: z.number().min(-20).max(20).default(1),

  // Animation Settings
  animationSpeed: z.number().min(100).max(1000).default(300),
  animationEasing: z
    .enum([
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
    ])
    .default("easeOut"),
});

export type VisualizerSettingsFormProps = z.infer<
  typeof visualizerSettingsSchema
>;

interface Props {
  settings?: Partial<VisualizerSettingsFormProps>;
  onUpdate: (updates: Partial<VisualizerSettingsFormProps>) => void;
  currentProfile?: any;
}

const defaultSettings: VisualizerSettingsFormProps = {
  selectedSkin: "rounded",
  hideOnDisabled: false,
  pauseEnabled: false,
  canvasEnabled: false,
  backgroundCanvas: false,
  backgroundCanvasOpacity: 0.5,
  albumCanvas: false,
  micEnabled: false,
  progressBarForegroundColor: "#ffffff",
  progressBarBackgroundColor: "#000000",
  mode: 10,
  gradient: "rainbow",
  fillAlpha: 0.5,
  lineWidth: 1,
  channelLayout: "dual-combined",
  frequencyScale: "bark",
  colorSync: true,
  backgroundOpacity: 0.8,
  syncTextShadow: false,
  linearAmplitude: true,
  linearBoost: 1.8,
  showPeaks: false,
  outlineBars: true,
  weightingFilter: "D",
  barSpace: 0.1,
  ledBars: false,
  lumiBars: false,
  roundBars: false,
  reflexRatio: 0,
  reflexAlpha: 0.15,
  reflexBright: 1,
  mirror: 0,
  splitGradient: false,
  fontSize: 16,
  fontFamily: "Sofia Sans Condensed",
  textColor: "#FFFFFF",
  textShadowColor: "rgba(0, 0, 0, 0.5)",
  textShadowBlur: 2,
  textShadowOffsetX: 1,
  textShadowOffsetY: 1,
  animationSpeed: 300,
  animationEasing: "easeOut",
};

export function VisualizerSettingsForm({
  settings = {},
  onUpdate,
  currentProfile,
}: Props) {
  const [canvasAvailable, setCanvasAvailable] = useState(
    settings?.canvasEnabled ?? defaultSettings.canvasEnabled
  );

  const form = useForm<VisualizerSettingsFormProps>({
    resolver: zodResolver(visualizerSettingsSchema),
    defaultValues: {
      ...defaultSettings,
      ...settings,
    },
  });

  const handleSettingChange = (
    field: keyof VisualizerSettingsFormProps,
    value: any
  ) => {
    form.setValue(field, value);
    onUpdate({ [field]: value });
  };

  const handleSettingCommit = (
    field: keyof VisualizerSettingsFormProps,
    value: any
  ) => {
    form.setValue(field, value);
    onUpdate({ [field]: value });
  };

  return (
    <Form {...form}>
      <form className="mt-4 space-y-4">
        <VisualizerSettingsFormFields
          form={form}
          handleSettingChange={handleSettingChange}
          handleSettingCommit={handleSettingCommit}
          setCanvasAvailable={setCanvasAvailable}
          currentProfile={currentProfile}
        />
      </form>
    </Form>
  );
}
