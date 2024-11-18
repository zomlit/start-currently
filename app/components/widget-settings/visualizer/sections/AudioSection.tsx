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

interface AudioSectionProps {
  form: UseFormReturn<any>;
}

export function AudioSection({ form }: AudioSectionProps) {
  return (
    <AccordionItem value="audio">
      <AccordionTrigger>Audio Settings</AccordionTrigger>
      <AccordionContent className="space-y-4 p-2">
        <FormField
          control={form.control}
          name="specificSettings.channelLayout"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Channel Layout</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select channel layout" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="single">Single</SelectItem>
                  <SelectItem value="dual-combined">Dual Combined</SelectItem>
                  <SelectItem value="dual-separate">Dual Separate</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="specificSettings.frequencyScale"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Frequency Scale</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency scale" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="linear">Linear</SelectItem>
                  <SelectItem value="bark">Bark</SelectItem>
                  <SelectItem value="mel">Mel</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="specificSettings.linearAmplitude"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between">
              <FormLabel>Linear Amplitude</FormLabel>
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
          name="specificSettings.linearBoost"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Linear Boost</FormLabel>
              <FormControl>
                <Slider
                  value={[field.value]}
                  onValueChange={([value]) => field.onChange(value)}
                  min={1}
                  max={5}
                  step={0.1}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="specificSettings.weightingFilter"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Weighting Filter</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select weighting filter" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="A">A-weighting</SelectItem>
                  <SelectItem value="B">B-weighting</SelectItem>
                  <SelectItem value="C">C-weighting</SelectItem>
                  <SelectItem value="D">D-weighting</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="specificSettings.micEnabled"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between">
              <FormLabel>Enable Microphone Input</FormLabel>
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
