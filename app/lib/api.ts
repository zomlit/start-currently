import axios from "redaxios";

const client = axios.create({
  baseURL: import.meta.env.VITE_ELYSIA_API_URL || "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

const handleApiError = (error: any) => {
  console.error("API Error:", error);
  if (error.response) {
    console.error("Response data:", error.response.data);
    console.error("Response status:", error.response.status);
    console.error("Response headers:", error.response.headers);
  } else if (error.request) {
    console.error("No response received:", error.request);
  } else {
    console.error("Error:", error.message);
  }
  throw error;
};

export const api = {
  profiles: {
    getAll: async (sectionId: string, token: string) => {
      console.log("API: Fetching profiles for section:", sectionId);
      try {
        const response = await client.get(`/profiles/${sectionId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log("API: Received profiles response:", response);
        return response.data;
      } catch (error) {
        return handleApiError(error);
      }
    },
    get: async (sectionId: string, profileId: string | null, token: string) => {
      return client
        .get(`/profiles/${sectionId}/${profileId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((res) => res.data)
        .catch(handleApiError);
    },
    update: async (profile: any, token: string) => {
      if (!profile.id) {
        console.error("Profile ID is undefined");
        return Promise.reject(new Error("Profile ID is required for update"));
      }
      return client
        .put(`/profiles/${profile.id}`, profile, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((res) => res.data)
        .catch(handleApiError);
    },
    copy: async (profile: any, token: string) => {
      return client
        .post(`/profiles/copy`, profile, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((res) => res.data)
        .catch(handleApiError);
    },
    setDefault: async (profileId: string, token: string) => {
      return client
        .put(`/profiles/${profileId}/set-default`, null, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((res) => res.data)
        .catch(handleApiError);
    },
    delete: async (profileId: string, token: string) => {
      return client
        .delete(`/profiles/${profileId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((res) => res.data)
        .catch(handleApiError);
    },
    createDefault: async (
      sectionId: string,
      userId: string,
      settings: object | undefined,
      token: string
    ) => {
      return client
        .post(
          `/profiles/${sectionId}/create-default`,
          { settings: settings },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        .then((res) => res.data)
        .catch(handleApiError);
    },
  },
};
