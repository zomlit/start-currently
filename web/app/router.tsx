import { QueryClient } from "@tanstack/react-query";
import { createRouter as createBaseRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { routerWithQueryClient } from "@tanstack/react-router-with-query";

type Context = {
  queryClient: QueryClient;
};

export function createRouter() {
  const queryClient = new QueryClient();

  const baseRouter = createBaseRouter({
    routeTree,
    context: {
      queryClient,
    } satisfies Context,
    defaultPreload: "intent",
  });

  return routerWithQueryClient(baseRouter, queryClient);
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof createRouter>;
  }
}
