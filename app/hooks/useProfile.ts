import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/tanstack-start";
import { apiMethods } from "@/lib/api";
import type { VisualizerProfile } from "@/types/visualizer";

export function useProfiles(sectionId: string, options?: any) {
  const { getToken } = useAuth();

  return useQuery<VisualizerProfile[]>({
    queryKey: ["profiles", sectionId],
    queryFn: async () => {
      const token = await getToken({ template: "lstio" });
      if (!token) throw new Error("No token available");
      return apiMethods.profiles.getAll(sectionId, token);
    },
    ...options,
  });
}

export function useProfile(sectionId: string, profileId: string | null) {
  const { getToken } = useAuth();

  return useQuery<VisualizerProfile>({
    queryKey: ["profile", sectionId, profileId],
    queryFn: async () => {
      const token = await getToken({ template: "lstio" });
      if (!token) throw new Error("No token available");
      return apiMethods.profiles.get(sectionId, profileId, token);
    },
    enabled: !!profileId,
  });
}
