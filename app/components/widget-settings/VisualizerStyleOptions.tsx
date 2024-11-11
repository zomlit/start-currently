import React from "react";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { GradientColorPicker } from "@/components/GradientColorPicker";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { VisualizerComponentProps } from "@/types/visualizer";

export const VisualizerStyleOptions: React.FC<VisualizerComponentProps> = ({
  form,
  handleSettingChange,
  handleSettingCommit,
  colorSyncEnabled,
  currentProfile,
}) => {
  const gradientOptions = [
    { value: "rainbow", label: "Rainbow" },
    { value: "custom", label: "Custom" },
  ];

  return (
    <div className="space-y-6">
      {/* Color Settings */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Colors</h3>
        <FormField
          control={form.control}
          name="colorSync"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between">
              <div>
                <FormLabel>Color Sync</FormLabel>
                <FormDescription>
                  Sync colors with album artwork
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={(checked) =>
                    handleSettingChange("colorSync", checked)
                  }
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div
          className={cn(
            "space-y-4 transition-all duration-300",
            !colorSyncEnabled ? "opacity-100" : "opacity-50 pointer-events-none"
          )}
        >
          <FormField
            control={form.control}
            name="gradient"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gradient Style</FormLabel>
                <Select
                  onValueChange={(value) =>
                    handleSettingChange("gradient", value)
                  }
                  value={field.value}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gradient style" />
                  </SelectTrigger>
                  <SelectContent>
                    {gradientOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

          {form.watch("gradient") === "custom" && (
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="customGradientStart"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Color</FormLabel>
                    <FormControl>
                      <GradientColorPicker
                        color={field.value}
                        onChange={(color) =>
                          handleSettingChange("customGradientStart", color)
                        }
                        onChangeComplete={(color) =>
                          handleSettingCommit("customGradientStart", color)
                        }
                        currentProfile={currentProfile}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="customGradientEnd"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Color</FormLabel>
                    <FormControl>
                      <GradientColorPicker
                        color={field.value}
                        onChange={(color) =>
                          handleSettingChange("customGradientEnd", color)
                        }
                        onChangeComplete={(color) =>
                          handleSettingCommit("customGradientEnd", color)
                        }
                        currentProfile={currentProfile}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          )}
        </div>
      </div>

      {/* Bar Style Settings */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Bar Style</h3>
        <FormField
          control={form.control}
          name="fillAlpha"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fill Opacity</FormLabel>
              <FormControl>
                <Slider
                  value={[field.value]}
                  min={0}
                  max={1}
                  step={0.01}
                  onValueChange={([value]) =>
                    handleSettingChange("fillAlpha", value)
                  }
                  onValueCommit={([value]) =>
                    handleSettingCommit("fillAlpha", value)
                  }
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="lineWidth"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Line Width</FormLabel>
              <FormControl>
                <Slider
                  value={[field.value]}
                  min={0}
                  max={5}
                  step={0.5}
                  onValueChange={([value]) =>
                    handleSettingChange("lineWidth", value)
                  }
                  onValueCommit={([value]) =>
                    handleSettingCommit("lineWidth", value)
                  }
                />
              </FormControl>
            </FormItem>
          )}
        />
      </div>

      {/* Reflection Settings */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Reflection</h3>
        <FormField
          control={form.control}
          name="reflexRatio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reflection Ratio</FormLabel>
              <FormControl>
                <Slider
                  value={[field.value]}
                  min={0}
                  max={1}
                  step={0.01}
                  onValueChange={([value]) =>
                    handleSettingChange("reflexRatio", value)
                  }
                  onValueCommit={([value]) =>
                    handleSettingCommit("reflexRatio", value)
                  }
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="reflexAlpha"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reflection Opacity</FormLabel>
              <FormControl>
                <Slider
                  value={[field.value]}
                  min={0}
                  max={1}
                  step={0.01}
                  onValueChange={([value]) =>
                    handleSettingChange("reflexAlpha", value)
                  }
                  onValueCommit={([value]) =>
                    handleSettingCommit("reflexAlpha", value)
                  }
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="reflexBright"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reflection Brightness</FormLabel>
              <FormControl>
                <Slider
                  value={[field.value]}
                  min={0}
                  max={2}
                  step={0.01}
                  onValueChange={([value]) =>
                    handleSettingChange("reflexBright", value)
                  }
                  onValueCommit={([value]) =>
                    handleSettingCommit("reflexBright", value)
                  }
                />
              </FormControl>
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};
