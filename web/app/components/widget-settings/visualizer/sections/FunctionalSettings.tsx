import { Control } from "react-hook-form";
import { VisualizerProfile } from "@/schemas/visualizer";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";

interface FunctionalSettingsProps {
  control: Control<VisualizerProfile>;
}

export function FunctionalSettings({ control }: FunctionalSettingsProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Functional Settings</h3>

      <FormField
        control={control}
        name="settings.functional.behavior.syncColors"
        render={({ field }) => (
          <FormItem className="flex items-center justify-between">
            <FormLabel>Color Sync</FormLabel>
            <FormControl>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="settings.functional.visualizer.sensitivity"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Sensitivity</FormLabel>
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
    </div>
  );
}
