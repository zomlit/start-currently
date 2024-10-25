import React from "react";
import { UseFormReturn } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { VisualizerSettingsFormProps } from "./VisualizerSettingsForm";
import { Accordion } from "@/components/ui/accordion";
import { VisualizerColorSection } from "@/components/settings-sections/VisualizerColorSection";

interface VisualizerSettingsFormFieldsProps {
  form: UseFormReturn<VisualizerSettingsFormProps>;
  handleSettingChange: (
    field: keyof VisualizerSettingsFormProps,
    value: any
  ) => void;
  handleSettingCommit: (
    field: keyof VisualizerSettingsFormProps,
    value: any
  ) => void;
  currentProfile: any; // Replace 'any' with the correct type
  setCanvasAvailable: (value: boolean) => void;
}

const VisualizerSettingsFormFields: React.FC<
  VisualizerSettingsFormFieldsProps
> = ({
  form,
  handleSettingChange,
  handleSettingCommit,
  currentProfile,
  setCanvasAvailable,
}) => {
  const renderSlider = (
    fieldName: keyof VisualizerSettingsFormProps,
    label: string,
    min: number,
    max: number,
    step: number
  ) => (
    <FormField
      control={form.control}
      name={fieldName}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <Slider
            min={min}
            max={max}
            step={step}
            value={[field.value as number]}
            onValueChange={(value) => {
              const newValue = value[0];
              handleSettingChange(fieldName, newValue);
            }}
            onValueCommit={(value) => {
              const newValue = value[0];
              handleSettingCommit(fieldName, newValue);
            }}
          />
        </FormItem>
      )}
    />
  );

  return (
    <>
      <Accordion type="single" collapsible className="w-full space-y-4">
        <VisualizerColorSection
          form={form}
          handleSettingChange={handleSettingChange}
          handleSettingCommit={handleSettingCommit}
          widgetType="visualizer"
          currentProfile={currentProfile}
        />
      </Accordion>

      <FormField
        control={form.control}
        name="selectedSkin"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Selected Skin</FormLabel>
            <Select
              onValueChange={(value) =>
                handleSettingCommit("selectedSkin", value)
              }
              value={field.value}
            >
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
        name="hideOnDisabled"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg bg-white/10 p-4">
            <div className="space-y-0.5">
              <FormLabel className="text-base">Hide on Disabled</FormLabel>
              <FormDescription>
                Hide the visualizer when disabled.
              </FormDescription>
            </div>
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={(value) =>
                  handleSettingCommit("hideOnDisabled", value)
                }
              />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="pauseEnabled"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg bg-white/10 p-4">
            <div className="space-y-0.5">
              <FormLabel className="text-base">Enable Paused Overlay</FormLabel>
              <FormDescription>
                Show an overlay when the visualizer is paused.
              </FormDescription>
            </div>
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={(value) =>
                  handleSettingCommit("pauseEnabled", value)
                }
              />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="canvasEnabled"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg bg-white/10 p-4">
            <div className="space-y-0.5">
              <FormLabel className="text-base">Enable Canvas</FormLabel>
              <FormDescription>
                Enable canvas for the visualizer.
              </FormDescription>
            </div>
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={(value) => {
                  handleSettingCommit("canvasEnabled", value);
                  setCanvasAvailable(value);
                }}
              />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="backgroundCanvas"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg bg-white/10 p-4">
            <div className="space-y-0.5">
              <FormLabel className="text-base">Background Canvas</FormLabel>
              <FormDescription>
                Use a canvas for the background effect.
              </FormDescription>
            </div>
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={(value) =>
                  handleSettingCommit("backgroundCanvas", value)
                }
              />
            </FormControl>
          </FormItem>
        )}
      />

      {renderSlider(
        "backgroundCanvasOpacity",
        "Background Canvas Opacity",
        0,
        1,
        0.01
      )}

      <FormField
        control={form.control}
        name="micEnabled"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg bg-white/10 p-4">
            <div className="space-y-0.5">
              <FormLabel className="text-base">Enable Microphone</FormLabel>
              <FormDescription>
                Use microphone input for the visualizer.
              </FormDescription>
            </div>
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={(value) =>
                  handleSettingCommit("micEnabled", value)
                }
              />
            </FormControl>
          </FormItem>
        )}
      />
    </>
  );
};

export default VisualizerSettingsFormFields;
