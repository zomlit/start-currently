import axios, {
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_ELYSIA_API_URL || "http://localhost:9001",
});

api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  // Remove the useAuth hook from here, as it's not allowed in a non-component context
  // We'll pass the token from the component instead
  return config;
});

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const apiMethods = {
  profiles: {
    getAll: async (sectionId: string, token: string) => {
      console.log("API: Fetching profiles for section:", sectionId);
      try {
        const response = await api.get(`/profiles/${sectionId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("API: Received profiles response:", response.data);
        return response.data;
      } catch (error) {
        console.error("API Error:", error);
        throw error;
      }
    },
    get: async (sectionId: string, profileId: string | null, token: string) => {
      const response = await api.get(`/profiles/${sectionId}/${profileId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
    update: async (profileId: string, settings: any, token: string) => {
      const response = await api.put(
        `/profiles/${profileId}`,
        { settings },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    },
    copy: async (profile: any, token: string) => {
      const response = await api.post(`/profiles/copy`, profile, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
    setDefault: async (profileId: string, token: string) => {
      const response = await api.put(
        `/profiles/${profileId}/set-default`,
        null,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    },
    delete: async (profileId: string, token: string) => {
      const response = await api.delete(`/profiles/${profileId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
    createDefault: async (
      sectionId: string,
      userId: string,
      settings: any,
      token: string
    ) => {
      try {
        const requestData = { settings };
        console.log("Sending request with data:", requestData, null, 2);
        const response = await axios.post(
          `${import.meta.env.VITE_ELYSIA_API_URL}/profiles/${sectionId}/create-default`,
          requestData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        console.log("Create profile response:", response);
        return response.data;
      } catch (error) {
        console.error("Profile creation error:", error);
        throw error;
      }
    },
  },
};

export default apiMethods;
