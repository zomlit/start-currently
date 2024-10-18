import React, { useCallback, useEffect } from "react";
import { FormField, FormItem, FormLabel, FormControl, FormDescription } from "../ui/form";
import { Switch } from "../ui/switch";
import { Slider } from "../ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import GradientColorPicker from "../GradientColorPicker";
import MicrophoneSelect from "@/components/MicrophoneSelect";
import { parseRgba } from "@/utils/index";

interface VisualizerOptionsProps {
  form: any;
  currentProfile: any;
  handleProfileChange: (option: string, value: any) => void;
  colorSyncEnabled: boolean;
  localSettings: any;
  setLocalSettings: React.Dispatch<React.SetStateAction<any>>;
  palette?: any;
}

const defaultVisualizerSettings = {
  mode: 10,
  gradient: "custom",
  customGradientStart: { r: 255, g: 105, b: 180, a: 1 }, // Pink
  customGradientEnd: { r: 0, g: 128, b: 128, a: 1 }, // Teal
  fillAlpha: 0.5,
  lineWidth: 1,
  channelLayout: "dual-combined",
  frequencyScale: "bark",
  linearAmplitude: true,
  linearBoost: 1.8,
  showPeaks: false,
  outlineBars: true,
  weightingFilter: "D",
  barSpace: 0.1,
  ledBars: false,
  lumiBars: false,
  reflexRatio: 0,
  reflexAlpha: 0.15,
  reflexBright: 1,
  mirror: 0,
  splitGradient: false,
  roundBars: false,
};

const VisualizerOptions: React.FC<VisualizerOptionsProps> = ({
  form,
  currentProfile,
  handleProfileChange,
  colorSyncEnabled,
  localSettings,
  setLocalSettings,
  palette,
}) => {
  const handleChange = useCallback(
    (name: string, value: any) => {
      setLocalSettings((prev: any) => {
        if (prev[name] === value) return prev;
        const newSettings = { ...prev, [name]: value };
        handleProfileChange("specificSettings", { [name]: value });
        return newSettings;
      });
    },
    [setLocalSettings, handleProfileChange],
  );

  // Effect to set default gradient based on colorSyncEnabled
  useEffect(() => {
    if (colorSyncEnabled) {
      handleChange("gradient", "Color Sync");
    } else if (localSettings.gradient === "Color Sync") {
      handleChange("gradient", "custom");
      handleChange("customGradientStart", defaultVisualizerSettings.customGradientStart);
      handleChange("customGradientEnd", defaultVisualizerSettings.customGradientEnd);
    }
  }, [colorSyncEnabled, handleChange, localSettings.gradient]);

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

  const isOctaveBandMode = (mode: number) => mode >= 1 && mode <= 8;

  const gradientOptions = [
    { value: "rainbow", label: "Rainbow" },
    { value: "classic", label: "Classic" },
    { value: "prism", label: "Prism" },
    { value: "Color Sync", label: "Color Sync" },
    { value: "custom", label: "Custom" },
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
    { value: "log", label: "Logarithmic" },
    { value: "mel", label: "Mel" },
  ];

  const weightingFilters = [
    { value: "A", label: "A-weighting" },
    { value: "B", label: "B-weighting" },
    { value: "C", label: "C-weighting" },
    { value: "D", label: "D-weighting" },
    { value: "none", label: "None" },
  ];

  const handleMicrophoneChange = useCallback(
    (micId: string) => {
      handleChange("selectedMicId", micId);
    },
    [handleChange],
  );

  const renderColorValue = (color: { r: number; g: number; b: number; a: number } | undefined) => {
    if (!color) return "N/A";
    return `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a.toFixed(2)})`;
  };

  return (
    <div className="space-y-4">
      {/* Visualization Mode */}
      <FormField
        control={form.control}
        name="specificSettings.mode"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Visualization Mode</FormLabel>
            <Select
              onValueChange={(value) => {
                const numericValue = parseInt(value, 10);
                field.onChange(numericValue);
                handleChange("mode", numericValue);
              }}
              defaultValue={field.value?.toString() || defaultVisualizerSettings.mode.toString()}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select visualization mode" />
                </SelectTrigger>
              </FormControl>
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

      {/* Round Bars (only show when an octave band mode is selected) */}
      {isOctaveBandMode(localSettings.mode) && (
        <FormField
          control={form.control}
          name="specificSettings.roundBars"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Round Bars</FormLabel>
                <FormDescription>Applies rounded corners to the top of the bars</FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value ?? defaultVisualizerSettings.roundBars}
                  onCheckedChange={(value) => {
                    field.onChange(value);
                    handleChange("roundBars", value);
                  }}
                />
              </FormControl>
            </FormItem>
          )}
        />
      )}

      {/* Gradient Selection */}
      <FormField
        control={form.control}
        name="specificSettings.gradient"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Gradient</FormLabel>
            <Select
              onValueChange={(value) => {
                field.onChange(value);
                handleChange("gradient", value);
              }}
              value={field.value || (colorSyncEnabled ? "Color Sync" : "custom")}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select gradient" />
                </SelectTrigger>
              </FormControl>
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

      {/* Show Custom Gradient options only when 'custom' is selected */}
      {form.watch("specificSettings.gradient") === "custom" && (
        <>
          {/* Custom Gradient Start */}
          <FormField
            control={form.control}
            name="specificSettings.customGradientStart"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Custom Gradient Start</FormLabel>
                <FormControl>
                  <GradientColorPicker
                    color={renderColorValue(
                      field.value || defaultVisualizerSettings.customGradientStart,
                    )}
                    onChange={(color) => {
                      const rgbaColor = parseRgba(color);
                      field.onChange(rgbaColor);
                      handleChange("customGradientStart", rgbaColor);
                    }}
                    onChangeComplete={(color) => {
                      const rgbaColor = parseRgba(color);
                      handleChange("customGradientStart", rgbaColor);
                    }}
                    currentProfile={currentProfile}
                  />
                </FormControl>
                <FormDescription>
                  Current color:{" "}
                  {renderColorValue(field.value || defaultVisualizerSettings.customGradientStart)}
                </FormDescription>
              </FormItem>
            )}
          />

          {/* Custom Gradient End */}
          <FormField
            control={form.control}
            name="specificSettings.customGradientEnd"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Custom Gradient End</FormLabel>
                <FormControl>
                  <GradientColorPicker
                    color={renderColorValue(
                      field.value || defaultVisualizerSettings.customGradientEnd,
                    )}
                    onChange={(color) => {
                      const rgbaColor = parseRgba(color);
                      field.onChange(rgbaColor);
                      handleChange("customGradientEnd", rgbaColor);
                    }}
                    onChangeComplete={(color) => {
                      const rgbaColor = parseRgba(color);
                      handleChange("customGradientEnd", rgbaColor);
                    }}
                    currentProfile={currentProfile}
                  />
                </FormControl>
                <FormDescription>
                  Current color:{" "}
                  {renderColorValue(field.value || defaultVisualizerSettings.customGradientEnd)}
                </FormDescription>
              </FormItem>
            )}
          />
        </>
      )}

      {/* Fill Alpha */}
      <FormField
        control={form.control}
        name="specificSettings.fillAlpha"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Fill Alpha</FormLabel>
            <FormControl>
              <Slider
                min={0}
                max={1}
                step={0.1}
                value={[field.value || defaultVisualizerSettings.fillAlpha]}
                onValueChange={(value) => {
                  field.onChange(value[0]);
                  handleChange("fillAlpha", value[0]);
                }}
              />
            </FormControl>
          </FormItem>
        )}
      />

      {/* Line Width */}
      <FormField
        control={form.control}
        name="specificSettings.lineWidth"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Line Width</FormLabel>
            <FormControl>
              <Slider
                min={0}
                max={5}
                step={0.5}
                value={[field.value || defaultVisualizerSettings.lineWidth]}
                onValueChange={(value) => {
                  field.onChange(value[0]);
                  handleChange("lineWidth", value[0]);
                }}
              />
            </FormControl>
          </FormItem>
        )}
      />

      {/* Show Peaks */}
      <FormField
        control={form.control}
        name="specificSettings.showPeaks"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <FormLabel className="text-base">Show Peaks</FormLabel>
            </div>
            <FormControl>
              <Switch
                checked={field.value ?? defaultVisualizerSettings.showPeaks}
                onCheckedChange={(value) => {
                  field.onChange(value);
                  handleChange("showPeaks", value);
                }}
              />
            </FormControl>
          </FormItem>
        )}
      />

      {/* Outline Bars */}
      <FormField
        control={form.control}
        name="specificSettings.outlineBars"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <FormLabel className="text-base">Outline Bars</FormLabel>
            </div>
            <FormControl>
              <Switch
                checked={field.value ?? defaultVisualizerSettings.outlineBars}
                onCheckedChange={(value) => {
                  field.onChange(value);
                  handleChange("outlineBars", value);
                }}
              />
            </FormControl>
          </FormItem>
        )}
      />

      {/* Bar Options (only for octave band modes) */}
      {isOctaveBandMode(localSettings.mode) && (
        <>
          {/* Bar Space */}
          <FormField
            control={form.control}
            name="specificSettings.barSpace"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bar Space</FormLabel>
                <FormControl>
                  <Slider
                    min={0}
                    max={1}
                    step={0.01}
                    value={[field.value || defaultVisualizerSettings.barSpace]}
                    onValueChange={(value) => {
                      field.onChange(value[0]);
                      handleChange("barSpace", value[0]);
                    }}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {/* LED Bars */}
          <FormField
            control={form.control}
            name="specificSettings.ledBars"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">LED Bars</FormLabel>
                  <FormDescription>Display bars as discrete LED-like segments</FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value ?? defaultVisualizerSettings.ledBars}
                    onCheckedChange={(value) => {
                      field.onChange(value);
                      handleChange("ledBars", value);
                    }}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {/* Lumi Bars */}
          <FormField
            control={form.control}
            name="specificSettings.lumiBars"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Lumi Bars</FormLabel>
                  <FormDescription>Add a luminance effect to the bars</FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value ?? defaultVisualizerSettings.lumiBars}
                    onCheckedChange={(value) => {
                      field.onChange(value);
                      handleChange("lumiBars", value);
                    }}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {/* Alpha Bars */}
          <FormField
            control={form.control}
            name="specificSettings.alphaBars"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Alpha Bars</FormLabel>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value ?? defaultVisualizerSettings.alphaBars}
                    onCheckedChange={(value) => {
                      field.onChange(value);
                      handleChange("alphaBars", value);
                    }}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {/* Reflex Ratio */}
          <FormField
            control={form.control}
            name="specificSettings.reflexRatio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reflex Ratio</FormLabel>
                <FormControl>
                  <Slider
                    min={0}
                    max={1}
                    step={0.01}
                    value={[field.value || defaultVisualizerSettings.reflexRatio]}
                    onValueChange={(value) => {
                      field.onChange(value[0]);
                      handleChange("reflexRatio", value[0]);
                    }}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {/* Reflex Alpha */}
          <FormField
            control={form.control}
            name="specificSettings.reflexAlpha"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reflex Alpha</FormLabel>
                <FormControl>
                  <Slider
                    min={0}
                    max={1}
                    step={0.01}
                    value={[field.value || defaultVisualizerSettings.reflexAlpha]}
                    onValueChange={(value) => {
                      field.onChange(value[0]);
                      handleChange("reflexAlpha", value[0]);
                    }}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {/* Reflex Brightness */}
          <FormField
            control={form.control}
            name="specificSettings.reflexBright"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reflex Brightness</FormLabel>
                <FormControl>
                  <Slider
                    min={0}
                    max={2}
                    step={0.01}
                    value={[field.value || defaultVisualizerSettings.reflexBright]}
                    onValueChange={(value) => {
                      field.onChange(value[0]);
                      handleChange("reflexBright", value[0]);
                    }}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </>
      )}

      {/* Reflex Options - Always visible */}
      <FormField
        control={form.control}
        name="specificSettings.reflexRatio"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Reflex Ratio</FormLabel>
            <FormControl>
              <Slider
                min={0}
                max={1}
                step={0.01}
                value={[field.value || defaultVisualizerSettings.reflexRatio]}
                onValueChange={(value) => {
                  field.onChange(value[0]);
                  handleChange("reflexRatio", value[0]);
                }}
              />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="specificSettings.reflexAlpha"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Reflex Alpha</FormLabel>
            <FormControl>
              <Slider
                min={0}
                max={1}
                step={0.01}
                value={[field.value || defaultVisualizerSettings.reflexAlpha]}
                onValueChange={(value) => {
                  field.onChange(value[0]);
                  handleChange("reflexAlpha", value[0]);
                }}
              />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="specificSettings.reflexBright"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Reflex Brightness</FormLabel>
            <FormControl>
              <Slider
                min={0}
                max={2}
                step={0.01}
                value={[field.value || defaultVisualizerSettings.reflexBright]}
                onValueChange={(value) => {
                  field.onChange(value[0]);
                  handleChange("reflexBright", value[0]);
                }}
              />
            </FormControl>
          </FormItem>
        )}
      />

      {/* Channel Layout */}
      <FormField
        control={form.control}
        name="specificSettings.channelLayout"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Channel Layout</FormLabel>
            <Select
              onValueChange={(value) => {
                field.onChange(value);
                handleChange("channelLayout", value);
              }}
              defaultValue={field.value || defaultVisualizerSettings.channelLayout}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select channel layout" />
                </SelectTrigger>
              </FormControl>
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

      {/* Frequency Scale */}
      <FormField
        control={form.control}
        name="specificSettings.frequencyScale"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Frequency Scale</FormLabel>
            <Select
              onValueChange={(value) => {
                field.onChange(value);
                handleChange("frequencyScale", value);
              }}
              defaultValue={field.value || defaultVisualizerSettings.frequencyScale}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency scale" />
                </SelectTrigger>
              </FormControl>
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

      {/* Linear Amplitude */}
      <FormField
        control={form.control}
        name="specificSettings.linearAmplitude"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <FormLabel className="text-base">Linear Amplitude</FormLabel>
            </div>
            <FormControl>
              <Switch
                checked={field.value ?? defaultVisualizerSettings.linearAmplitude}
                onCheckedChange={(value) => {
                  field.onChange(value);
                  handleChange("linearAmplitude", value);
                }}
              />
            </FormControl>
          </FormItem>
        )}
      />

      {/* Linear Boost (only show when Linear Amplitude is enabled) */}
      {localSettings.linearAmplitude && (
        <FormField
          control={form.control}
          name="specificSettings.linearBoost"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Linear Boost</FormLabel>
              <FormControl>
                <Slider
                  min={1}
                  max={5}
                  step={0.1}
                  value={[field.value || defaultVisualizerSettings.linearBoost]}
                  onValueChange={(value) => {
                    field.onChange(value[0]);
                    handleChange("linearBoost", value[0]);
                  }}
                />
              </FormControl>
            </FormItem>
          )}
        />
      )}

      {/* Weighting Filter */}
      <FormField
        control={form.control}
        name="specificSettings.weightingFilter"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Weighting Filter</FormLabel>
            <Select
              onValueChange={(value) => {
                field.onChange(value);
                handleChange("weightingFilter", value);
              }}
              defaultValue={field.value || defaultVisualizerSettings.weightingFilter}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select weighting filter" />
                </SelectTrigger>
              </FormControl>
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

      {/* Mirror */}
      <FormField
        control={form.control}
        name="specificSettings.mirror"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Mirror</FormLabel>
            <Select
              onValueChange={(value) => {
                field.onChange(parseInt(value));
                handleChange("mirror", parseInt(value));
              }}
              defaultValue={field.value?.toString() || defaultVisualizerSettings.mirror.toString()}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select mirror mode" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="0">None</SelectItem>
                <SelectItem value="1">Left</SelectItem>
                <SelectItem value="2">Right</SelectItem>
                <SelectItem value="3">Left & Right</SelectItem>
              </SelectContent>
            </Select>
          </FormItem>
        )}
      />

      {/* Split Gradient */}
      <FormField
        control={form.control}
        name="specificSettings.splitGradient"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <FormLabel className="text-base">Split Gradient</FormLabel>
              <FormDescription>Split the gradient at the mirror point</FormDescription>
            </div>
            <FormControl>
              <Switch
                checked={field.value ?? defaultVisualizerSettings.splitGradient}
                onCheckedChange={(value) => {
                  field.onChange(value);
                  handleChange("splitGradient", value);
                }}
              />
            </FormControl>
          </FormItem>
        )}
      />

      {/* Microphone Input */}
      <FormField
        control={form.control}
        name="specificSettings.micEnabled"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <FormLabel className="text-base">Microphone Input</FormLabel>
              <FormDescription>Use microphone as audio input</FormDescription>
            </div>
            <FormControl>
              <Switch
                checked={field.value ?? false}
                onCheckedChange={(value) => {
                  field.onChange(value);
                  handleChange("micEnabled", value);
                }}
              />
            </FormControl>
          </FormItem>
        )}
      />

      {/* Microphone Select (only show when microphone input is enabled) */}
      {localSettings.micEnabled && (
        <FormField
          control={form.control}
          name="specificSettings.selectedMicId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Select Microphone</FormLabel>
              <FormControl>
                <MicrophoneSelect
                  value={field.value}
                  onChange={handleMicrophoneChange}
                  onMicSelected={handleMicrophoneChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
      )}
    </div>
  );
};

export default VisualizerOptions;
