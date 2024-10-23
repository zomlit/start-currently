import React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useProfile } from "@/components/sections/useProfile";
import { Slider, ColorPicker, Switch } from "@/components/form/index";

const profileSchema = z.object({
  common: z.object({
    backgroundColor: z.string(),
    padding: z.number().min(0).max(50),
    showBorders: z.boolean(),
  }),
  sectionSpecific: z.object({
    fontSize: z.number().min(10).max(50),
  }),
});

export const Route = createFileRoute("/_app/sections/")({
  component: SectionsDashboard,
});

function SectionsDashboard() {
  const { profile, isLoading, mutation } = useProfile("dashboard");

  const methods = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: profile?.settings || {
      common: { backgroundColor: "#000000", padding: 10, showBorders: false },
      sectionSpecific: { fontSize: 16 },
    },
  });

  const { watch, handleSubmit } = methods;

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const onSubmit = (data: z.infer<typeof profileSchema>) => {
    mutation.mutate(data);
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <h2 className="text-xl font-bold">Common Settings</h2>
        <ColorPicker name="common.backgroundColor" label="Background Color" />
        <Slider name="common.padding" label="Padding" min={0} max={50} />
        <Switch name="common.showBorders" label="Show Borders" />

        <h2 className="text-xl font-bold">Section Specific Settings</h2>
        <Slider
          name="sectionSpecific.fontSize"
          label="Font Size"
          min={10}
          max={50}
        />

        <button type="submit" className="btn btn-primary">
          Save Settings
        </button>
      </form>

      <div
        className="preview mt-8 p-4"
        style={{
          backgroundColor: watch("common.backgroundColor"),
          padding: `${watch("common.padding")}px`,
          border: watch("common.showBorders") ? "1px solid black" : "none",
          fontSize: `${watch("sectionSpecific.fontSize")}px`,
        }}
      >
        <h3 className="text-lg font-semibold">Preview</h3>
        <p>This is how your section will look with the current settings.</p>
      </div>
    </FormProvider>
  );
}
