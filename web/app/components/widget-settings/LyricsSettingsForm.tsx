import React, { useRef, useState, useCallback } from "react";
import { useForm, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { GradientColorPicker } from "@/components/GradientColorPicker";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CircleDot } from "@/components/icons";
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
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import AutosaveStatus from "@/components/AutoSaveStatus";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useIsClient } from "@/hooks/useIsClient";
import { lyricsSchema, type LyricsSettings } from "@/schemas/lyrics";
import { Separator } from "@/components/ui/separator";
import { FeatureBadge } from "@/components/ui/feature-badge";
import { Slider } from "@/components/ui/slider";
import { SliderWithInput } from "@/components/ui/slider-with-input";

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
  onPreviewUpdate: (settings: LyricsSettings) => void;
}

type FieldProps = {
  name: string;
  value: any;
  onChange: (...event: any[]) => void;
  onBlur: () => void;
};

export const LyricsSettingsForm: React.FC<LyricsSettingsFormProps> = ({
  settings,
  onSettingsChange,
  fontFamilies,
  isFontLoading,
  injectFont,
  isVideoAvailable,
  isLyricsLoading,
  onPreviewUpdate,
}) => {
  const isClient = useIsClient();
  const isMounted = useRef(false);

  const form = useForm({
    resolver: zodResolver(lyricsSchema),
    defaultValues: settings,
    disabled: !isClient,
    mode: "onChange",
    reValidateMode: "onChange",
    shouldFocusError: false,
    criteriaMode: "firstError",
  }) as UseFormReturn<LyricsSettings>;

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

  const handleSettingChange = useCallback(
    async (field: keyof LyricsSettings, value: any) => {
      try {
        // Update form state
        form.setValue(field, value, {
          shouldDirty: true,
          shouldTouch: true,
        });

        // Create updated settings
        const updatedSettings = {
          ...settings,
          [field]: value,
        };

        // Immediately update preview
        onPreviewUpdate(updatedSettings);

        // Debounce the save to Supabase
        debouncedSettingsChange(updatedSettings, field);
      } catch (error) {
        console.error("Error in handleSettingChange:", error);
      }
    },
    [settings, form, debouncedSettingsChange, onPreviewUpdate]
  );

  // Form submission handler
  const onSubmit = async (data: LyricsSettings) => {
    if (!isClient) return;

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

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      form.handleSubmit((data: LyricsSettings) => {
        onSubmit(data);
      })(e);
    },
    [isClient, form, onSubmit]
  );

  return (
    <Form {...form} onSubmit={handleSubmit}>
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
                <Accordion type="multiple" className="w-full space-y-2">
                  {/* Appearance Section */}
                  <AccordionItem
                    value="appearance"
                    className="border rounded-md"
                  >
                    <AccordionTrigger className="px-4 py-3 hover:no-underline [&[data-state=open]]:rounded-t-lg [&[data-state=closed]]:rounded-md">
                      <div className="flex items-center gap-2">
                        <Palette className="h-4 w-4" />
                        <span className="font-medium">Appearance</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="p-4 space-y-4 bg-violet-50 dark:bg-violet-500/10 shadow-inner">
                      <FormField
                        control={form.control}
                        name="backgroundColor"
                        render={({ field }: { field: FieldProps }) => (
                          <FormItem>
                            <FormLabel>Background Color</FormLabel>
                            <GradientColorPicker
                              color={safeFormatColor(field.value)}
                              onChange={(color) => {
                                const formattedColor = safeFormatColor(color);
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
                        render={({ field }: { field: FieldProps }) => (
                          <FormItem>
                            <FormLabel>Font Family</FormLabel>
                            <Select
                              value={field.value}
                              onValueChange={(value) => {
                                handleSettingChange("fontFamily", value);
                                injectFont(value);
                              }}
                            >
                              <FormControl>
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select a font" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent
                                side="left"
                                align="center"
                                sideOffset={40}
                                className="h-[calc(100vh-var(--nav-height))] flex-col gap-4 p-3 sticky top-[var(--nav-height)] shadow-none border-0"
                              >
                                {isFontLoading ? (
                                  <div className="flex items-center justify-center p-2">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span className="ml-2">
                                      Loading fonts...
                                    </span>
                                  </div>
                                ) : (
                                  fontFamilies.map((font) => (
                                    <SelectItem
                                      key={font}
                                      value={font}
                                      className="cursor-pointer hover:!bg-violet-400/20 dark:hover:bg-violet-500/10"
                                    >
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
                    <AccordionTrigger className="px-4 py-3 hover:no-underline [&[data-state=open]]:rounded-t-lg [&[data-state=closed]]:rounded-lg">
                      <div className="flex items-center gap-2">
                        <Type className="h-4 w-4" />
                        <span className="font-medium">Text Styling</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="p-4 space-y-4 bg-violet-50 dark:bg-violet-500/10 shadow-inner">
                      {/* Text color fields */}
                      <div className="grid gap-4 md:grid-cols-1">
                        <FormField
                          control={form.control}
                          name="textColor"
                          render={({ field }: { field: FieldProps }) => (
                            <FormItem>
                              <FormLabel>Text Color</FormLabel>
                              <GradientColorPicker
                                color={safeFormatColor(field.value)}
                                onChange={(color) => {
                                  const formattedColor = safeFormatColor(color);
                                  handleSettingChange(
                                    "textColor",
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
                          name="currentTextColor"
                          render={({ field }: { field: FieldProps }) => (
                            <FormItem>
                              <FormLabel>Current Line Color</FormLabel>
                              <GradientColorPicker
                                color={safeFormatColor(field.value)}
                                onChange={(color) => {
                                  const formattedColor = safeFormatColor(color);
                                  handleSettingChange(
                                    "currentTextColor",
                                    formattedColor
                                  );
                                }}
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
                          render={({ field }: { field: FieldProps }) => (
                            <FormItem>
                              <SliderWithInput
                                label="Font Size"
                                value={field.value}
                                onChange={(value) => {
                                  handleSettingChange("fontSize", value);
                                }}
                                onBlur={field.onBlur}
                                min={8}
                                max={72}
                                step={1}
                                showTicks={false}
                              />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="lineHeight"
                          render={({ field }: { field: FieldProps }) => (
                            <FormItem>
                              <SliderWithInput
                                label="Line Height"
                                value={field.value}
                                onChange={(value) => {
                                  handleSettingChange("lineHeight", value);
                                }}
                                onBlur={field.onBlur}
                                min={1}
                                max={3}
                                step={0.1}
                                showTicks={false}
                              />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="padding"
                          render={({ field }: { field: FieldProps }) => (
                            <FormItem>
                              <SliderWithInput
                                min={0}
                                max={100}
                                value={field.value}
                                onChange={(value) => {
                                  handleSettingChange("padding", value);
                                }}
                                onBlur={field.onBlur}
                                label="Padding"
                                showTicks={false}
                              />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="margin"
                          render={({ field }: { field: FieldProps }) => (
                            <FormItem>
                              <SliderWithInput
                                min={0}
                                max={100}
                                value={field.value}
                                onChange={(value) => {
                                  handleSettingChange("margin", value);
                                }}
                                onBlur={field.onBlur}
                                label="Margin"
                                showTicks={false}
                              />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Add text alignment */}
                      <FormField
                        control={form.control}
                        name="textAlign"
                        render={({ field }: { field: FieldProps }) => (
                          <FormItem>
                            <FormLabel>Text Alignment</FormLabel>
                            <Select
                              value={field.value}
                              onValueChange={(value) => {
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
                        render={({ field }: { field: FieldProps }) => (
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

                      <div className="grid gap-4 md:grid-cols-1">
                        <FormField
                          control={form.control}
                          name="textShadowBlur"
                          render={({ field }: { field: FieldProps }) => (
                            <FormItem>
                              <SliderWithInput
                                label="Shadow Blur"
                                value={field.value}
                                onChange={(value) => {
                                  handleSettingChange("textShadowBlur", value);
                                }}
                                onBlur={field.onBlur}
                                min={0}
                                max={20}
                                step={1}
                                showTicks={false}
                              />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="textShadowOffsetX"
                          render={({ field }: { field: FieldProps }) => (
                            <FormItem>
                              <SliderWithInput
                                label="Shadow Offset X"
                                value={field.value}
                                onChange={(value) => {
                                  handleSettingChange(
                                    "textShadowOffsetX",
                                    value
                                  );
                                }}
                                onBlur={field.onBlur}
                                min={-20}
                                max={20}
                                step={1}
                                showTicks={false}
                              />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="textShadowOffsetY"
                          render={({ field }: { field: FieldProps }) => (
                            <FormItem>
                              <SliderWithInput
                                label="Shadow Offset Y"
                                value={field.value}
                                onChange={(value) => {
                                  handleSettingChange(
                                    "textShadowOffsetY",
                                    value
                                  );
                                }}
                                onBlur={field.onBlur}
                                min={-20}
                                max={20}
                                step={1}
                                showTicks={false}
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
                    <AccordionTrigger className="px-4 py-3 hover:no-underline [&[data-state=open]]:rounded-t-lg [&[data-state=closed]]:rounded-lg">
                      <div className="flex items-center gap-2">
                        <Wand2 className="h-4 w-4" />
                        <span className="font-medium">Animation</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="p-4 space-y-4 bg-violet-50 dark:bg-violet-500/10 shadow-inner">
                      <FormField
                        control={form.control}
                        name="animationStyle"
                        render={({ field }: { field: FieldProps }) => (
                          <FormItem>
                            <FormLabel>Animation Style</FormLabel>
                            <Select
                              value={field.value}
                              onValueChange={(value) => {
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
                        render={({ field }: { field: FieldProps }) => (
                          <FormItem>
                            <SliderWithInput
                              label="Animation Speed (ms)"
                              value={field.value}
                              onChange={(value) => {
                                handleSettingChange("animationSpeed", value);
                              }}
                              onBlur={field.onBlur}
                              min={100}
                              max={1000}
                              step={50}
                              showTicks={false}
                            />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="animationEasing"
                        render={({ field }: { field: FieldProps }) => (
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
                    <AccordionTrigger className="px-4 py-3 hover:no-underline [&[data-state=open]]:rounded-t-lg [&[data-state=closed]]:rounded-lg">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4" />
                        <span className="font-medium">Effects</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="p-4 space-y-4 bg-violet-50 dark:bg-violet-500/10 shadow-inner">
                      <FormField
                        control={form.control}
                        name="greenScreenMode"
                        render={({ field }: { field: FieldProps }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5 space-x-0.5">
                              <FormLabel>Green Screen Mode</FormLabel>
                              <FormDescription>
                                Enable green screen mode for chroma keying
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={(checked) => {
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
                        render={({ field }: { field: FieldProps }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5 space-x-0.5">
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
                            render={({ field }: { field: FieldProps }) => (
                              <FormItem>
                                <FormLabel>Glow Color</FormLabel>
                                <GradientColorPicker
                                  color={safeFormatColor(field.value)}
                                  onChange={(color) => {
                                    const formattedColor =
                                      safeFormatColor(color);
                                    handleSettingChange(
                                      "glowColor",
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
                            name="glowIntensity"
                            render={({ field }: { field: FieldProps }) => (
                              <FormItem>
                                <FormLabel>Glow Intensity</FormLabel>
                                <Slider
                                  defaultValue={[field.value]}
                                  max={20}
                                  min={0}
                                  step={1}
                                  onValueChange={(vals) => {
                                    handleSettingChange(
                                      "glowIntensity",
                                      vals[0]
                                    );
                                  }}
                                />
                              </FormItem>
                            )}
                          />
                        </>
                      )}

                      <FormField
                        control={form.control}
                        name="showFade"
                        render={({ field }: { field: FieldProps }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5 space-x-0.5">
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
                          render={({ field }: { field: FieldProps }) => (
                            <FormItem>
                              <SliderWithInput
                                label="Fade Distance"
                                value={field.value}
                                onChange={(value) => {
                                  handleSettingChange("fadeDistance", value);
                                }}
                                onBlur={field.onBlur}
                                min={0}
                                max={200}
                                step={1}
                                showTicks={false}
                              />
                            </FormItem>
                          )}
                        />
                      )}

                      <FormField
                        control={form.control}
                        name="showVideoCanvas"
                        render={({ field }: { field: FieldProps }) => (
                          <FormItem
                            className={cn(
                              "relative overflow-hidden",
                              "rounded-xl border border-green-500/20 dark:border-green-500/10",
                              "bg-green-50/50 dark:bg-green-950/20",
                              "p-4 shadow-sm",
                              "transition-all duration-300",
                              "hover:border-green-500/30 dark:hover:border-green-500/20",
                              "group"
                            )}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <FeatureBadge variant="green">
                                    NEW
                                  </FeatureBadge>
                                  <FormLabel className="font-semibold">
                                    Show Video Canvas
                                  </FormLabel>
                                </div>
                                <FormDescription className="text-sm text-muted-foreground">
                                  Enhance your lyrics with synchronized video
                                  (if available) background
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={(value) =>
                                    handleSettingChange(
                                      "showVideoCanvas",
                                      value
                                    )
                                  }
                                  disabled={!isVideoAvailable}
                                  className={cn(
                                    "data-[state=checked]:bg-green-400",
                                    "data-[state=checked]:shadow-sm",
                                    "transition-all duration-300"
                                  )}
                                />
                              </FormControl>
                            </div>

                            {!isVideoAvailable && (
                              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center !m-0">
                                <p className="text-sm text-muted-foreground">
                                  Video not available for current track
                                </p>
                              </div>
                            )}
                          </FormItem>
                        )}
                      />

                      {form.watch("showVideoCanvas") && (
                        <FormField
                          control={form.control}
                          name="videoCanvasOpacity"
                          render={({ field }: { field: FieldProps }) => (
                            <FormItem>
                              <FormLabel>Video Canvas Opacity</FormLabel>
                              <Slider
                                defaultValue={[field.value]}
                                max={1}
                                min={0}
                                step={0.01}
                                onValueChange={(vals) =>
                                  handleSettingChange(
                                    "videoCanvasOpacity",
                                    vals[0]
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
                    <RotateCcw className="size-4" />
                    Reset to Defaults
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="border border-border/50 bg-background/95 backdrop-blur-md">
                  <div className="flex items-start gap-4">
                    <div
                      className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted"
                      aria-hidden="true"
                    >
                      <div className="relative rounded-full p-3 animate-pulse sm:static sm:block sm:mx-auto">
                        <CircleDot className="h-5 w-5 text-pink-500 fill-pink-500 drop-shadow-[0_0_10px_rgba(236,72,153,0.7)] animate-glow" />
                      </div>
                    </div>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-lg font-semibold">
                        Reset Settings?
                      </AlertDialogTitle>
                      <AlertDialogDescription className="text-sm text-muted-foreground">
                        This will reset all lyrics settings to their default
                        values. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                  </div>

                  <Separator className="my-0" />

                  <AlertDialogFooter>
                    <AlertDialogCancel className="font-medium">
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleResetToDefaults}
                      className="bg-destructive hover:bg-destructive/90"
                    >
                      Reset Settings
                    </AlertDialogAction>
                  </AlertDialogFooter>
                  <div className="absolute -z-50 inset-0 bg-gradient-to-tr from-pink-500/10 to-violet-500/10 blur-xl animate-pulse" />
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
