import { ProfileSelect } from "./ProfileSelect";
import { ProfileActions } from "./ProfileActions";
import { VisualizerSettingsForm } from "../VisualizerSettingsForm";
import type { VisualizerProfile } from "@/types/visualizer";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/tanstack-start";
import { apiMethods } from "@/lib/api";

interface VisualizerSettingsProps {
  profile: VisualizerProfile;
  profiles: VisualizerProfile[];
  onOpenAddDialog: () => void;
}

export function VisualizerSettings({
  profile,
  profiles,
  onOpenAddDialog,
}: VisualizerSettingsProps) {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async (updates: Partial<VisualizerProfile>) => {
      const token = await getToken({ template: "lstio" });
      return apiMethods.profiles.update(profile.id, updates, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profiles", "visualizer"] });
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <ProfileSelect profiles={profiles} />
        <ProfileActions
          profile={profile}
          profiles={profiles}
          onAddNew={onOpenAddDialog}
        />
      </div>
      {profile && (
        <VisualizerSettingsForm
          settings={profile.settings.specificSettings}
          onUpdate={(updates) => {
            updateMutation.mutate({
              ...profile,
              settings: {
                ...profile.settings,
                specificSettings: {
                  ...profile.settings.specificSettings,
                  ...updates,
                },
              },
            });
          }}
        />
      )}
    </div>
  );
}
