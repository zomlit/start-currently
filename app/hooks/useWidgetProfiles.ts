import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchProfiles,
  createProfile,
  updateProfile,
  deleteProfile,
} from "@/api/widgetProfiles";
import { WidgetProfile } from "@/types/widgetProfiles";
import { toast } from "@/utils/toast";
import { v4 as uuidv4 } from "uuid";

export function useWidgetProfiles(userId: string) {
  const queryClient = useQueryClient();
  const queryKey = ["widgetProfiles", userId];

  const profilesQuery = useQuery({
    queryKey,
    queryFn: () => fetchProfiles(userId),
    onError: (error: unknown) => {
      console.error("Error fetching profiles:", error);
      toast.error({
        title: "Failed to load profiles",
        description:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    },
  });

  const createProfileMutation = useMutation({
    mutationFn: createProfile,
    onMutate: async (newProfile) => {
      await queryClient.cancelQueries({ queryKey });
      const previousProfiles =
        queryClient.getQueryData<WidgetProfile[]>(queryKey);
      const tempId = uuidv4();
      queryClient.setQueryData<WidgetProfile[]>(queryKey, (old) => [
        ...(old || []),
        { ...newProfile, id: tempId } as WidgetProfile,
      ]);
      return { previousProfiles, tempId };
    },
    onError: (err, newProfile, context) => {
      console.error("Error creating profile:", err);
      queryClient.setQueryData(queryKey, context?.previousProfiles);
      toast.error({
        title: "Failed to create profile",
        description:
          err instanceof Error ? err.message : "Unknown error occurred",
      });
    },
    onSuccess: (createdProfile, _, context) => {
      queryClient.setQueryData<WidgetProfile[]>(queryKey, (old) =>
        old?.map((profile) =>
          profile.id === context?.tempId ? createdProfile : profile
        )
      );
      toast.success({
        title: "Profile created successfully",
        description: `Profile "${createdProfile.name}" has been created.`,
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<WidgetProfile>;
    }) => updateProfile(id, updates),
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey });
      const previousProfiles =
        queryClient.getQueryData<WidgetProfile[]>(queryKey);
      queryClient.setQueryData<WidgetProfile[]>(
        queryKey,
        (old) =>
          old?.map((profile) =>
            profile.id === id ? { ...profile, ...updates } : profile
          ) || []
      );
      return { previousProfiles };
    },
    onError: (err, { id }, context) => {
      console.error("Error updating profile:", err);
      queryClient.setQueryData(queryKey, context?.previousProfiles);
      toast.error({
        title: "Failed to update profile",
        description:
          err instanceof Error ? err.message : "An unknown error occurred",
      });
    },
    onSuccess: (updatedProfile) => {
      toast.success({
        title: "Profile updated successfully",
        description: `Profile "${updatedProfile.name}" has been updated.`,
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const deleteProfileMutation = useMutation({
    mutationFn: deleteProfile,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey });
      const previousProfiles =
        queryClient.getQueryData<WidgetProfile[]>(queryKey);
      queryClient.setQueryData<WidgetProfile[]>(
        queryKey,
        (old) => old?.filter((profile) => profile.id !== id) || []
      );
      return { previousProfiles };
    },
    onError: (err, id, context) => {
      console.error("Error deleting profile:", err);
      queryClient.setQueryData(queryKey, context?.previousProfiles);
      toast.error({ title: "Failed to delete profile" });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  return {
    profiles: profilesQuery.data || [],
    isLoading: profilesQuery.isLoading,
    isError: profilesQuery.isError,
    error: profilesQuery.error,
    createProfile: createProfileMutation.mutate,
    updateProfile: (id: string, updates: Partial<WidgetProfile>) => {
      // Implement update logic
    },
    deleteProfile: (id: string) => {
      // Implement delete logic
    },
  };
}
