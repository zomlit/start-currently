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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { UseFormReturn } from "react-hook-form";
import { ColorPicker } from "@/components/form/ColorPicker";

interface VisualsSectionProps {
  form: UseFormReturn<any>;
}

export function VisualsSection({ form }: VisualsSectionProps) {
  return (
    <AccordionItem value="visuals">
      <AccordionTrigger>Visual Settings</AccordionTrigger>
      <AccordionContent className="space-y-4 p-2">
        <FormField
          control={form.control}
          name="specificSettings.mode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Visualization Mode</FormLabel>
              <FormControl>
                <Slider
                  value={[field.value]}
                  onValueChange={([value]) => field.onChange(value)}
                  min={0}
                  max={10}
                  step={1}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="specificSettings.gradient"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Gradient</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gradient" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="rainbow">Rainbow</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

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

        <FormField
          control={form.control}
          name="specificSettings.lineWidth"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Line Width</FormLabel>
              <FormControl>
                <Slider
                  value={[field.value]}
                  onValueChange={([value]) => field.onChange(value)}
                  min={0}
                  max={5}
                  step={0.5}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="specificSettings.barSpace"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bar Spacing</FormLabel>
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
          name="specificSettings.showPeaks"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between">
              <FormLabel>Show Peaks</FormLabel>
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
          name="specificSettings.outlineBars"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between">
              <FormLabel>Outline Bars</FormLabel>
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
          name="specificSettings.ledBars"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between">
              <FormLabel>LED Bars</FormLabel>
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
            <FormItem className="flex items-center justify-between">
              <FormLabel>Luminance Bars</FormLabel>
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
