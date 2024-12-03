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
import { UseFormReturn } from "react-hook-form";
import IconSettings from "@icons/outline/settings.svg?react";

interface AdvancedSectionProps {
  form: UseFormReturn<any>;
}

export function AdvancedSection({ form }: AdvancedSectionProps) {
  return (
    <AccordionItem value="advanced">
      <AccordionTrigger>
        <div className="flex items-center space-x-2">
          <IconSettings className="h-6 w-6" />
          <span>Advanced Settings</span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="space-y-4 p-2">
        <FormField
          control={form.control}
          name="specificSettings.reflexRatio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reflex Ratio</FormLabel>
              <FormDescription>
                Amount of reflection effect (0 = none, 1 = full mirror)
              </FormDescription>
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

        <FormField
          control={form.control}
          name="specificSettings.reflexAlpha"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reflex Opacity</FormLabel>
              <FormDescription>
                Opacity of the reflection effect
              </FormDescription>
              <FormControl>
                <Slider
                  value={[field.value]}
                  onValueChange={([value]) => field.onChange(value)}
                  min={0}
                  max={1}
                  step={0.05}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="specificSettings.reflexBright"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reflex Brightness</FormLabel>
              <FormDescription>
                Brightness multiplier for the reflection
              </FormDescription>
              <FormControl>
                <Slider
                  value={[field.value]}
                  onValueChange={([value]) => field.onChange(value)}
                  min={0}
                  max={2}
                  step={0.1}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="specificSettings.mirror"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mirror Mode</FormLabel>
              <FormDescription>
                Mirror the visualization (0 = none, 1 = left/right, 2 = up/down,
                3 = both)
              </FormDescription>
              <FormControl>
                <Slider
                  value={[field.value]}
                  onValueChange={([value]) => field.onChange(value)}
                  min={0}
                  max={3}
                  step={1}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="specificSettings.splitGradient"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel>Split Gradient</FormLabel>
                <FormDescription>
                  Apply gradient separately to each channel in dual modes
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
          name="specificSettings.canvasEnabled"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel>Enable Canvas</FormLabel>
                <FormDescription>
                  Use canvas rendering for better performance
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

        {form.watch("specificSettings.canvasEnabled") && (
          <FormField
            control={form.control}
            name="specificSettings.backgroundCanvas"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                  <FormLabel>Background Canvas</FormLabel>
                  <FormDescription>
                    Enable background effects on canvas
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
        )}

        {form.watch("specificSettings.backgroundCanvas") && (
          <FormField
            control={form.control}
            name="specificSettings.backgroundCanvasOpacity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Background Canvas Opacity</FormLabel>
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
        )}
      </AccordionContent>
    </AccordionItem>
  );
}
