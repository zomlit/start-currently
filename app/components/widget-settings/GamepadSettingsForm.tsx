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
import { GradientColorPicker } from "@/components/GradientColorPicker";
import { useDebouncedCallback } from "use-debounce";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";

const gamepadSettingsSchema = z.object({
  controllerType: z.string(),
  controllerColor: z.string(),
  showButtonPresses: z.boolean(),
  showAnalogSticks: z.boolean(),
  showTriggers: z.boolean(),
  buttonColor: z.string(),
  buttonPressedColor: z.string(),
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

const safeFormatColor = (color: any): string => {
  if (!color) return "rgba(0, 0, 0, 1)";

  // If it's a palette color object
  if (typeof color === "object" && color !== null) {
    if (typeof color.hex === "string") return color.hex;
    if (
      typeof color.r === "number" &&
      typeof color.g === "number" &&
      typeof color.b === "number"
    ) {
      return `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a || 1})`;
    }
    return "rgba(0, 0, 0, 1)";
  }

  if (typeof color !== "string") {
    return "rgba(0, 0, 0, 1)";
  }

  return color;
};

// Add this type and constant for skins
type ControllerSkin = {
  id: string;
  name: string;
  colors: {
    controllerColor: string;
    buttonColor: string;
    buttonPressedColor: string;
    stickColor: string;
    triggerColor: string;
    backgroundColor: string;
  };
};

const CONTROLLER_SKINS: ControllerSkin[] = [
  {
    id: "default",
    name: "Default",
    colors: {
      controllerColor: "black",
      buttonColor: "#ffffff",
      buttonPressedColor: "#00ff00",
      stickColor: "#1a1a1a",
      triggerColor: "#1a1a1a",
      backgroundColor: "transparent",
    },
  },
  {
    id: "macho",
    name: "Miss Macho TV",
    colors: {
      controllerColor: "macho",
      buttonColor: "#39FF14", // Neon green
      buttonPressedColor: "#800080", // Purple
      stickColor: "#39FF14",
      triggerColor: "#39FF14",
      backgroundColor: "transparent",
    },
  },
];

export function GamepadSettingsForm({
  settings,
  onSettingsChange,
}: GamepadSettingsFormProps) {
  const form = useForm<GamepadSettings>({
    resolver: zodResolver(gamepadSettingsSchema),
    defaultValues: settings,
  });

  // Update form when settings change, but prevent infinite loop
  useEffect(() => {
    if (JSON.stringify(form.getValues()) !== JSON.stringify(settings)) {
      form.reset(settings);
    }
  }, [settings]);

  // Handle individual field changes with debounce
  const handleFieldChange = useDebouncedCallback(
    (field: keyof GamepadSettings, value: any) => {
      onSettingsChange({ [field]: value });
    },
    500
  );

  // Add handler for skin changes
  const handleSkinChange = (skinId: string) => {
    const skin = CONTROLLER_SKINS.find((s) => s.id === skinId);
    if (skin) {
      onSettingsChange(skin.colors);
    }
  };

  // Add reset handler
  const handleResetToDefaults = async () => {
    try {
      const defaultSettings = {
        controllerType: "ds4",
        controllerColor: "white",
        showButtonPresses: true,
        showAnalogSticks: true,
        showTriggers: true,
        buttonColor: "#1a1a1a",
        buttonPressedColor: "#000000",
        stickColor: "#1a1a1a",
        triggerColor: "#1a1a1a",
        backgroundColor: "transparent",
        scale: 1,
        deadzone: 0.1,
        debugMode: false,
      };

      // Reset form to default values
      form.reset(defaultSettings);
      // Update parent component
      await onSettingsChange(defaultSettings);
    } catch (error) {
      console.error("Error resetting settings:", error);
    }
  };

  return (
    <Form {...form}>
      <form className="space-y-6 p-6">
        {/* Add Skins dropdown at the top */}
        <FormField
          control={form.control}
          name="skin"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Skins</FormLabel>
              <FormDescription>
                Choose a preset color scheme for your controller
              </FormDescription>
              <Select onValueChange={handleSkinChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a skin" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {CONTROLLER_SKINS.map((skin) => (
                    <SelectItem key={skin.id} value={skin.id}>
                      <div className="flex items-center space-x-2">
                        <div
                          className="h-4 w-4 rounded-full border"
                          style={{
                            backgroundColor: skin.colors.buttonColor,
                            borderColor: skin.colors.buttonPressedColor,
                          }}
                        />
                        <span>{skin.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

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
                  <GradientColorPicker
                    color={safeFormatColor(field.value)}
                    onChange={(color) => {
                      const formattedColor = safeFormatColor(color);
                      field.onChange(formattedColor);
                      handleFieldChange("buttonColor", formattedColor);
                    }}
                    onChangeComplete={field.onBlur}
                    currentProfile={null}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="buttonPressedColor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Button Pressed Color</FormLabel>
                <FormDescription>
                  Color of the buttons when pressed
                </FormDescription>
                <FormControl>
                  <GradientColorPicker
                    color={safeFormatColor(field.value)}
                    onChange={(color) => {
                      const formattedColor = safeFormatColor(color);
                      field.onChange(formattedColor);
                      handleFieldChange("buttonPressedColor", formattedColor);
                    }}
                    onChangeComplete={field.onBlur}
                    currentProfile={null}
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
                  <GradientColorPicker
                    color={safeFormatColor(field.value)}
                    onChange={(color) => {
                      const formattedColor = safeFormatColor(color);
                      field.onChange(formattedColor);
                      handleFieldChange("stickColor", formattedColor);
                    }}
                    onChangeComplete={field.onBlur}
                    currentProfile={null}
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
                  <GradientColorPicker
                    color={safeFormatColor(field.value)}
                    onChange={(color) => {
                      const formattedColor = safeFormatColor(color);
                      field.onChange(formattedColor);
                      handleFieldChange("triggerColor", formattedColor);
                    }}
                    onChangeComplete={field.onBlur}
                    currentProfile={null}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="backgroundColor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Background Color</FormLabel>
                <FormControl>
                  <GradientColorPicker
                    color={safeFormatColor(field.value)}
                    onChange={(color) => {
                      const formattedColor = safeFormatColor(color);
                      field.onChange(formattedColor);
                      handleFieldChange("backgroundColor", formattedColor);
                    }}
                    onChangeComplete={field.onBlur}
                    currentProfile={null}
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

        {/* Add Reset Button at the bottom */}
        <div className="flex items-center space-x-2 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={handleResetToDefaults}
            className="w-full"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset to Defaults
          </Button>
        </div>
      </form>
    </Form>
  );
}
