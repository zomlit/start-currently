import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { QueryClient } from "@tanstack/react-query";
import { routeTree } from "./routeTree.gen";
import { routerWithQueryClient } from "@tanstack/react-router-with-query";

interface Context {
  queryClient: QueryClient;
}

export function createRouter() {
  const queryClient = new QueryClient();

  const baseRouter = createTanStackRouter({
    routeTree,
    context: { queryClient } satisfies Context,
    defaultPreload: "intent",
  });

  return routerWithQueryClient(baseRouter as any, queryClient);
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof createRouter>;
  }
}
