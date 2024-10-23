import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useUser } from "@clerk/tanstack-start";
import { api } from "@/lib/api";

type Profile = {
  id: string;
  section_id: string;
  user_id: string;
  settings: {
    name: string;
    common: {
      backgroundColor: string;
      padding: number;
      showBorders: boolean;
    };
    sectionSpecific: {
      fontSize: number;
      chartType: "bar" | "line" | "pie";
    };
  };
};

export const useProfile = (sectionId: string) => {
  const queryClient = useQueryClient();
  const { user, isLoaded, getToken } = useUser();

  const fetchProfile = async (): Promise<Profile | null> => {
    if (!user) return null;
    try {
      const token = await getToken();
      const response = await api.profiles.getAll(sectionId, token);
      if (response.success && response.data.length > 0) {
        return response.data[0];
      }
      return null;
    } catch (error) {
      console.error("Error fetching profile:", error);
      return null;
    }
  };

  const {
    data: profile,
    isLoading,
    error,
  } = useQuery<Profile | null, Error>({
    queryKey: ["profile", sectionId, user?.id],
    queryFn: fetchProfile,
    enabled: !!user && isLoaded,
    retry: (failureCount, error) => {
      console.log("Retry attempt:", failureCount, "Error:", error);
      return failureCount < 3;
    },
  });

  const mutation = useMutation<Profile, Error, Partial<Profile>>({
    mutationFn: async (newProfile) => {
      if (!user) throw new Error("No user logged in");
      const token = await getToken();
      const response = await api.profiles.update(newProfile, token);
      if (response.success) {
        return response.data;
      }
      throw new Error("Failed to update profile");
    },
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(
        ["profile", sectionId, user?.id],
        updatedProfile
      );
    },
  });

  const setDefaultMutation = useMutation<
    { success: boolean; message: string },
    Error,
    string
  >({
    mutationFn: async (profileId: string) => {
      if (!user) throw new Error("No user logged in");
      const token = await getToken();
      return api.profiles.setDefault(profileId, token);
    },
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries(["profiles", sectionId]);
      } else {
        console.error("Failed to set profile as default:", data.message);
      }
    },
    onError: (error) => {
      console.error("Error setting profile as default:", error);
    },
  });

  return {
    profile,
    isLoading,
    error,
    updateProfile: mutation.mutate,
    isUpdating: mutation.isPending,
    updateError: mutation.error,
    setDefaultProfile: setDefaultMutation.mutate,
    isSettingDefault: setDefaultMutation.isPending,
    setDefaultError: setDefaultMutation.error,
  };
};

export const useProfiles = (sectionId: string) => {
  const { user, isLoaded, getToken } = useUser();

  const fetchProfiles = async (): Promise<Profile[]> => {
    if (!user) return [];
    try {
      const token = await getToken();
      const response = await api.profiles.getAll(sectionId, token);
      if (response.success) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error("Error fetching profiles:", error);
      return [];
    }
  };

  return useQuery<Profile[], Error>({
    queryKey: ["profiles", sectionId, user?.id],
    queryFn: fetchProfiles,
    enabled: !!user && isLoaded,
    retry: (failureCount, error) => {
      console.log("Retry attempt for profiles:", failureCount, "Error:", error);
      return failureCount < 3;
    },
  });
};
