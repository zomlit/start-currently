import type { Elysia } from "elysia";
import type { visualizerProfileSchema } from "@/schemas/visualizer";

// Define route parameter types
export interface RouteParams {
  id: string;
}

// Define route context types
export interface RouteContext {
  user: {
    id: string;
  };
}

// Define route types
export type VisualizerRoutes = {
  "/api/visualizer/profiles": {
    get: {
      response: Array<typeof visualizerProfileSchema._type>;
    };
    post: {
      body: typeof visualizerProfileSchema._type;
      response: typeof visualizerProfileSchema._type;
    };
  };
  "/api/visualizer/profiles/:id": {
    put: {
      params: RouteParams;
      body: typeof visualizerProfileSchema._type;
      response: typeof visualizerProfileSchema._type;
    };
    delete: {
      params: RouteParams;
      response: void;
    };
  };
};

// Combine all route types
export type App = Elysia & {
  routes: VisualizerRoutes;
  context: RouteContext;
};
