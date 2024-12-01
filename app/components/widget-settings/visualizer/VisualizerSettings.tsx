import { Accordion } from "@/components/ui/accordion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ProfileSelect } from "./ProfileSelect";
import { ProfileActions } from "./ProfileActions";
import { AppearanceSection } from "./sections/AppearanceSection";
import { AudioSection } from "./sections/AudioSection";
import { VisualsSection } from "./sections/VisualsSection";
import { AdvancedSection } from "./sections/AdvancedSection";
import type { VisualizerProfile } from "@/types/visualizer";
import { Form } from "@/components/ui/form";
import { useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/tanstack-start";
import apiMethods from "@/lib/api";
import { toast } from "sonner";

interface VisualizerSettingsProps {
  profile: VisualizerProfile | undefined;
  profiles: VisualizerProfile[] | undefined;
  onOpenAddDialog: () => void;
}

const formSchema = z.object({
  name: z.string().min(1, "Profile name is required"),
  specificSettings: z.object({
    selectedSkin: z.enum(["default", "minimal", "rounded"]),
    hideOnDisabled: z.boolean(),
    pauseEnabled: z.boolean(),
    canvasEnabled: z.boolean(),
    backgroundCanvas: z.boolean(),
    backgroundCanvasOpacity: z.number().min(0).max(1),
    micEnabled: z.boolean(),
    progressBarForegroundColor: z.string(),
    progressBarBackgroundColor: z.string(),
    mode: z.number(),
    gradient: z.string(),
    fillAlpha: z.number().min(0).max(1),
    lineWidth: z.number().min(0).max(5),
    channelLayout: z.string(),
    frequencyScale: z.string(),
    linearAmplitude: z.boolean(),
    linearBoost: z.number(),
    showPeaks: z.boolean(),
    outlineBars: z.boolean(),
    weightingFilter: z.string(),
    barSpace: z.number(),
    ledBars: z.boolean(),
    lumiBars: z.boolean(),
    reflexRatio: z.number(),
    reflexAlpha: z.number(),
    reflexBright: z.number(),
    mirror: z.number(),
    splitGradient: z.boolean(),
    roundBars: z.boolean(),
  }),
});

export function VisualizerSettings({
  profile,
  profiles = [],
  onOpenAddDialog,
}: VisualizerSettingsProps) {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: profile?.settings.name || "",
      specificSettings: profile?.settings.specificSettings || {
        selectedSkin: "default",
        hideOnDisabled: false,
        pauseEnabled: false,
        canvasEnabled: true,
        backgroundCanvas: false,
        backgroundCanvasOpacity: 0.5,
        micEnabled: false,
        progressBarForegroundColor: "#ffffff",
        progressBarBackgroundColor: "#000000",
        mode: 10,
        gradient: "rainbow",
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
      },
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const token = await getToken();
      if (!token) throw new Error("No token available");

      if (profile?.id) {
        return apiMethods.profiles.update(profile.id, data, token);
      }
      return null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profiles", "visualizer"] });
      toast.success("Settings saved successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to save settings");
    },
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        name: profile.settings.name,
        specificSettings: profile.settings.specificSettings,
      });
    }
  }, [profile, form]);

  const onSubmit = (data: any) => {
    mutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <ProfileSelect profiles={Array.isArray(profiles) ? profiles : []} />
        <ProfileActions
          profile={profile as VisualizerProfile}
          profiles={Array.isArray(profiles) ? profiles : []}
          onAddNew={onOpenAddDialog}
        />
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Accordion type="single" collapsible className="w-full">
            <AppearanceSection form={form} />
            <AudioSection form={form} />
            <VisualsSection form={form} />
            <AdvancedSection form={form} />
          </Accordion>
        </form>
      </Form>
    </div>
  );
}
