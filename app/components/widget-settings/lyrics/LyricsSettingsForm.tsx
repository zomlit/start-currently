import React, { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form } from "@/components/ui/form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Loader2, RotateCcw } from "lucide-react";
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { GradientColorPicker } from "@/components/GradientColorPicker";
import AutosaveStatus from "@/components/AutoSaveStatus";
import { safeFormatColor } from "@/utils/color";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useDebouncedCallback } from "use-debounce";
import { lyricsSchema } from "@/schemas/lyrics";

// Add types
interface LyricsSettingsFormProps {
  settings: LyricsSettings;
  onSettingsChange: (settings: LyricsSettings) => Promise<void>;
  fontFamilies: string[];
  isFontLoading: boolean;
  injectFont: (font: string) => void;
  isVideoAvailable: boolean;
  isLyricsLoading: boolean;
}

interface LyricsSettings {
  // Add your settings type here
  [key: string]: any;
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
    step: number;
    label: string;
  }
>((props, ref) => {
  const { value, onChange, onBlur, min, max, step, label } = props;
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
        onValueCommit={onBlur}
        className="mt-2"
      />
    </div>
  );
});

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

      toast.success("Settings reset successfully");
    } catch (error) {
      console.error("Failed to reset settings:", error);
      toast.error("Failed to reset settings. Please try again.");
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
        toast.error("Your changes couldn't be saved. Please try again.");
      } finally {
        setIsSaving(false);
        setChangingField("");
      }
    },
    500
  );

  const handleSettingChange = async (field: string, value: any) => {
    const updatedSettings: LyricsSettings = {
      ...settings,
      [field]: value,
    };

    // Update form state immediately
    form.setValue(field as keyof LyricsSettings, value as any, {
      shouldValidate: true,
    });

    // Debounce the save with field name
    debouncedSettingsChange(updatedSettings, field);
  };

  // Form submission handler
  const onSubmit = async (data: LyricsSettings) => {
    try {
      await onSettingsChange(data);
      toast.success("Settings saved successfully");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings. Please try again.");
    }
  };

  return (
    <div className="relative">
      <Form {...form}>
        <div className="fixed top-4 right-4 z-50">
          <AutosaveStatus
            lastSaved={lastSaved}
            isSaving={isSaving}
            changingField={changingField}
          />
        </div>
        <div
          className={cn(
            "flex flex-col relative",
            isLyricsLoading && "opacity-50 pointer-events-none"
          )}
        >
          <div className="flex-1 overflow-y-auto">
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
                      name="padding"
                      render={({ field }) => (
                        <FormItem>
                          <SliderWithInput
                            label="Padding"
                            value={field.value}
                            onChange={(value) => {
                              field.onChange(value);
                              handleSettingChange("padding", value);
                            }}
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

                    {/* Text Color */}
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

                    {/* Current Line Text Color */}
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

                    {/* Font Size */}
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

                    {/* Line Height */}
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

                    {/* Text Alignment */}
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

                    {/* Text Shadow Settings */}
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

                    {/* Text Shadow Blur */}
                    <FormField
                      control={form.control}
                      name="textShadowBlur"
                      render={({ field }) => (
                        <FormItem>
                          <SliderWithInput
                            label="Text Shadow Blur"
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

                    {/* Text Shadow Offset X */}
                    <FormField
                      control={form.control}
                      name="textShadowOffsetX"
                      render={({ field }) => (
                        <FormItem>
                          <SliderWithInput
                            label="Text Shadow Offset X"
                            value={field.value}
                            onChange={(value) => {
                              field.onChange(value);
                              handleSettingChange("textShadowOffsetX", value);
                            }}
                            onBlur={field.onBlur}
                            min={-20}
                            max={20}
                            step={1}
                          />
                        </FormItem>
                      )}
                    />

                    {/* Text Shadow Offset Y */}
                    <FormField
                      control={form.control}
                      name="textShadowOffsetY"
                      render={({ field }) => (
                        <FormItem>
                          <SliderWithInput
                            label="Text Shadow Offset Y"
                            value={field.value}
                            onChange={(value) => {
                              field.onChange(value);
                              handleSettingChange("textShadowOffsetY", value);
                            }}
                            onBlur={field.onBlur}
                            min={-20}
                            max={20}
                            step={1}
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
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="animation">
                  <AccordionTrigger>Animation</AccordionTrigger>
                  <AccordionContent className="space-y-4">
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
                              <SelectItem value="easeOut">Ease Out</SelectItem>
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
                              <SelectItem value="backOut">Back Out</SelectItem>
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
              </Accordion>

              <div className="flex items-center space-x-2 pt-4">
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
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
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
              </div>

              <div className="flex !overflow-hidden">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={!form.formState.isDirty}
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </div>

          {isLyricsLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/20">
              <Spinner className="w-[30px] h-[30px] dark:fill-white" />
            </div>
          )}
        </div>
      </Form>
    </div>
  );
};

export default LyricsSettingsForm;
