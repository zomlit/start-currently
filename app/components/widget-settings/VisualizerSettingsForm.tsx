import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form } from "@/components/ui/form";
import { useWidgetProfiles } from "@/hooks/useWidgetProfiles";
import VisualizerSettingsFormFields from "./VisualizerSettingsFormFields";

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

export type VisualizerSettingsFormProps = z.infer<
  typeof visualizerSettingsSchema
>;

interface Props {
  settings: Partial<VisualizerSettingsFormProps>;
  onUpdate: (updates: Partial<VisualizerSettingsFormProps>) => void;
}

const VisualizerSettingsForm: React.FC<Props> = ({ settings, onUpdate }) => {
  const [canvasAvailable, setCanvasAvailable] = useState(
    settings.canvasEnabled || false
  );
  const form = useForm<VisualizerSettingsFormProps>({
    resolver: zodResolver(visualizerSettingsSchema),
    defaultValues: {
      selectedSkin: "rounded",
      ...settings,
    },
  });

  const { currentProfile, updateProfile } = useWidgetProfiles("visualizer");

  const handleSettingChange = (
    field: keyof VisualizerSettingsFormProps,
    value: any
  ) => {
    form.setValue(field, value);
    onUpdate({ [field]: value });
  };

  const handleSettingCommit = (
    field: keyof VisualizerSettingsFormProps,
    value: any
  ) => {
    form.setValue(field, value);
    onUpdate({ [field]: value });
    saveSettingToServer(field, value);
  };

  const saveSettingToServer = (
    field: keyof VisualizerSettingsFormProps,
    value: any
  ) => {
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

  return (
    <Form {...form}>
      <form className="mt-4 space-y-4">
        <VisualizerSettingsFormFields
          form={form}
          handleSettingChange={handleSettingChange}
          handleSettingCommit={handleSettingCommit}
          currentProfile={currentProfile}
          setCanvasAvailable={setCanvasAvailable}
        />
      </form>
    </Form>
  );
};

export default VisualizerSettingsForm;
