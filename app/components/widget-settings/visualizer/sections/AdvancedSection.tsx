import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { UseFormReturn } from "react-hook-form";

interface AdvancedSectionProps {
  form: UseFormReturn<any>;
}

export function AdvancedSection({ form }: AdvancedSectionProps) {
  return (
    <AccordionItem value="advanced">
      <AccordionTrigger>Advanced Settings</AccordionTrigger>
      <AccordionContent className="space-y-4 p-2">
        <FormField
          control={form.control}
          name="specificSettings.reflexRatio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reflex Ratio</FormLabel>
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
            <FormItem className="flex items-center justify-between">
              <FormLabel>Split Gradient</FormLabel>
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
          name="specificSettings.roundBars"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between">
              <FormLabel>Round Bars</FormLabel>
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
            <FormItem className="flex items-center justify-between">
              <FormLabel>Enable Canvas</FormLabel>
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
          name="specificSettings.backgroundCanvas"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between">
              <FormLabel>Background Canvas</FormLabel>
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
