import { Control } from "react-hook-form";
import { VisualizerProfile } from "@/schemas/visualizer";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
} from "@/components/ui/form";
import { Slider } from "@/components/ui/slider";
import { ColorPicker } from "@/components/ui/color-picker";
import { Switch } from "@/components/ui/switch";

interface VisualSettingsProps {
  control: Control<VisualizerProfile>;
}

export function VisualSettings({ control }: VisualSettingsProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Visual Settings</h3>

      <div className="space-y-4">
        <FormField
          control={control}
          name="settings.visual.background.color"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Background Color</FormLabel>
              <FormControl>
                <ColorPicker value={field.value} onChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="settings.visual.background.opacity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Background Opacity</FormLabel>
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
          control={control}
          name="settings.visual.background.useAlbumArt"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between">
              <FormLabel>Use Album Art</FormLabel>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
