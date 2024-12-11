import type { Elysia } from "elysia";
import type { VisualizerProfile } from "./visualizer";

export interface ApiContext {
  user: {
    id: string;
  };
}

export interface ApiResponse<T> {
  data: T;
  error?: string;
}

export type VisualizerRoutes = {
  "/api/visualizer/profiles": {
    get: {
      response: VisualizerProfile[];
    };
    post: {
      body: VisualizerProfile;
      response: VisualizerProfile;
    };
  };
  "/api/visualizer/profiles/:id": {
    put: {
      params: { id: string };
      body: VisualizerProfile;
      response: VisualizerProfile;
    };
    delete: {
      params: { id: string };
      response: void;
    };
  };
};

export type App = Elysia & {
  routes: VisualizerRoutes;
};
