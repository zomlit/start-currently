import React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Slider } from "@/components/ui/slider";
import { GradientColorPicker } from "@/components/GradientColorPicker";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Copy, RotateCcw, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { useDebouncedCallback } from "use-debounce";
import { toast } from "@/utils/toast";

const safeFormatColor = (color: any): string => {
  if (!color) return "rgba(0, 0, 0, 1)";

  // If it's a palette color object
  if (typeof color === "object" && color !== null) {
    if (typeof color.hex === "string") return color.hex;
    if (
      typeof color.r === "number" &&
      typeof color.g === "number" &&
      typeof color.b === "number"
    ) {
      return `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a || 1})`;
    }
    return "rgba(0, 0, 0, 1)";
  }

  if (typeof color !== "string") {
    return "rgba(0, 0, 0, 1)";
  }

  return color;
};

export const lyricsSchema = z.object({
  backgroundColor: z.string().default("rgba(0, 0, 0, 1)"),
  textColor: z.string().default("rgba(255, 255, 255, 1)"),
  currentTextColor: z.string().default("rgba(220, 40, 220, 1)"),
  fontSize: z.number().min(10).max(72).default(24),
  padding: z.number().min(0).max(100).default(20),
  currentLineScale: z.number().min(1).max(2).default(1.2),
  showFade: z.boolean().default(false),
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
  animationSpeed: z.number().min(100).max(1000).default(300),
  glowEffect: z.boolean().default(false),
  glowColor: z.string().default("rgba(255, 255, 255, 0.5)"),
  glowIntensity: z.number().min(0).max(20).default(5),
  hideExplicitContent: z.boolean().default(false),
  animationStyle: z
    .enum(["scale", "glow", "slide", "fade", "bounce"])
    .default("scale"),
});

export type LyricsSettings = z.infer<typeof lyricsSchema>;
interface LyricsSettingsFormProps {
  settings: LyricsSettings;
  onSettingsChange: (settings: LyricsSettings) => Promise<void>;
  publicUrl: string;
  onCopyPublicUrl: (e: React.MouseEvent<HTMLButtonElement>) => void;
  fontFamilies: string[];
  isFontLoading: boolean;
  injectFont: (fontFamily: string) => void;
  isVideoAvailable: boolean;
}

export const LyricsSettingsForm: React.FC<LyricsSettingsFormProps> = ({
  settings,
  onSettingsChange,
  publicUrl,
  onCopyPublicUrl,
  fontFamilies,
  isFontLoading,
  injectFont,
  isVideoAvailable,
}) => {
  const form = useForm<LyricsSettings>({
    resolver: zodResolver(lyricsSchema),
    defaultValues: settings,
  });

  // Add handleResetToDefaults function
  const handleResetToDefaults = async () => {
    try {
      const defaultSettings = lyricsSchema.parse({});
      form.reset(defaultSettings);
      await onSettingsChange(defaultSettings);

      toast.success({
        title: "Settings reset",
        description: "All settings have been restored to their default values.",
      });
    } catch (error) {
      console.error("Error resetting settings:", error);
      toast.error({
        title: "Error resetting settings",
        description: "Your settings couldn't be reset. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Debounce the settings update
  const debouncedSettingsChange = useDebouncedCallback(
    async (updatedSettings: LyricsSettings) => {
      try {
        await onSettingsChange(updatedSettings);
        toast.success({
          title: "Settings saved",
          description: "Your changes have been saved successfully.",
        });
      } catch (error) {
        console.error("Error saving settings:", error);
        toast.error({
          title: "Error saving settings",
          description: "Your changes couldn't be saved. Please try again.",
        });
      }
    },
    500
  );

  const handleSettingChange = async (
    field: keyof LyricsSettings,
    value: any
  ) => {
    const updatedSettings: LyricsSettings = {
      ...settings,
      [field]: value,
    };

    // Update form state immediately
    form.setValue(field, value);

    // Debounce the save
    debouncedSettingsChange(updatedSettings);
  };

  // Form submission handler
  const onSubmit = async (data: LyricsSettings) => {
    try {
      await onSettingsChange(data);
      toast.success({
        title: "Settings saved",
        description: "Your changes have been saved successfully.",
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error({
        title: "Error saving settings",
        description: "Your changes couldn't be saved. Please try again.",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <Accordion type="multiple" className="w-full">
          <AccordionItem value="general">
            <AccordionTrigger>General Settings</AccordionTrigger>
            <AccordionContent className="space-y-4">
              <FormField
                control={form.control}
                name="backgroundColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Background Color</FormLabel>
                    <GradientColorPicker
                      color={safeFormatColor(field.value)}
                      onChange={(color) => {
                        const formattedColor = safeFormatColor(color);
                        field.onChange(formattedColor);
                        handleSettingChange("backgroundColor", formattedColor);
                      }}
                      onChangeComplete={field.onBlur}
                      currentProfile={null}
                    />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="padding"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Padding</FormLabel>
                    <Slider
                      min={0}
                      max={100}
                      value={[field.value]}
                      onValueChange={(val) => {
                        field.onChange(val[0]);
                        handleSettingChange("padding", val[0]);
                      }}
                    />
                  </FormItem>
                )}
              />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="text">
            <AccordionTrigger>Text Settings</AccordionTrigger>
            <AccordionContent className="space-y-4">
              <FormField
                control={form.control}
                name="fontFamily"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Font Family</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value);
                        handleSettingChange("fontFamily", value);
                        injectFont(value);
                      }}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a font" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isFontLoading ? (
                          <div className="flex items-center justify-center p-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="ml-2">Loading fonts...</span>
                          </div>
                        ) : (
                          fontFamilies.map((font) => (
                            <SelectItem key={font} value={font}>
                              {font}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="textColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Text Color</FormLabel>
                    <GradientColorPicker
                      color={safeFormatColor(field.value)}
                      onChange={(color) =>
                        handleSettingChange("textColor", safeFormatColor(color))
                      }
                      onChangeComplete={field.onBlur}
                      currentProfile={null}
                    />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currentTextColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Line Text Color</FormLabel>
                    <GradientColorPicker
                      color={safeFormatColor(field.value)}
                      onChange={(color) => {
                        const formattedColor = safeFormatColor(color);
                        field.onChange(formattedColor);
                        handleSettingChange("currentTextColor", formattedColor);
                      }}
                      onChangeComplete={field.onBlur}
                      currentProfile={null}
                    />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="fontSize"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Font Size</FormLabel>
                    <Slider
                      min={10}
                      max={72}
                      value={[field.value]}
                      onValueChange={(val) => {
                        field.onChange(val[0]);
                        handleSettingChange("fontSize", val[0]);
                      }}
                    />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lineHeight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Line Height</FormLabel>
                    <Slider
                      min={1}
                      max={3}
                      step={0.1}
                      value={[field.value]}
                      onValueChange={(val) =>
                        handleSettingChange("lineHeight", val[0])
                      }
                    />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="textAlign"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Text Alignment</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value);
                        handleSettingChange("textAlign", value);
                      }}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select alignment" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="left">Left</SelectItem>
                        <SelectItem value="center">Center</SelectItem>
                        <SelectItem value="right">Right</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="textShadowColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Text Shadow Color</FormLabel>
                    <GradientColorPicker
                      color={safeFormatColor(field.value)}
                      onChange={(color) =>
                        handleSettingChange(
                          "textShadowColor",
                          safeFormatColor(color)
                        )
                      }
                      onChangeComplete={field.onBlur}
                      currentProfile={null}
                    />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="textShadowBlur"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Text Shadow Blur</FormLabel>
                    <Slider
                      min={0}
                      max={20}
                      value={[field.value]}
                      onValueChange={(val) =>
                        handleSettingChange("textShadowBlur", val[0])
                      }
                    />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="textShadowOffsetX"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Text Shadow Offset X</FormLabel>
                    <Slider
                      min={-20}
                      max={20}
                      value={[field.value]}
                      onValueChange={(val) =>
                        handleSettingChange("textShadowOffsetX", val[0])
                      }
                    />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="textShadowOffsetY"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Text Shadow Offset Y</FormLabel>
                    <Slider
                      min={-20}
                      max={20}
                      value={[field.value]}
                      onValueChange={(val) =>
                        handleSettingChange("textShadowOffsetY", val[0])
                      }
                    />
                  </FormItem>
                )}
              />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="effects">
            <AccordionTrigger>Effects</AccordionTrigger>
            <AccordionContent className="space-y-4">
              <FormField
                control={form.control}
                name="greenScreenMode"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Green Screen Mode</FormLabel>
                      <FormDescription>
                        Enable green screen mode for chroma keying
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={(checked) => {
                          field.onChange(checked);
                          handleSettingChange("greenScreenMode", checked);
                        }}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="showVideoCanvas"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Show Video Canvas</FormLabel>
                      <FormDescription>
                        Display video bg if available
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={(value) =>
                          handleSettingChange("showVideoCanvas", value)
                        }
                        disabled={!isVideoAvailable}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              {form.watch("showVideoCanvas") && (
                <FormField
                  control={form.control}
                  name="videoCanvasOpacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Video Canvas Opacity</FormLabel>
                      <Slider
                        min={0}
                        max={1}
                        step={0.01}
                        value={[field.value]}
                        onValueChange={(val) =>
                          handleSettingChange("videoCanvasOpacity", val[0])
                        }
                      />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="glowEffect"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Glow Effect</FormLabel>
                      <FormDescription>
                        Add a glow effect to the text
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={(value) =>
                          handleSettingChange("glowEffect", value)
                        }
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              {form.watch("glowEffect") && (
                <>
                  <FormField
                    control={form.control}
                    name="glowColor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Glow Color</FormLabel>
                        <GradientColorPicker
                          color={safeFormatColor(field.value)}
                          onChange={(color) =>
                            handleSettingChange(
                              "glowColor",
                              safeFormatColor(color)
                            )
                          }
                          onChangeComplete={field.onBlur}
                          currentProfile={null}
                        />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="glowIntensity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Glow Intensity</FormLabel>
                        <Slider
                          min={0}
                          max={20}
                          value={[field.value]}
                          onValueChange={(val) =>
                            handleSettingChange("glowIntensity", val[0])
                          }
                        />
                      </FormItem>
                    )}
                  />
                </>
              )}

              <FormField
                control={form.control}
                name="showFade"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Fade top and bottom</FormLabel>
                      <FormDescription>
                        Add a fade effect to the top and bottom of the lyrics
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={(value) =>
                          handleSettingChange("showFade", value)
                        }
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              {form.watch("showFade") && (
                <FormField
                  control={form.control}
                  name="fadeDistance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fade Distance</FormLabel>
                      <Slider
                        min={0}
                        max={200}
                        value={[field.value]}
                        onValueChange={(val) =>
                          handleSettingChange("fadeDistance", val[0])
                        }
                      />
                    </FormItem>
                  )}
                />
              )}
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="animation">
            <AccordionTrigger>Animation</AccordionTrigger>
            <AccordionContent className="space-y-4">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="animationStyle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Animation Style</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={(value) => {
                          field.onChange(value);
                          handleSettingChange("animationStyle", value);
                        }}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select animation style" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="scale">Scale</SelectItem>
                          <SelectItem value="glow">Glow</SelectItem>
                          <SelectItem value="slide">Slide</SelectItem>
                          <SelectItem value="fade">Fade</SelectItem>
                          <SelectItem value="bounce">Bounce</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="animationSpeed"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Animation Speed (ms)</FormLabel>
                      <Slider
                        min={100}
                        max={1000}
                        step={50}
                        value={[field.value]}
                        onValueChange={(val) =>
                          handleSettingChange("animationSpeed", val[0])
                        }
                      />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="animationEasing"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Animation Easing</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={(value) =>
                          handleSettingChange("animationEasing", value)
                        }
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select easing" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="linear">Linear</SelectItem>
                          <SelectItem value="easeIn">Ease In</SelectItem>
                          <SelectItem value="easeOut">Ease Out</SelectItem>
                          <SelectItem value="easeInOut">Ease In Out</SelectItem>
                          <SelectItem value="circIn">Circular In</SelectItem>
                          <SelectItem value="circOut">Circular Out</SelectItem>
                          <SelectItem value="circInOut">
                            Circular In Out
                          </SelectItem>
                          <SelectItem value="backIn">Back In</SelectItem>
                          <SelectItem value="backOut">Back Out</SelectItem>
                          <SelectItem value="backInOut">Back In Out</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="content">
            <AccordionTrigger>Content Settings</AccordionTrigger>
            <AccordionContent className="space-y-4">
              <FormField
                control={form.control}
                name="hideExplicitContent"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Hide Explicit Content</FormLabel>
                    </div>
                    <FormControl>
                      <Switch
                        className="!mt-0"
                        checked={field.value}
                        onCheckedChange={(value) =>
                          handleSettingChange("hideExplicitContent", value)
                        }
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="flex !overflow-hidden">
          <Button
            type="button"
            onClick={handleResetToDefaults}
            variant="outline"
            className="w-full"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset to Defaults
          </Button>

          <Button
            type="submit"
            className="w-full ml-2"
            disabled={!form.formState.isDirty}
          >
            Save Changes
          </Button>
        </div>
      </form>
    </Form>
  );
};
