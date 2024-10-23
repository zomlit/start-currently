// LAST EDITED: 2024-10-23 WE HAVE GOTTEN THIS FILE MIXED WITH THE COMPONENTS VERSION? THIS ONE HAS SERVER FUNCTIONS AND PROPERLY USES getToken

import { useQuery } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/start";
import { getAuth } from "@clerk/tanstack-start/server";
import { api } from "@/lib/api";

export const getProfiles = createServerFn("GET", async (_, ctx) => {
  try {
    const { userId, getToken } = await getAuth(ctx.request);

    if (!userId) {
      return { error: "User not authenticated", profiles: [] };
    }

    const token = await getToken({ template: "lstio" });
    if (!token) {
      return { error: "No token found", profiles: [] };
    }

    const response = await api.profiles.getAll("visualizer", token);
    if (!response.success) {
      return {
        error: response.error || "Failed to fetch profiles",
        profiles: [],
      };
    }
    return { profiles: response.data || [] };
  } catch (error) {
    console.error("Error fetching profiles:", error);
    return {
      error:
        error instanceof Error ? error.message : "Failed to fetch profiles",
      profiles: [],
    };
  }
});

export const getProfile = createServerFn(
  "GET",
  async (payload: { sectionId: string; profileId: string | null }, ctx) => {
    const { userId, getToken } = await getAuth(ctx.request);

    if (!userId) {
      return { error: "User not authenticated", profile: null };
    }

    const token = await getToken({ template: "lstio" });
    if (!token) {
      throw new Error("No token found");
    }

    return api.profiles.get(payload.sectionId, payload.profileId, token);
  }
);

export function useProfiles(sectionId: string) {
  return useQuery({
    queryKey: ["profiles", sectionId],
    queryFn: async () => {
      const result = await getProfiles();
      if (result.error) {
        console.error("Error fetching profiles:", result.error);
        throw new Error(result.error);
      }
      return result.profiles;
    },
    retry: (failureCount, error) => {
      if (
        error instanceof Error &&
        error.message.includes("Unauthorized access")
      ) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

export function useProfile(sectionId: string, profileId: string | null) {
  return useQuery({
    queryKey: ["profile", sectionId, profileId],
    queryFn: () => getProfile({ sectionId, profileId }),
    enabled: !!profileId,
  });
}
