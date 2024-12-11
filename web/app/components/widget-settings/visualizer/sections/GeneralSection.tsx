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
import { VisualizerProfile } from "@/schemas/visualizer";

interface GeneralSectionProps {
  form: UseFormReturn<any>;
}

export function GeneralSection({ form }: GeneralSectionProps) {
  return (
    <AccordionItem value="general">
      <AccordionTrigger>General Settings</AccordionTrigger>
      <AccordionContent className="space-y-4">
        <FormField
          control={form.control}
          name="specificSettings.hideOnDisabled"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel>Hide When Disabled</FormLabel>
                <FormDescription>
                  Hide the visualizer when no audio is playing
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
          name="specificSettings.pauseEnabled"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel>Enable Pause</FormLabel>
                <FormDescription>Allow pausing the visualizer</FormDescription>
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
      </AccordionContent>
    </AccordionItem>
  );
}
