import { edenTreaty } from "@elysiajs/eden";
import type { App } from "@currently/backend/types/api";
import type { VisualizerProfile } from "@currently/backend/schemas/visualizer";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:9001";

export const eden = edenTreaty<App>(API_URL, {
  fetcher: async (url, init) => {
    const token = await window.Clerk?.session?.getToken();

    return fetch(url, {
      ...init,
      headers: {
        ...init?.headers,
        Authorization: token ? `Bearer ${token}` : "",
      },
    });
  },
});

// Type-safe API hooks
export const api = {
  visualizer: {
    profiles: {
      get: () => eden.api.visualizer.profiles.get(),
      create: (profile: Omit<VisualizerProfile, "id">) =>
        eden.api.visualizer.profiles.post({ body: profile }),
      update: (id: string, profile: VisualizerProfile) =>
        eden.api.visualizer.profiles.put({ params: { id }, body: profile }),
      delete: (id: string) =>
        eden.api.visualizer.profiles.delete({ params: { id } }),
    },
  },
};
