import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { cn } from "@/lib/utils";
import { CONTROLLER_TYPES, CONTROLLER_COLORS } from "@/lib/gamepad-settings";
import {
  Form,
  FormControl,
  FormDescription,
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
import { Input } from "@/components/ui/input";
import { GamepadSettings } from "@/types/gamepad";

const gamepadSettingsSchema = z.object({
  controllerType: z.string(),
  controllerColor: z.string(),
  showButtonPresses: z.boolean(),
  showAnalogSticks: z.boolean(),
  showTriggers: z.boolean(),
  buttonColor: z.string(),
  stickColor: z.string(),
  triggerColor: z.string(),
  backgroundColor: z.string(),
  scale: z.number().min(0.1).max(2),
  deadzone: z.number().min(0).max(1),
  debugMode: z.boolean(),
});

type GamepadSettingsFormProps = {
  settings: GamepadSettings;
  onSettingsChange: (settings: Partial<GamepadSettings>) => void;
};

export function GamepadSettingsForm({
  settings,
  onSettingsChange,
}: GamepadSettingsFormProps) {
  const form = useForm<GamepadSettings>({
    resolver: zodResolver(gamepadSettingsSchema),
    defaultValues: settings,
  });

  // Update form when settings change
  useEffect(() => {
    form.reset(settings);
  }, [settings, form]);

  // Handle individual field changes
  const handleFieldChange = (field: keyof GamepadSettings, value: any) => {
    onSettingsChange({ [field]: value });
  };

  return (
    <Form {...form}>
      <form className="space-y-6 p-6">
        {/* Controller Type */}
        <FormField
          control={form.control}
          name="controllerType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Controller Type</FormLabel>
              <Select
                onValueChange={(value) =>
                  handleFieldChange("controllerType", value)
                }
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a controller type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {CONTROLLER_TYPES.map((controller) => {
                    const Icon = controller.icon;
                    return (
                      <SelectItem
                        key={controller.id}
                        value={controller.id}
                        disabled={controller.disabled}
                      >
                        <div className="flex items-center space-x-2">
                          <Icon className="h-4 w-4" />
                          <span>{controller.name}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        {/* Controller Color */}
        <FormField
          control={form.control}
          name="controllerColor"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Controller Color</FormLabel>
              <Select
                onValueChange={(value) =>
                  handleFieldChange("controllerColor", value)
                }
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a color" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {CONTROLLER_COLORS.map((color) => (
                    <SelectItem key={color.id} value={color.id}>
                      <div className="flex items-center space-x-2">
                        <div
                          className="h-4 w-4 rounded-full border"
                          style={{ backgroundColor: color.hex }}
                        />
                        <span>{color.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        {/* Display Options */}
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="showButtonPresses"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between">
                <div>
                  <FormLabel>Show Button Presses</FormLabel>
                  <FormDescription>
                    Highlight buttons when pressed
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={(checked) =>
                      handleFieldChange("showButtonPresses", checked)
                    }
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="showAnalogSticks"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between">
                <div>
                  <FormLabel>Show Analog Sticks</FormLabel>
                  <FormDescription>Show analog stick movement</FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={(checked) =>
                      handleFieldChange("showAnalogSticks", checked)
                    }
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="showTriggers"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between">
                <div>
                  <FormLabel>Show Triggers</FormLabel>
                  <FormDescription>Show trigger pressure</FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={(checked) =>
                      handleFieldChange("showTriggers", checked)
                    }
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        {/* Colors */}
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="buttonColor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Button Color</FormLabel>
                <FormControl>
                  <Input
                    type="color"
                    {...field}
                    onChange={(e) =>
                      handleFieldChange("buttonColor", e.target.value)
                    }
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="stickColor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stick Color</FormLabel>
                <FormControl>
                  <Input
                    type="color"
                    {...field}
                    onChange={(e) =>
                      handleFieldChange("stickColor", e.target.value)
                    }
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="triggerColor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Trigger Color</FormLabel>
                <FormControl>
                  <Input
                    type="color"
                    {...field}
                    onChange={(e) =>
                      handleFieldChange("triggerColor", e.target.value)
                    }
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        {/* Scale and Deadzone */}
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="scale"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Scale: {field.value.toFixed(2)}x</FormLabel>
                <FormControl>
                  <Slider
                    min={0.1}
                    max={2}
                    step={0.1}
                    value={[field.value]}
                    onValueChange={([value]) =>
                      handleFieldChange("scale", value)
                    }
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="deadzone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Deadzone: {(field.value * 100).toFixed(0)}%
                </FormLabel>
                <FormControl>
                  <Slider
                    min={0}
                    max={1}
                    step={0.01}
                    value={[field.value]}
                    onValueChange={([value]) =>
                      handleFieldChange("deadzone", value)
                    }
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        {/* Debug Mode */}
        <FormField
          control={form.control}
          name="debugMode"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between">
              <div>
                <FormLabel>Debug Mode</FormLabel>
                <FormDescription>Show debug information</FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={(checked) =>
                    handleFieldChange("debugMode", checked)
                  }
                />
              </FormControl>
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
