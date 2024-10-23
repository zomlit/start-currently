import { useForm, FormProvider, useFormContext } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useProfile } from "./useProfile";
import { Slider, ColorPicker, Switch } from "./FormComponents";
import { z } from "zod";

const profileSchema = z.object({
  common: z.object({
    color: z.string(),
    padding: z.number().min(0).max(50),
    showBorders: z.boolean(),
  }),
  sectionSpecific: z.object({
    fontSize: z.number().min(10).max(50),
  }),
});

export const SectionPage = ({ sectionId }) => {
  const userId = "your-user-id"; // Replace with authenticated user ID
  const { profile, isLoading, mutation } = useProfile(sectionId, userId);

  const methods = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: profile?.settings || {
      common: { color: "#000000", padding: 10, showBorders: false },
      sectionSpecific: { fontSize: 16 },
    },
  });

  const { watch } = methods;

  if (isLoading) return <p>Loading...</p>;

  const onChange = (newValues) => {
    mutation.mutate(newValues);
  };

  const Slider = ({ name, label, min, max, sectionId }) => {
    const { register, watch } = useFormContext();
    return (
      <div className="form-group">
        <label>{label}</label>
        <input type="range" min={min} max={max} {...register(name)} />
        <span>{watch(name)}</span>
      </div>
    );
  };

  const ColorPicker = ({ name, label, sectionId }) => {
    const { register, watch } = useFormContext();
    return (
      <div className="form-group">
        <label>{label}</label>
        <input type="color" {...register(name)} />
        <span>{watch(name)}</span>
      </div>
    );
  };

  const Switch = ({ name, label, sectionId }) => {
    const { register, watch } = useFormContext();
    return (
      <div className="form-group">
        <label>{label}</label>
        <input type="checkbox" {...register(name)} />
      </div>
    );
  };

  return (
    <FormProvider {...methods}>
      <form onChange={() => onChange(watch())}>
        <h2>Common Settings</h2>
        <ColorPicker
          name="common.color"
          label="Background Color"
          sectionId={sectionId}
        />
        <Slider
          name="common.padding"
          label="Padding"
          min={0}
          max={50}
          sectionId={sectionId}
        />
        <Switch
          name="common.showBorders"
          label="Show Borders"
          sectionId={sectionId}
        />

        <h2>Section Specific Settings</h2>
        <Slider
          name="sectionSpecific.fontSize"
          label="Font Size"
          min={10}
          max={50}
          sectionId={sectionId}
        />
      </form>

      <div
        className="preview"
        style={{
          backgroundColor: watch("common.color"),
          padding: `${watch("common.padding")}px`,
          border: watch("common.showBorders") ? "1px solid black" : "none",
          fontSize: `${watch("sectionSpecific.fontSize")}px`,
        }}
      >
        Preview of Section
      </div>
    </FormProvider>
  );
};
