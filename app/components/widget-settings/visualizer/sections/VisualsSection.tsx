import React from "react";
import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import IconWaveform from "@icons/outline/wave-sine.svg?react";
import { GradientColorPicker } from "@/components/GradientColorPicker";
import { parseRgba } from "@/utils/color";

interface VisualsSectionProps {
  form: UseFormReturn<any>;
}

const visualizationModes = [
  { value: "0", label: "Discrete frequencies" },
  { value: "1", label: "1/24th octave bands (240 bands)" },
  { value: "2", label: "1/12th octave bands (120 bands)" },
  { value: "3", label: "1/8th octave bands (80 bands)" },
  { value: "4", label: "1/6th octave bands (60 bands)" },
  { value: "5", label: "1/4th octave bands (40 bands)" },
  { value: "6", label: "1/3rd octave bands (30 bands)" },
  { value: "7", label: "Half octave bands (20 bands)" },
  { value: "8", label: "Full octave bands (10 bands)" },
  { value: "10", label: "Line / Area graph" },
];

const gradientOptions = [
  { value: "rainbow", label: "Rainbow" },
  { value: "classic", label: "Classic" },
  { value: "prism", label: "Prism" },
  { value: "Color Sync", label: "Color Sync" },
  { value: "custom", label: "Custom" },
];

export function VisualsSection({ form }: VisualsSectionProps) {
  const isOctaveBandMode = (mode: number) => mode >= 1 && mode <= 8;

  const handleGradientChange = (field: string) => (color: string) => {
    const rgbaColor = parseRgba(color);
    form.setValue(field, rgbaColor);
  };

  return (
    <AccordionItem value="visuals">
      <AccordionTrigger>
        <div className="flex items-center space-x-2">
          <IconWaveform className="h-6 w-6" />
          <span>Visual Settings</span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="space-y-4 p-2">
        <FormField
          control={form.control}
          name="specificSettings.mode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Visualization Mode</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(parseInt(value, 10))}
                value={field.value?.toString()}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select visualization mode" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {visualizationModes.map((mode) => (
                    <SelectItem key={mode.value} value={mode.value}>
                      {mode.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="specificSettings.gradient"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Gradient</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gradient" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {gradientOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        {form.watch("specificSettings.gradient") === "custom" && (
          <>
            <FormField
              control={form.control}
              name="specificSettings.customGradientStart"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Custom Gradient Start</FormLabel>
                  <FormControl>
                    <GradientColorPicker
                      color={field.value}
                      onChange={handleGradientChange(
                        "specificSettings.customGradientStart"
                      )}
                      onChangeComplete={handleGradientChange(
                        "specificSettings.customGradientStart"
                      )}
                      currentProfile={null}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="specificSettings.customGradientEnd"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Custom Gradient End</FormLabel>
                  <FormControl>
                    <GradientColorPicker
                      color={field.value}
                      onChange={handleGradientChange(
                        "specificSettings.customGradientEnd"
                      )}
                      onChangeComplete={handleGradientChange(
                        "specificSettings.customGradientEnd"
                      )}
                      currentProfile={null}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </>
        )}

        <FormField
          control={form.control}
          name="specificSettings.fillAlpha"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fill Opacity</FormLabel>
              <FormControl>
                <Slider
                  value={[field.value]}
                  onValueChange={([value]) => field.onChange(value)}
                  min={0}
                  max={1}
                  step={0.1}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {isOctaveBandMode(form.watch("specificSettings.mode")) && (
          <>
            <FormField
              control={form.control}
              name="specificSettings.barSpace"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bar Space</FormLabel>
                  <FormControl>
                    <Slider
                      value={[field.value]}
                      onValueChange={([value]) => field.onChange(value)}
                      min={0}
                      max={1}
                      step={0.01}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="specificSettings.ledBars"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>LED Bars</FormLabel>
                    <FormDescription>
                      Display bars as discrete LED-like segments
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="specificSettings.lumiBars"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Lumi Bars</FormLabel>
                    <FormDescription>
                      Add a luminance effect to the bars
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </>
        )}
      </AccordionContent>
    </AccordionItem>
  );
}
