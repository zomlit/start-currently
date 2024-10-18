import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useWidgetProfiles } from "@/hooks/useWidgetProfiles";
import { WidgetType, VisualizerSettings } from "@/types";
import { Accordion } from "@/components/ui/accordion";
import { VisualizerColorSection } from "@/components/settings-sections/VisualizerColorSection";

const visualizerSettingsSchema = z.object({
  selectedSkin: z.enum(["default", "minimal", "rounded"]).default("rounded"),
  hideOnDisabled: z.boolean().default(false),
  pauseEnabled: z.boolean().default(false),
  canvasEnabled: z.boolean().default(false),
  backgroundCanvas: z.boolean().default(false),
  backgroundCanvasOpacity: z.number().min(0).max(1).default(0.5),
  micEnabled: z.boolean().default(false),
  progressBarForegroundColor: z.string().default("#ffffff"),
  progressBarBackgroundColor: z.string().default("#000000"),
});

export type VisualizerSettingsFormProps = z.infer<typeof visualizerSettingsSchema>;

interface Props {
  settings: Partial<VisualizerSettingsFormProps>;
  onUpdate: (updates: Partial<VisualizerSettingsFormProps>) => void;
}

const VisualizerSettingsForm: React.FC<Props> = ({ settings, onUpdate }) => {
  const form = useForm<VisualizerSettingsFormProps>({
    resolver: zodResolver(visualizerSettingsSchema),
    defaultValues: {
      selectedSkin: "rounded",
      ...settings,
    },
  });

  const { currentProfile, updateProfile } = useWidgetProfiles("visualizer");

  useEffect(() => {
    form.reset(settings);
  }, [settings, form]);

  const handleSettingChange = (field: keyof VisualizerSettingsFormProps, value: any) => {
    form.setValue(field, value);
    onUpdate({ [field]: value }); // This updates the local state and preview
  };

  const handleSettingCommit = (field: keyof VisualizerSettingsFormProps, value: any) => {
    form.setValue(field, value);
    onUpdate({ [field]: value });
    saveSettingToServer(field, value);
  };

  const saveSettingToServer = (field: keyof VisualizerSettingsFormProps, value: any) => {
    if (currentProfile && currentProfile.id) {
      updateProfile({
        profileId: currentProfile.id,
        updatedFields: {
          specificSettings: {
            ...currentProfile.specificSettings,
            [field]: value,
          },
        },
      }).catch((error) => {
        console.error(`Failed to save ${field} change:`, error);
      });
    }
  };

  const renderSlider = (
    fieldName: keyof VisualizerSettingsFormProps,
    label: string,
    min: number,
    max: number,
    step: number,
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
              handleSettingChange(fieldName, newValue); // This updates on each tick
            }}
            onValueCommit={(value) => {
              const newValue = value[0];
              handleSettingCommit(fieldName, newValue); // This saves to server on commit
            }}
          />
        </FormItem>
      )}
    />
  );

  return (
    <Form {...form}>
      <form className="mt-4 space-y-4">
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
                onValueChange={(value) => handleSettingCommit("selectedSkin", value)}
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
                <FormDescription>Hide the visualizer when disabled.</FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={(value) => handleSettingCommit("hideOnDisabled", value)}
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
                <FormDescription>Show an overlay when the visualizer is paused.</FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={(value) => handleSettingCommit("pauseEnabled", value)}
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
                <FormDescription>Enable canvas for the visualizer.</FormDescription>
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
                <FormDescription>Use a canvas for the background effect.</FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={(value) => handleSettingCommit("backgroundCanvas", value)}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {renderSlider("backgroundCanvasOpacity", "Background Canvas Opacity", 0, 1, 0.01)}

        <FormField
          control={form.control}
          name="micEnabled"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg bg-white/10 p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Enable Microphone</FormLabel>
                <FormDescription>Use microphone input for the visualizer.</FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={(value) => handleSettingCommit("micEnabled", value)}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
};

export default VisualizerSettingsForm;
