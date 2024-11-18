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
        const requestData = {
          name: settings.name || "Default Profile",
          settings: {
            specificSettings: {
              selectedSkin:
                settings.specificSettings?.selectedSkin || "rounded",
              hideOnDisabled:
                settings.specificSettings?.hideOnDisabled || false,
              pauseEnabled: settings.specificSettings?.pauseEnabled || false,
              canvasEnabled: settings.specificSettings?.canvasEnabled || false,
              backgroundCanvas:
                settings.specificSettings?.backgroundCanvas || false,
              backgroundCanvasOpacity:
                settings.specificSettings?.backgroundCanvasOpacity || 0.5,
              micEnabled: settings.specificSettings?.micEnabled || false,
              progressBarForegroundColor:
                settings.specificSettings?.progressBarForegroundColor ||
                "#ffffff",
              progressBarBackgroundColor:
                settings.specificSettings?.progressBarBackgroundColor ||
                "#000000",
              mode: settings.specificSettings?.mode || 10,
              gradient: settings.specificSettings?.gradient || "rainbow",
              fillAlpha: settings.specificSettings?.fillAlpha || 0.5,
              lineWidth: settings.specificSettings?.lineWidth || 1,
              channelLayout:
                settings.specificSettings?.channelLayout || "dual-combined",
              frequencyScale:
                settings.specificSettings?.frequencyScale || "bark",
              linearAmplitude:
                settings.specificSettings?.linearAmplitude || true,
              linearBoost: settings.specificSettings?.linearBoost || 1.8,
              showPeaks: settings.specificSettings?.showPeaks || false,
              outlineBars: settings.specificSettings?.outlineBars || true,
              weightingFilter:
                settings.specificSettings?.weightingFilter || "D",
              barSpace: settings.specificSettings?.barSpace || 0.1,
              ledBars: settings.specificSettings?.ledBars || false,
              lumiBars: settings.specificSettings?.lumiBars || false,
              reflexRatio: settings.specificSettings?.reflexRatio || 0,
              reflexAlpha: settings.specificSettings?.reflexAlpha || 0.15,
              reflexBright: settings.specificSettings?.reflexBright || 1,
              mirror: settings.specificSettings?.mirror || 0,
              splitGradient: settings.specificSettings?.splitGradient || false,
              roundBars: settings.specificSettings?.roundBars || false,
            },
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
};

export default apiMethods;
