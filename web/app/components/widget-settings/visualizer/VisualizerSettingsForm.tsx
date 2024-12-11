import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useVisualizerProfiles } from "@/hooks/useVisualizerProfiles";
import { useCurrentVisualizerProfile } from "@/hooks/useCurrentVisualizerProfile";
import {
  visualizerProfileSchema,
  type VisualizerProfile,
} from "@/schemas/visualizer";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { ProfileSelect } from "./ProfileSelect";
import { VisualSettings } from "./sections/VisualSettings";
import { FunctionalSettings } from "./sections/FunctionalSettings";

export function VisualizerSettingsForm() {
  const { profiles, createProfile, updateProfile, deleteProfile } =
    useVisualizerProfiles();
  const { profile, setProfile } = useCurrentVisualizerProfile();

  const form = useForm<VisualizerProfile>({
    resolver: zodResolver(visualizerProfileSchema),
    defaultValues: profile,
  });

  const onSubmit = async (data: VisualizerProfile) => {
    if (data.id) {
      await updateProfile.mutateAsync(data);
    } else {
      await createProfile.mutateAsync(data);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex items-center justify-between">
          <ProfileSelect
            profiles={profiles.data}
            value={profile.id}
            onChange={(id) => {
              const newProfile = profiles.data?.find((p) => p.id === id);
              if (newProfile) setProfile(newProfile);
            }}
          />
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                form.reset();
                setProfile({ ...profile, id: undefined, name: "New Profile" });
              }}
            >
              New Profile
            </Button>
            {profile.id && !profile.isDefault && (
              <Button
                variant="destructive"
                onClick={() => deleteProfile.mutate(profile.id!)}
              >
                Delete
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-8">
          <VisualSettings control={form.control} />
          <FunctionalSettings control={form.control} />
        </div>

        <Button type="submit" className="w-full">
          Save Changes
        </Button>
      </form>
    </Form>
  );
}
