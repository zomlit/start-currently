import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useVisualizerStore } from "@/store/visualizerStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/tanstack-start";
import { MoreVertical } from "lucide-react";
import { toast } from "sonner";
import apiMethods from "@/lib/api";
import type { VisualizerProfile } from "@/types/visualizer";

interface ProfileActionsProps {
  profile: VisualizerProfile;
  profiles: VisualizerProfile[];
  onAddNew: () => void;
}

export function ProfileActions({
  profile,
  profiles,
  onAddNew,
}: ProfileActionsProps) {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const { setSelectedProfileId } = useVisualizerStore();

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const token = await getToken({ template: "lstio" });
      if (!token) throw new Error("No token available");
      return apiMethods.profiles.delete(profile.id, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profiles", "visualizer"] });
      const remainingProfiles = profiles.filter((p) => p.id !== profile.id);
      if (remainingProfiles.length > 0) {
        setSelectedProfileId(remainingProfiles[0].id);
      }
      toast.success("Profile deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete profile");
    },
  });

  const setDefaultMutation = useMutation({
    mutationFn: async () => {
      const token = await getToken({ template: "lstio" });
      if (!token) throw new Error("No token available");
      return apiMethods.profiles.setDefault(profile.id, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profiles", "visualizer"] });
      toast.success("Default profile updated");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update default profile");
    },
  });

  const copyMutation = useMutation({
    mutationFn: async () => {
      const token = await getToken({ template: "lstio" });
      if (!token) throw new Error("No token available");
      return apiMethods.profiles.copy(profile, token);
    },
    onSuccess: (newProfile: VisualizerProfile) => {
      queryClient.invalidateQueries({ queryKey: ["profiles", "visualizer"] });
      setSelectedProfileId(newProfile.id);
      toast.success("Profile copied successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to copy profile");
    },
  });

  if (!profile) {
    return (
      <Button variant="outline" onClick={onAddNew}>
        Create Profile
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" onClick={onAddNew}>
        New Profile
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => copyMutation.mutate()}>
            Duplicate
          </DropdownMenuItem>
          {!profile.settings.isDefault && (
            <DropdownMenuItem onClick={() => setDefaultMutation.mutate()}>
              Set as Default
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            onClick={() => deleteMutation.mutate()}
            className="text-red-600 dark:text-red-400"
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
