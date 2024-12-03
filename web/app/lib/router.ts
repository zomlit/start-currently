import { QueryClient } from "@tanstack/react-query";
import {
  Router,
  createRouter as createTanStackRouter,
} from "@tanstack/react-router";
import { routerWithQueryClient } from "@tanstack/react-router-with-query";
import { routeTree } from "../routeTree.gen";

export interface RouterContext {
  queryClient: QueryClient;
  user?: any;
}

export function createRouter() {
  const queryClient = new QueryClient();

  const baseRouter = createTanStackRouter({
    routeTree,
    context: { queryClient } satisfies RouterContext,
    defaultPreload: "intent",
  });

  return routerWithQueryClient(baseRouter as any, queryClient);
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof createRouter>;
  }
}
