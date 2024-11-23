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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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
  deadzone: z.number().min(0).max(0.4),
  debugMode: z.boolean(),
  useCustomShapeColors: z.boolean(),
  buttonShapeColor: z.string(),
  buttonShapePressedColor: z.string(),
  hideWhenInactive: z.boolean(),
  inactivityTimeout: z.number().min(1).max(60),
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

  const { watch, setValue } = form;

  // Update form values when settings change from outside
  useEffect(() => {
    if (JSON.stringify(form.getValues()) !== JSON.stringify(settings)) {
      form.reset(settings);
    }
  }, [settings]);

  // Debounced handler for server updates
  const debouncedServerUpdate = useDebouncedCallback(
    (values: Partial<GamepadSettings>) => {
      onSettingsChange(values);
    },
    1000 // 1 second debounce
  );

  // Immediate local update handler for individual field changes
  const handleFieldChange = (field: keyof GamepadSettings, value: any) => {
    setValue(field, value);
    // Only send the changed field
    debouncedServerUpdate({ [field]: value });
  };

  // Add handler for skin changes
  const handleSkinChange = (skinId: string) => {
    const skin = CONTROLLER_SKINS.find((s) => s.id === skinId);
    if (skin) {
      // Use debounced update for skin changes too
      debouncedServerUpdate(skin.colors);
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
        deadzone: 0,
        debugMode: false,
        useCustomShapeColors: false,
        buttonShapeColor: "#ffffff",
        buttonShapePressedColor: "#000000",
        hideWhenInactive: false,
        inactivityTimeout: 30,
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
      <form className="space-y-4">
        <Accordion type="multiple" className="w-full">
          {/* General Settings Section */}
          <AccordionItem value="general">
            <AccordionTrigger>General Settings</AccordionTrigger>
            <AccordionContent className="space-y-4">
              {/* <FormField
                control={form.control}
                name="backgroundColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Background Color</FormLabel>
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
                  </FormItem>
                )}
              /> */}
              <FormField
                control={form.control}
                name="scale"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Scale: {(field.value ?? 1).toFixed(2)}x
                    </FormLabel>
                    <Slider
                      min={0.1}
                      max={2}
                      step={0.1}
                      value={[field.value ?? 1]}
                      onValueChange={([value]) =>
                        handleFieldChange("scale", value)
                      }
                    />
                  </FormItem>
                )}
              />
            </AccordionContent>
          </AccordionItem>

          {/* Controller Settings Section */}
          <AccordionItem value="controller">
            <AccordionTrigger>Controller Settings</AccordionTrigger>
            <AccordionContent className="space-y-4">
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
            </AccordionContent>
          </AccordionItem>

          {/* Colors Section */}
          <AccordionItem value="colors">
            <AccordionTrigger>Colors</AccordionTrigger>
            <AccordionContent className="space-y-4">
              <FormField
                control={form.control}
                name="buttonColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Button Color</FormLabel>
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
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="buttonPressedColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Button Pressed Color</FormLabel>
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
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="stickColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stick Color</FormLabel>
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
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="triggerColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trigger Color</FormLabel>
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
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="useCustomShapeColors"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between">
                      <div>
                        <FormLabel>Custom Shape Colors</FormLabel>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={(checked) => {
                            field.onChange(checked);
                            handleFieldChange("useCustomShapeColors", checked);
                          }}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {form.watch("useCustomShapeColors") && (
                  <>
                    <FormField
                      control={form.control}
                      name="buttonShapeColor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Button Shape Color</FormLabel>
                          <GradientColorPicker
                            color={safeFormatColor(field.value)}
                            onChange={(color) => {
                              const formattedColor = safeFormatColor(color);
                              field.onChange(formattedColor);
                              handleFieldChange(
                                "buttonShapeColor",
                                formattedColor
                              );
                            }}
                            onChangeComplete={field.onBlur}
                            currentProfile={null}
                          />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="buttonShapePressedColor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Button Shape Pressed Color</FormLabel>
                          <GradientColorPicker
                            color={safeFormatColor(field.value)}
                            onChange={(color) => {
                              const formattedColor = safeFormatColor(color);
                              field.onChange(formattedColor);
                              handleFieldChange(
                                "buttonShapePressedColor",
                                formattedColor
                              );
                            }}
                            onChangeComplete={field.onBlur}
                            currentProfile={null}
                          />
                        </FormItem>
                      )}
                    />
                  </>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Behavior Section */}
          <AccordionItem value="behavior">
            <AccordionTrigger>Behavior</AccordionTrigger>
            <AccordionContent className="space-y-4">
              <FormField
                control={form.control}
                name="hideWhenInactive"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between">
                    <div>
                      <FormLabel>Hide When Inactive</FormLabel>
                      <FormDescription>
                        Hide the controller when no buttons are pressed
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={(checked) =>
                          handleFieldChange("hideWhenInactive", checked)
                        }
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Only show timeout slider when hideWhenInactive is true */}
              {form.watch("hideWhenInactive") && (
                <FormField
                  control={form.control}
                  name="inactivityTimeout"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Inactivity Timeout: {field.value} seconds
                      </FormLabel>
                      <FormDescription>
                        Time to wait before hiding the controller
                      </FormDescription>
                      <Slider
                        min={1}
                        max={60}
                        step={1}
                        value={[field.value]}
                        onValueChange={([value]) =>
                          handleFieldChange("inactivityTimeout", value)
                        }
                      />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="deadzone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Deadzone: {(field.value ?? 0).toFixed(2)}
                    </FormLabel>
                    <FormDescription>
                      Values above this threshold will be considered stick drift
                    </FormDescription>
                    <Slider
                      min={0}
                      max={0.4}
                      step={0.01}
                      value={[field.value ?? 0]}
                      onValueChange={([value]) =>
                        handleFieldChange("deadzone", value)
                      }
                    />
                  </FormItem>
                )}
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Reset Button */}
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
