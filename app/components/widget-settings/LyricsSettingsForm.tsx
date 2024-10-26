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
  animationEasing: z
    .enum(["linear", "ease", "ease-in", "ease-out", "ease-in-out"])
    .default("ease-out"),
  animationSpeed: z.number().min(100).max(1000).default(300),
  glowEffect: z.boolean().default(false),
  glowColor: z.string().default("rgba(255, 255, 255, 0.5)"),
  glowIntensity: z.number().min(0).max(20).default(5),
  hideExplicitContent: z.boolean().default(false),
});

export type LyricsSettings = z.infer<typeof lyricsSchema>;
interface LyricsSettingsFormProps {
  settings: LyricsSettings;
  onSettingsChange: (settings: Partial<LyricsSettings>) => void;
  publicUrl: string;
  onCopyPublicUrl: () => void;
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

  const handleSettingChange = (field: keyof LyricsSettings, value: any) => {
    form.setValue(field, value);
    onSettingsChange({ [field]: value });
  };

  const handleResetToDefaults = () => {
    const defaultSettings = lyricsSchema.parse({});
    form.reset(defaultSettings);
    onSettingsChange(defaultSettings);
  };

  return (
    <Form {...form}>
      <form className="space-y-4">
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
                      color={field.value}
                      onChange={(color) =>
                        handleSettingChange("backgroundColor", color)
                      }
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
                      onValueChange={(val) =>
                        handleSettingChange("padding", val[0])
                      }
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
                      onValueChange={(value) => {
                        handleSettingChange("fontFamily", value);
                        injectFont(value);
                      }}
                      value={field.value}
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
                      color={field.value}
                      onChange={(value) =>
                        handleSettingChange("textColor", value)
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
                      color={field.value}
                      onChange={(value) =>
                        handleSettingChange("currentTextColor", value)
                      }
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
                      onValueChange={(val) =>
                        handleSettingChange("fontSize", val[0])
                      }
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
                      onValueChange={(value) =>
                        handleSettingChange("textAlign", value)
                      }
                      value={field.value}
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

              {/* Text shadow settings moved here */}
              <FormField
                control={form.control}
                name="textShadowColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Text Shadow Color</FormLabel>
                    <GradientColorPicker
                      color={field.value}
                      onChange={(value) =>
                        handleSettingChange("textShadowColor", value)
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
                        onCheckedChange={(value) =>
                          handleSettingChange("greenScreenMode", value)
                        }
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              {/* <FormField
                control={form.control}
                name="colorSync"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Color Sync</FormLabel>
                      <FormDescription>
                        Synchronize colors with the current track
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={(value) =>
                          handleSettingChange("colorSync", value)
                        }
                      />
                    </FormControl>
                  </FormItem>
                )}
              /> */}
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
                          color={field.value}
                          onChange={(value) =>
                            handleSettingChange("glowColor", value)
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
              <FormField
                control={form.control}
                name="animationEasing"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Animation Easing</FormLabel>
                    <Select
                      onValueChange={(value) =>
                        handleSettingChange("animationEasing", value)
                      }
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select easing" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="linear">Linear</SelectItem>
                        <SelectItem value="ease">Ease</SelectItem>
                        <SelectItem value="ease-in">Ease In</SelectItem>
                        <SelectItem value="ease-out">Ease Out</SelectItem>
                        <SelectItem value="ease-in-out">Ease In Out</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="currentLineScale"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Line Scale</FormLabel>
                    <Slider
                      min={1}
                      max={2}
                      step={0.1}
                      value={[field.value]}
                      onValueChange={(val) =>
                        handleSettingChange("currentLineScale", val[0])
                      }
                    />
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

        <Button
          type="button"
          onClick={handleResetToDefaults}
          variant="outline"
          className="w-full mt-4 ring-offset-0 focus:ring-offset-0 focus-visible:ring-offset-0"
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Reset to Defaults
        </Button>
      </form>
    </Form>
  );
};
