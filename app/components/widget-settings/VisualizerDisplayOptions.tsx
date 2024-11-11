import React from "react";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import MicrophoneSelect from "@/components/MicrophoneSelect";
import { VisualizerComponentProps } from "@/types/visualizer";

const visualizationModes = [
  { value: "0", label: "Discrete frequencies" },
  { value: "1", label: "1/24th octave bands (240 bands)" },
  { value: "2", label: "1/12th octave bands (120 bands)" },
  { value: "3", label: "1/8th octave bands (80 bands)" },
  { value: "4", label: "1/6th octave bands (60 bands)" },
  { value: "5", label: "1/4th octave bands (40 bands)" },
  { value: "6", label: "1/3rd octave bands (30 bands)" },
  { value: "7", label: "Half octave bands (20 bands)" },
  { value: "8", label: "Full octave bands (10 bands)" },
  { value: "10", label: "Line / Area graph" },
];

const channelLayouts = [
  { value: "single", label: "Single" },
  { value: "dual-combined", label: "Dual Combined" },
  { value: "dual-horizontal", label: "Dual Horizontal" },
  { value: "dual-vertical", label: "Dual Vertical" },
];

const frequencyScales = [
  { value: "bark", label: "Bark" },
  { value: "linear", label: "Linear" },
  { value: "logarithmic", label: "Logarithmic" },
  { value: "mel", label: "Mel" },
];

const weightingFilters = [
  { value: "A", label: "A-weighting" },
  { value: "B", label: "B-weighting" },
  { value: "C", label: "C-weighting" },
  { value: "D", label: "D-weighting" },
  { value: "none", label: "None" },
];

export const VisualizerDisplayOptions: React.FC<VisualizerComponentProps> = ({
  form,
  handleSettingChange,
  handleSettingCommit,
  setCanvasAvailable,
}) => {
  const isOctaveBandMode = (mode: number) => mode >= 1 && mode <= 8;
  const currentMode = form.watch("mode");

  return (
    <div className="space-y-6">
      {/* Visualization Settings */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Visualization</h3>
        <FormField
          control={form.control}
          name="mode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Visualization Mode</FormLabel>
              <Select
                onValueChange={(value) => {
                  const numericValue = parseInt(value, 10);
                  handleSettingChange("mode", numericValue);
                }}
                value={field.value.toString()}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select mode" />
                </SelectTrigger>
                <SelectContent>
                  {visualizationModes.map((mode) => (
                    <SelectItem key={mode.value} value={mode.value}>
                      {mode.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="channelLayout"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Channel Layout</FormLabel>
              <Select
                onValueChange={(value) =>
                  handleSettingChange("channelLayout", value)
                }
                value={field.value}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select channel layout" />
                </SelectTrigger>
                <SelectContent>
                  {channelLayouts.map((layout) => (
                    <SelectItem key={layout.value} value={layout.value}>
                      {layout.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
      </div>

      {/* Audio Analysis Settings */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Audio Analysis</h3>
        <FormField
          control={form.control}
          name="frequencyScale"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Frequency Scale</FormLabel>
              <Select
                onValueChange={(value) =>
                  handleSettingChange("frequencyScale", value)
                }
                value={field.value}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency scale" />
                </SelectTrigger>
                <SelectContent>
                  {frequencyScales.map((scale) => (
                    <SelectItem key={scale.value} value={scale.value}>
                      {scale.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="weightingFilter"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Weighting Filter</FormLabel>
              <Select
                onValueChange={(value) =>
                  handleSettingChange("weightingFilter", value)
                }
                value={field.value}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select weighting filter" />
                </SelectTrigger>
                <SelectContent>
                  {weightingFilters.map((filter) => (
                    <SelectItem key={filter.value} value={filter.value}>
                      {filter.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="linearBoost"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Linear Boost</FormLabel>
              <FormControl>
                <Slider
                  value={[field.value]}
                  min={1}
                  max={5}
                  step={0.1}
                  onValueChange={([value]) =>
                    handleSettingChange("linearBoost", value)
                  }
                  onValueCommit={([value]) =>
                    handleSettingCommit("linearBoost", value)
                  }
                />
              </FormControl>
            </FormItem>
          )}
        />
      </div>

      {/* Microphone Settings */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Microphone</h3>
        <FormField
          control={form.control}
          name="micEnabled"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between">
              <div>
                <FormLabel>Microphone Input</FormLabel>
                <FormDescription>Use microphone as audio input</FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={(checked) =>
                    handleSettingChange("micEnabled", checked)
                  }
                />
              </FormControl>
            </FormItem>
          )}
        />

        {form.watch("micEnabled") && (
          <FormField
            control={form.control}
            name="selectedMicId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Select Microphone</FormLabel>
                <FormControl>
                  <MicrophoneSelect
                    value={field.value}
                    onChange={(value) =>
                      handleSettingChange("selectedMicId", value)
                    }
                  />
                </FormControl>
              </FormItem>
            )}
          />
        )}
      </div>
    </div>
  );
};
