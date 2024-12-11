import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { BaseWidgetProfile } from "@/shared/schemas/widget";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { ProfileSelect } from "./ProfileSelect";

interface WidgetSettingsFormProps<T extends BaseWidgetProfile> {
  profile: T;
  schema: any;
  useProfiles: () => {
    profiles: any;
    createProfile: any;
    updateProfile: any;
    deleteProfile: any;
  };
  setProfile: (profile: T) => void;
  children: React.ReactNode;
}

export function WidgetSettingsForm<T extends BaseWidgetProfile>({
  profile,
  schema,
  useProfiles,
  setProfile,
  children,
}: WidgetSettingsFormProps<T>) {
  const { profiles, createProfile, updateProfile, deleteProfile } =
    useProfiles();

  const form = useForm<T>({
    resolver: zodResolver(schema),
    defaultValues: profile,
  });

  const onSubmit = async (data: T) => {
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

        {children}

        <Button type="submit" className="w-full">
          Save Changes
        </Button>
      </form>
    </Form>
  );
}
