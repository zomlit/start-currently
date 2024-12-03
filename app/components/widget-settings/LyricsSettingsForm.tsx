import React, { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Slider } from "@/components/ui/slider";
import { GradientColorPicker } from "@/components/GradientColorPicker";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  RotateCcw,
  Loader2,
  Settings2,
  Type,
  Wand2,
  Sparkles,
  Palette,
} from "lucide-react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Copy } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import AutosaveStatus from "@/components/AutoSaveStatus";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

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
  isLyricsLoading: boolean;
}

// First, create a reusable SliderWithInput component
const SliderWithInput = React.forwardRef<
  HTMLDivElement,
  {
    value: number;
    onChange: (value: number) => void;
    onBlur?: () => void;
    min: number;
    max: number;
    step?: number;
    label: string;
  }
>(({ value, onChange, onBlur, min, max, step = 1, label }, ref) => {
  return (
    <div ref={ref} className="space-y-2">
      <div className="flex items-center justify-between">
        <FormLabel>{label}</FormLabel>
        <Input
          type="number"
          value={value}
          className="h-8 w-fit text-xs text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none px-2"
          onChange={(e) => {
            const newValue = parseFloat(e.target.value);
            if (!isNaN(newValue) && newValue >= min && newValue <= max) {
              onChange(newValue);
            }
          }}
          onBlur={onBlur}
          min={min}
          max={max}
          step={step}
        />
      </div>
      <Slider
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={(val) => onChange(val[0])}
        onValueCommit={onBlur ? () => onBlur() : undefined}
        className="mt-2"
      />
    </div>
  );
});

SliderWithInput.displayName = "SliderWithInput";

export const LyricsSettingsForm: React.FC<LyricsSettingsFormProps> = ({
  settings,
  onSettingsChange,
  fontFamilies,
  isFontLoading,
  injectFont,
  isVideoAvailable,
  isLyricsLoading,
}) => {
  const form = useForm<LyricsSettings>({
    resolver: zodResolver(lyricsSchema),
    defaultValues: settings,
  });

  // Add ref for dialog
  const dialogRef = useRef<HTMLButtonElement>(null);

  // Add handleResetToDefaults function
  const handleResetToDefaults = async () => {
    try {
      // Close dialog
      dialogRef.current?.click();

      // Get default settings from schema
      const defaultSettings = lyricsSchema.parse({});

      // Reset form to defaults
      form.reset(defaultSettings);

      // Update server state with all default settings
      await onSettingsChange(defaultSettings);

      toast.success({
        title: "Settings Reset",
        description: "Your lyrics settings have been reset to defaults",
      });
    } catch (error) {
      console.error("Failed to reset settings:", error);
      toast.error({
        title: "Reset Failed",
        description: "Failed to reset settings. Please try again.",
      });
    }
  };

  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [changingField, setChangingField] = useState<string>("");

  // Modify the debounced settings change to handle save status
  const debouncedSettingsChange = useDebouncedCallback(
    async (updatedSettings: LyricsSettings, fieldName: string) => {
      try {
        setIsSaving(true);
        setChangingField(fieldName);
        await onSettingsChange(updatedSettings);
        setLastSaved(new Date());
      } catch (error) {
        console.error("Error saving settings:", error);
        toast.error({
          title: "Error saving settings",
          description: "Your changes couldn't be saved. Please try again.",
        });
      } finally {
        setIsSaving(false);
        setChangingField("");
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

    // Debounce the save with field name
    debouncedSettingsChange(updatedSettings, field);
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
    <Form {...form} onSubmit={form.handleSubmit(onSubmit)}>
      <div className="relative">
        <div className="fixed top-4 right-4 z-50">
          <AutosaveStatus
            lastSaved={lastSaved}
            isSaving={isSaving}
            changingField={changingField}
          />
        </div>
        <div
          className={cn(
            "flex flex-col space-y-6 relative",
            isLyricsLoading && "opacity-50 pointer-events-none"
          )}
        >
          <div className="space-y-6">
            <Card className="border-border/0 bg-transparent">
              <CardHeader>
                <CardTitle className="text-xl font-semibold flex items-center gap-2">
                  <Settings2 className="h-5 w-5" />
                  Lyrics Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Accordion type="multiple" className="w-full space-y-4">
                  {/* Appearance Section */}
                  <AccordionItem
                    value="appearance"
                    className="border rounded-lg"
                  >
                    <AccordionTrigger className="px-4 hover:no-underline [&[data-state=open]]:rounded-t-lg [&[data-state=closed]]:rounded-lg">
                      <div className="flex items-center gap-2">
                        <Palette className="h-4 w-4" />
                        <span className="font-medium">Appearance</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4 pt-2 space-y-4">
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
                                handleSettingChange(
                                  "backgroundColor",
                                  formattedColor
                                );
                              }}
                              onChangeComplete={field.onBlur}
                              currentProfile={null}
                            />
                          </FormItem>
                        )}
                      />

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
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select a font" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {isFontLoading ? (
                                  <div className="flex items-center justify-center p-2">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span className="ml-2">
                                      Loading fonts...
                                    </span>
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
                    </AccordionContent>
                  </AccordionItem>

                  {/* Text Styling Section */}
                  <AccordionItem
                    value="text-styling"
                    className="border rounded-lg"
                  >
                    <AccordionTrigger className="px-4 hover:no-underline [&[data-state=open]]:rounded-t-lg [&[data-state=closed]]:rounded-lg">
                      <div className="flex items-center gap-2">
                        <Type className="h-4 w-4" />
                        <span className="font-medium">Text Styling</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4 pt-2 space-y-4">
                      {/* Text color fields */}
                      <div className="grid gap-4 md:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="textColor"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Text Color</FormLabel>
                              <GradientColorPicker
                                color={safeFormatColor(field.value)}
                                onChange={(color) =>
                                  handleSettingChange(
                                    "textColor",
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
                          name="currentTextColor"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Current Line Color</FormLabel>
                              <GradientColorPicker
                                color={safeFormatColor(field.value)}
                                onChange={(color) =>
                                  handleSettingChange(
                                    "currentTextColor",
                                    safeFormatColor(color)
                                  )
                                }
                                onChangeComplete={field.onBlur}
                                currentProfile={null}
                              />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Size and spacing controls */}
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="fontSize"
                          render={({ field }) => (
                            <FormItem>
                              <SliderWithInput
                                label="Font Size"
                                value={field.value}
                                onChange={(value) => {
                                  field.onChange(value);
                                  handleSettingChange("fontSize", value);
                                }}
                                onBlur={field.onBlur}
                                min={10}
                                max={72}
                                step={1}
                              />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="lineHeight"
                          render={({ field }) => (
                            <FormItem>
                              <SliderWithInput
                                label="Line Height"
                                value={field.value}
                                onChange={(value) => {
                                  field.onChange(value);
                                  handleSettingChange("lineHeight", value);
                                }}
                                onBlur={field.onBlur}
                                min={1}
                                max={3}
                                step={0.1}
                              />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Add text alignment */}
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

                      {/* Add text shadow controls */}
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

                      <div className="grid gap-4 md:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="textShadowBlur"
                          render={({ field }) => (
                            <FormItem>
                              <SliderWithInput
                                label="Shadow Blur"
                                value={field.value}
                                onChange={(value) => {
                                  field.onChange(value);
                                  handleSettingChange("textShadowBlur", value);
                                }}
                                onBlur={field.onBlur}
                                min={0}
                                max={20}
                                step={1}
                              />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="textShadowOffsetX"
                          render={({ field }) => (
                            <FormItem>
                              <SliderWithInput
                                label="Shadow Offset X"
                                value={field.value}
                                onChange={(value) => {
                                  field.onChange(value);
                                  handleSettingChange(
                                    "textShadowOffsetX",
                                    value
                                  );
                                }}
                                onBlur={field.onBlur}
                                min={-20}
                                max={20}
                                step={1}
                              />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="textShadowOffsetY"
                          render={({ field }) => (
                            <FormItem>
                              <SliderWithInput
                                label="Shadow Offset Y"
                                value={field.value}
                                onChange={(value) => {
                                  field.onChange(value);
                                  handleSettingChange(
                                    "textShadowOffsetY",
                                    value
                                  );
                                }}
                                onBlur={field.onBlur}
                                min={-20}
                                max={20}
                                step={1}
                              />
                            </FormItem>
                          )}
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Animation Section */}
                  <AccordionItem
                    value="animation"
                    className="border rounded-lg"
                  >
                    <AccordionTrigger className="px-4 hover:no-underline [&[data-state=open]]:rounded-t-lg [&[data-state=closed]]:rounded-lg">
                      <div className="flex items-center gap-2">
                        <Wand2 className="h-4 w-4" />
                        <span className="font-medium">Animation</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4 pt-2 space-y-4">
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
                            <SliderWithInput
                              label="Animation Speed (ms)"
                              value={field.value}
                              onChange={(value) => {
                                field.onChange(value);
                                handleSettingChange("animationSpeed", value);
                              }}
                              onBlur={field.onBlur}
                              min={100}
                              max={1000}
                              step={50}
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
                                <SelectItem value="easeOut">
                                  Ease Out
                                </SelectItem>
                                <SelectItem value="easeInOut">
                                  Ease In Out
                                </SelectItem>
                                <SelectItem value="circIn">
                                  Circular In
                                </SelectItem>
                                <SelectItem value="circOut">
                                  Circular Out
                                </SelectItem>
                                <SelectItem value="circInOut">
                                  Circular In Out
                                </SelectItem>
                                <SelectItem value="backIn">Back In</SelectItem>
                                <SelectItem value="backOut">
                                  Back Out
                                </SelectItem>
                                <SelectItem value="backInOut">
                                  Back In Out
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                    </AccordionContent>
                  </AccordionItem>

                  {/* Effects Section */}
                  <AccordionItem value="effects" className="border rounded-lg">
                    <AccordionTrigger className="px-4 hover:no-underline [&[data-state=open]]:rounded-t-lg [&[data-state=closed]]:rounded-lg">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4" />
                        <span className="font-medium">Effects</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4 pt-2 space-y-4">
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
                                  handleSettingChange(
                                    "greenScreenMode",
                                    checked
                                  );
                                }}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

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
                                Add a fade effect to the top and bottom of the
                                lyrics
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
                              <SliderWithInput
                                label="Fade Distance"
                                value={field.value}
                                onChange={(value) => {
                                  field.onChange(value);
                                  handleSettingChange("fadeDistance", value);
                                }}
                                onBlur={field.onBlur}
                                min={0}
                                max={200}
                                step={1}
                              />
                            </FormItem>
                          )}
                        />
                      )}

                      <FormField
                        control={form.control}
                        name="showVideoCanvas"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5">
                              <FormLabel>Show Video Canvas</FormLabel>
                              <FormDescription>
                                Display video if available
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
                                  handleSettingChange(
                                    "videoCanvasOpacity",
                                    val[0]
                                  )
                                }
                              />
                            </FormItem>
                          )}
                        />
                      )}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>

            <div className="flex items-center space-x-4">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    ref={dialogRef}
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Reset to Defaults
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Reset Settings?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will reset all lyrics settings to their default
                      values. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleResetToDefaults}>
                      Reset Settings
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <Button
                type="submit"
                className="w-full"
                disabled={!form.formState.isDirty}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </div>

        {isLyricsLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/20">
            <Spinner className="w-[30px] h-[30px] dark:fill-white" />
          </div>
        )}
      </div>
    </Form>
  );
};
