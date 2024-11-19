import axios, {
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";
import { createClient } from "@supabase/supabase-js";

const api = axios.create({
  baseURL: import.meta.env.VITE_ELYSIA_API_URL || "http://localhost:9001",
});

// Simple request interceptor to add authorization header
api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  // The token will be fetched fresh when needed by the components
  // using useAuth().getToken()
  return config;
});

// Simple error handler
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Supabase client setup
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export const apiMethods = {
  profiles: {
    getAll: async (sectionId: string, token: string) => {
      try {
        const response = await api.get(`/profiles/${sectionId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
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
        const requestData = {
          name: settings.name,
          section_id: sectionId,
          user_id: userId,
          is_default: true,
          settings: {
            specificSettings: settings.specificSettings,
            commonSettings: settings.commonSettings || {},
          },
        };

        console.log(
          "Creating profile with data:",
          JSON.stringify(requestData, null, 2)
        );

        const response = await api.post(
          `/profiles/${sectionId}/create-default`,
          requestData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        return response.data;
      } catch (error: any) {
        console.error("Profile creation error:", {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        });
        throw error;
      }
    },
  },
  gamepad: {
    createDefault: async (userId: string, token: string) => {
      try {
        const { data, error } = await supabase
          .from("GamepadWidget")
          .insert([
            {
              user_id: userId,
              gamepad_settings: {
                selectedSkin: "ds4",
                showButtonPresses: true,
                showAnalogSticks: true,
                showTriggers: true,
                buttonHighlightColor: "#ffffff",
                buttonPressColor: "#00ff00",
                analogStickColor: "#ff0000",
                triggerColor: "#0000ff",
                backgroundColor: "rgba(0, 0, 0, 0)",
                opacity: 1,
                scale: 1,
                deadzone: 0.1,
                touchpadEnabled: true,
                rumbleEnabled: true,
                debugMode: true,
              },
              style: "default",
              layout: {},
              showPressedButtons: true,
            },
          ])
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (error) {
        console.error("Error creating default gamepad settings:", error);
        throw error;
      }
    },

    get: async (userId: string) => {
      try {
        const { data, error } = await supabase
          .from("GamepadWidget")
          .select("gamepad_settings")
          .eq("user_id", userId)
          .single();

        if (error) {
          if (error.code === "PGRST116") {
            // No settings found, create default
            return apiMethods.gamepad.createDefault(userId);
          }
          throw error;
        }

        return data;
      } catch (error) {
        console.error("Error getting gamepad settings:", error);
        throw error;
      }
    },
  },
  gamepad: {
    createDefault: async (userId: string, token: string) => {
      try {
        const { data, error } = await supabase
          .from("GamepadWidget")
          .insert([
            {
              user_id: userId,
              gamepad_settings: {
                selectedSkin: "ds4",
                showButtonPresses: true,
                showAnalogSticks: true,
                showTriggers: true,
                buttonHighlightColor: "#ffffff",
                buttonPressColor: "#00ff00",
                analogStickColor: "#ff0000",
                triggerColor: "#0000ff",
                backgroundColor: "rgba(0, 0, 0, 0)",
                opacity: 1,
                scale: 1,
                deadzone: 0.1,
                touchpadEnabled: true,
                rumbleEnabled: true,
                debugMode: true,
              },
              style: "default",
              layout: {},
              showPressedButtons: true,
            },
          ])
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (error) {
        console.error("Error creating default gamepad settings:", error);
        throw error;
      }
    },

    get: async (userId: string) => {
      try {
        const { data, error } = await supabase
          .from("GamepadWidget")
          .select("gamepad_settings")
          .eq("user_id", userId)
          .single();

        if (error) {
          if (error.code === "PGRST116") {
            // No settings found, create default
            return apiMethods.gamepad.createDefault(userId);
          }
          throw error;
        }

        return data;
      } catch (error) {
        console.error("Error getting gamepad settings:", error);
        throw error;
      }
    },
  },
};

export default apiMethods;
