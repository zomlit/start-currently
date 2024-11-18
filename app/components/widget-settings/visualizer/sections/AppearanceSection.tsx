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
import { GradientColorPicker } from "@/components/GradientColorPicker";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { UseFormReturn } from "react-hook-form";
import { VisualizerProfile } from "@/types/visualizer";

interface AppearanceSectionProps {
  form: UseFormReturn<any>;
  profile?: VisualizerProfile;
}

export function AppearanceSection({ form, profile }: AppearanceSectionProps) {
  return (
    <AccordionItem value="appearance">
      <AccordionTrigger>Appearance</AccordionTrigger>
      <AccordionContent className="space-y-4 p-2">
        <FormField
          control={form.control}
          name="specificSettings.selectedSkin"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Skin</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a skin" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="minimal">Minimal</SelectItem>
                  <SelectItem value="rounded">Rounded</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="specificSettings.progressBarForegroundColor"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Progress Bar Color</FormLabel>
              <FormControl>
                <GradientColorPicker
                  color={field.value}
                  onChange={field.onChange}
                  onChangeComplete={field.onChange}
                  currentProfile={profile}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="specificSettings.progressBarBackgroundColor"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Progress Bar Background</FormLabel>
              <FormControl>
                <GradientColorPicker
                  color={field.value}
                  onChange={field.onChange}
                  onChangeComplete={field.onChange}
                  currentProfile={profile}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="specificSettings.hideOnDisabled"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between">
              <FormLabel>Hide When Disabled</FormLabel>
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
          name="specificSettings.backgroundCanvasOpacity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Background Opacity</FormLabel>
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
      </AccordionContent>
    </AccordionItem>
  );
}
