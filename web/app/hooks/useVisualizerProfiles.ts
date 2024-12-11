import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { VisualizerProfile } from "@currently/backend/types/visualizer";
import { api } from "@/lib/eden";

export function useVisualizerProfiles() {
  const queryClient = useQueryClient();
  const queryKey = ["visualizer-profiles"];

  return {
    profiles: useQuery({
      queryKey,
      queryFn: () => api.visualizer.profiles.get(),
    }),

    createProfile: useMutation({
      mutationFn: api.visualizer.profiles.create,
      onSuccess: () => queryClient.invalidateQueries({ queryKey }),
    }),

    updateProfile: useMutation({
      mutationFn: ({ id, ...profile }: VisualizerProfile) =>
        api.visualizer.profiles.update(id!, profile),
      onSuccess: () => queryClient.invalidateQueries({ queryKey }),
    }),

    deleteProfile: useMutation({
      mutationFn: api.visualizer.profiles.delete,
      onSuccess: () => queryClient.invalidateQueries({ queryKey }),
    }),
  };
}
