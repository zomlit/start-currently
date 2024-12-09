import React, { useEffect } from "react";
import { useForm, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { GradientColorPicker } from "@/components/GradientColorPicker";
import { Switch } from "@/components/ui/switch";
import { Settings2, Type, Wand2, Sparkles, Palette } from "lucide-react";
import { IconAdjustmentsCog } from "@tabler/icons-react";

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

import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import AutosaveStatus from "@/components/AutoSaveStatus";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useIsClient } from "@/hooks/useIsClient";
import {
  lyricsSchema,
  type LyricsSettings,
  defaultLyricsSettings,
} from "@/schemas/lyrics";

import { SliderWithInput } from "@/components/ui/slider-with-input";
import { SettingsFormFooter } from "@/components/ui/settings-form-footer";
import { useSettingsForm } from "@/hooks/useSettingsForm";

type FieldProps<T> = {
  field: {
    value: T;
    onChange: (value: T) => void;
    onBlur: () => void;
    name: string;
    ref: React.Ref<any>;
  };
};

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

  const form = useForm({
    resolver: zodResolver(lyricsSchema) as any,
    defaultValues: settings as LyricsSettings,
    values: settings as LyricsSettings,
    disabled: !isClient,
    mode: "onChange",
    reValidateMode: "onChange",
    shouldFocusError: false,
    criteriaMode: "firstError",
  }) as UseFormReturn<LyricsSettings>;

  const {
    handleSettingChange,
    handleResetToDefaults,
    handleSubmit,
    dialogRef,
    isSaving,
    lastSaved,
    changingField,
    hasPendingChanges,
  } = useSettingsForm({
    form,
    settings,
    onSettingsChange,
    onPreviewUpdate,
    schema: lyricsSchema as any,
    defaultSettings: defaultLyricsSettings,
  });

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
            "flex flex-col",
            isLyricsLoading && "opacity-50 pointer-events-none"
          )}
        >
          <div className="space-y-6">
            <Card className="border-border/0 bg-transparent rounded-none p-0">
              <CardHeader className="pl-0">
                <CardTitle className="text-xl font-semibold flex items-center gap-2 p-0">
                  <div className="rounded-full p-2">
                    <IconAdjustmentsCog className="h-5 w-5" />
                  </div>
                  Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Accordion type="multiple" className="w-full space-y-2">
                  {/* Basic Settings */}
                  <AccordionItem value="basic" className="border rounded-md">
                    <AccordionTrigger className="px-4 py-3 hover:no-underline [&[data-state=open]]:rounded-t-lg [&[data-state=closed]]:rounded-md">
                      <div className="flex items-center gap-2">
                        <Settings2 className="h-4 w-4" />
                        <span className="font-medium">Basic Settings</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="p-4 space-y-4 bg-violet-50 dark:bg-violet-500/10 shadow-inner">
                      {/* Font Family */}
                      <FormField
                        control={form.control}
                        name="fontFamily"
                        render={({ field }: FieldProps<string>) => (
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
                                <SelectTrigger>
                                  <SelectValue placeholder="Select font family" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {fontFamilies.map((font) => (
                                  <SelectItem key={font} value={font}>
                                    {font}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />

                      {/* Font Size */}
                      <FormField
                        control={form.control}
                        name="fontSize"
                        render={({ field }: FieldProps<number>) => (
                          <FormItem>
                            <SliderWithInput
                              label="Font Size"
                              value={field.value}
                              onChange={(value) =>
                                handleSettingChange("fontSize", value)
                              }
                              onBlur={field.onBlur}
                              min={10}
                              max={72}
                              step={1}
                            />
                          </FormItem>
                        )}
                      />

                      {/* Line Height */}
                      <FormField
                        control={form.control}
                        name="lineHeight"
                        render={({ field }: FieldProps<number>) => (
                          <FormItem>
                            <SliderWithInput
                              label="Line Height"
                              value={field.value}
                              onChange={(value) =>
                                handleSettingChange("lineHeight", value)
                              }
                              onBlur={field.onBlur}
                              min={1}
                              max={3}
                              step={0.1}
                            />
                          </FormItem>
                        )}
                      />

                      {/* Text Alignment */}
                      <FormField
                        control={form.control}
                        name="textAlign"
                        render={({ field }: FieldProps<string>) => (
                          <FormItem>
                            <FormLabel>Text Alignment</FormLabel>
                            <Select
                              value={field.value}
                              onValueChange={(value) =>
                                handleSettingChange("textAlign", value)
                              }
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

                      {/* Hide Explicit Content */}
                      <FormField
                        control={form.control}
                        name="hideExplicitContent"
                        render={({ field }: FieldProps<boolean>) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5">
                              <FormLabel>Hide Explicit Content</FormLabel>
                              <FormDescription>
                                Replace explicit words with asterisks
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={(value) => {
                                  handleSettingChange(
                                    "hideExplicitContent",
                                    value
                                  );
                                }}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </AccordionContent>
                  </AccordionItem>

                  {/* Colors & Appearance */}
                  <AccordionItem value="colors" className="border rounded-md">
                    <AccordionTrigger className="px-4 py-3 hover:no-underline [&[data-state=open]]:rounded-t-lg [&[data-state=closed]]:rounded-md">
                      <div className="flex items-center gap-2">
                        <Palette className="h-4 w-4" />
                        <span className="font-medium">Colors & Appearance</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="p-4 space-y-4 bg-violet-50 dark:bg-violet-500/10 shadow-inner relative">
                      {/* Background Color */}
                      <FormField
                        className="w-full relative"
                        control={form.control}
                        name="backgroundColor"
                        render={({ field }: FieldProps<string>) => (
                          <FormItem>
                            <FormLabel>Background Color</FormLabel>
                            <GradientColorPicker
                              color={field.value}
                              onChange={(color) =>
                                handleSettingChange("backgroundColor", color)
                              }
                              onChangeComplete={(color) =>
                                handleSettingChange("backgroundColor", color)
                              }
                              currentProfile={null}
                            />
                          </FormItem>
                        )}
                      />

                      {/* Text Color */}
                      <FormField
                        control={form.control}
                        name="textColor"
                        render={({ field }: FieldProps<string>) => (
                          <FormItem>
                            <FormLabel>Text Color</FormLabel>
                            <GradientColorPicker
                              color={field.value}
                              onChange={(color) =>
                                handleSettingChange("textColor", color)
                              }
                              onChangeComplete={(color) =>
                                handleSettingChange("textColor", color)
                              }
                              currentProfile={null}
                            />
                          </FormItem>
                        )}
                      />

                      {/* Current Line Color */}
                      <FormField
                        control={form.control}
                        name="currentTextColor"
                        render={({ field }: FieldProps<string>) => (
                          <FormItem>
                            <FormLabel>Current Line Color</FormLabel>
                            <GradientColorPicker
                              color={field.value}
                              onChange={(color) =>
                                handleSettingChange("currentTextColor", color)
                              }
                              onChangeComplete={(color) =>
                                handleSettingChange("currentTextColor", color)
                              }
                              currentProfile={null}
                            />
                          </FormItem>
                        )}
                      />

                      {/* Green Screen Mode */}
                      <FormField
                        control={form.control}
                        name="greenScreenMode"
                        render={({ field }: FieldProps<boolean>) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5">
                              <FormLabel>Green Screen Mode</FormLabel>
                              <FormDescription>
                                Use green background for chroma key
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

                      {/* Padding */}
                      <FormField
                        control={form.control}
                        name="padding"
                        render={({ field }: FieldProps<number>) => (
                          <FormItem>
                            <SliderWithInput
                              label="Padding"
                              value={field.value}
                              onChange={(value) =>
                                handleSettingChange("padding", value)
                              }
                              onBlur={field.onBlur}
                              min={0}
                              max={100}
                              step={1}
                            />
                          </FormItem>
                        )}
                      />
                    </AccordionContent>
                  </AccordionItem>

                  {/* Animation & Transitions */}
                  <AccordionItem
                    value="animation"
                    className="border rounded-md"
                  >
                    <AccordionTrigger className="px-4 py-3 hover:no-underline [&[data-state=open]]:rounded-t-lg [&[data-state=closed]]:rounded-md">
                      <div className="flex items-center gap-2">
                        {" "}
                        <Wand2 className="h-4 w-4" />
                        <span className="font-medium">
                          Animation & Transitions
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="p-4 space-y-4 bg-violet-50 dark:bg-violet-500/10 shadow-inner">
                      {/* Animation Style */}
                      <FormField
                        control={form.control}
                        name="animationStyle"
                        render={({ field }: FieldProps<string>) => (
                          <FormItem>
                            <FormLabel>Animation Style</FormLabel>
                            <Select
                              value={field.value}
                              onValueChange={(value) =>
                                handleSettingChange("animationStyle", value)
                              }
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

                      {/* Animation Speed */}
                      <FormField
                        control={form.control}
                        name="animationSpeed"
                        render={({ field }: FieldProps<number>) => (
                          <FormItem>
                            <SliderWithInput
                              label="Animation Speed (ms)"
                              value={field.value}
                              onChange={(value) =>
                                handleSettingChange("animationSpeed", value)
                              }
                              onBlur={field.onBlur}
                              min={100}
                              max={1000}
                              step={50}
                            />
                          </FormItem>
                        )}
                      />

                      {/* Animation Easing */}
                      <FormField
                        control={form.control}
                        name="animationEasing"
                        render={({ field }: FieldProps<string>) => (
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

                      {/* Current Line Scale */}
                      <FormField
                        control={form.control}
                        name="currentLineScale"
                        render={({ field }: FieldProps<number>) => (
                          <FormItem>
                            <SliderWithInput
                              label="Current Line Scale"
                              value={field.value}
                              onChange={(value) =>
                                handleSettingChange("currentLineScale", value)
                              }
                              onBlur={field.onBlur}
                              min={1}
                              max={2}
                              step={0.1}
                            />
                          </FormItem>
                        )}
                      />
                    </AccordionContent>
                  </AccordionItem>

                  {/* Effects & Styling */}
                  <AccordionItem value="effects" className="border rounded-md">
                    <AccordionTrigger className="px-4 py-3 hover:no-underline [&[data-state=open]]:rounded-t-lg [&[data-state=closed]]:rounded-md">
                      <div className="flex items-center gap-2">
                        {" "}
                        <Sparkles className="h-4 w-4" />
                        <span className="font-medium">Effects & Styling</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="p-4 space-y-4 bg-violet-50 dark:bg-violet-500/10 shadow-inner">
                      {/* Text Shadow Color */}
                      <FormField
                        control={form.control}
                        name="textShadowColor"
                        render={({ field }: FieldProps<string>) => (
                          <FormItem>
                            <FormLabel>Text Shadow Color</FormLabel>
                            <GradientColorPicker
                              color={field.value}
                              onChange={(color) =>
                                handleSettingChange("textShadowColor", color)
                              }
                              onChangeComplete={(color) =>
                                handleSettingChange("textShadowColor", color)
                              }
                              currentProfile={null}
                            />
                          </FormItem>
                        )}
                      />

                      {/* Text Shadow Blur */}
                      <FormField
                        control={form.control}
                        name="textShadowBlur"
                        render={({ field }: FieldProps<number>) => (
                          <FormItem>
                            <SliderWithInput
                              label="Text Shadow Blur"
                              value={field.value}
                              onChange={(value) =>
                                handleSettingChange("textShadowBlur", value)
                              }
                              onBlur={field.onBlur}
                              min={0}
                              max={20}
                              step={1}
                            />
                          </FormItem>
                        )}
                      />

                      {/* Text Shadow Offset X/Y */}
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="textShadowOffsetX"
                          render={({ field }: FieldProps<number>) => (
                            <FormItem>
                              <SliderWithInput
                                label="Offset X"
                                value={field.value}
                                onChange={(value) =>
                                  handleSettingChange(
                                    "textShadowOffsetX",
                                    value
                                  )
                                }
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
                          render={({ field }: FieldProps<number>) => (
                            <FormItem>
                              <SliderWithInput
                                label="Offset Y"
                                value={field.value}
                                onChange={(value) =>
                                  handleSettingChange(
                                    "textShadowOffsetY",
                                    value
                                  )
                                }
                                onBlur={field.onBlur}
                                min={-20}
                                max={20}
                                step={1}
                              />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Glow Effect */}
                      <FormField
                        control={form.control}
                        name="glowEffect"
                        render={({ field }: FieldProps<boolean>) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5">
                              <FormLabel>Glow Effect</FormLabel>
                              <FormDescription>
                                Add a glowing effect to the text
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

                      {/* Glow Color & Intensity */}
                      {form.watch("glowEffect") && (
                        <>
                          <FormField
                            control={form.control}
                            name="glowColor"
                            render={({ field }: FieldProps<string>) => (
                              <FormItem>
                                <FormLabel>Glow Color</FormLabel>
                                <GradientColorPicker
                                  color={field.value}
                                  onChange={(color) =>
                                    handleSettingChange("glowColor", color)
                                  }
                                  onChangeComplete={(color) =>
                                    handleSettingChange("glowColor", color)
                                  }
                                  currentProfile={null}
                                />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="glowIntensity"
                            render={({ field }: FieldProps<number>) => (
                              <FormItem>
                                <SliderWithInput
                                  label="Glow Intensity"
                                  value={field.value}
                                  onChange={(value) =>
                                    handleSettingChange("glowIntensity", value)
                                  }
                                  onBlur={field.onBlur}
                                  min={0}
                                  max={20}
                                  step={1}
                                />
                              </FormItem>
                            )}
                          />
                        </>
                      )}
                    </AccordionContent>
                  </AccordionItem>

                  {/* Video Background */}
                  <AccordionItem value="video" className="border rounded-md">
                    <AccordionTrigger className="px-4 py-3 hover:no-underline [&[data-state=open]]:rounded-t-lg [&[data-state=closed]]:rounded-md">
                      <div className="flex items-center gap-2">
                        <Type className="h-4 w-4" />
                        <span className="font-medium">Video Background</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="p-4 space-y-4 bg-violet-50 dark:bg-violet-500/10 shadow-inner">
                      {/* Show Video Canvas */}
                      <FormField
                        control={form.control}
                        name="showVideoCanvas"
                        render={({ field }: FieldProps<boolean>) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5">
                              <FormLabel>Show Video Background</FormLabel>
                              <FormDescription>
                                Use Spotify video as background
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
                            {!isVideoAvailable && (
                              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm top-[48px] rounded-b-md flex items-center justify-center !m-0">
                                <p className="text-sm text-muted-foreground text-center">
                                  Video not available for current track
                                </p>
                              </div>
                            )}
                          </FormItem>
                        )}
                      />

                      {/* Video Canvas Opacity */}
                      {form.watch("showVideoCanvas") && (
                        <FormField
                          control={form.control}
                          name="videoCanvasOpacity"
                          render={({ field }: FieldProps<number>) => (
                            <FormItem>
                              <SliderWithInput
                                label="Video Opacity"
                                value={field.value}
                                onChange={(value) =>
                                  handleSettingChange(
                                    "videoCanvasOpacity",
                                    value
                                  )
                                }
                                onBlur={field.onBlur}
                                min={0}
                                max={1}
                                step={0.01}
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

            <SettingsFormFooter
              onReset={handleResetToDefaults}
              hasPendingChanges={hasPendingChanges}
              dialogRef={dialogRef}
              resetDialogTitle="Reset Lyrics Settings?"
              resetDialogDescription="This will reset all lyrics settings to their default values. This action cannot be undone."
              isSaving={isSaving}
              saveError={null}
              lastSaved={lastSaved}
            />
          </div>
        </div>

        {isLyricsLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/20">
            <Spinner className="w-8 h-8 dark:fill-white" />
          </div>
        )}
      </div>
    </Form>
  );
};
