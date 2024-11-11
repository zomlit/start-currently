import { createRouter as createTanStackRouter } from '@tanstack/react-router'
import { routerWithQueryClient } from '@tanstack/react-router-with-query'
import { lazy } from 'react'
import type { QueryClient } from '@tanstack/react-query'
import type { useRouteContext } from '@tanstack/react-router'

import { createQueryClient } from '@/lib/query'
import { routeTree } from '@/route-tree.gen'
import type { FileRouteTypes } from '@/route-tree.gen'

export type InferRouteContext<Route extends FileRouteTypes['to']> =
  ReturnType<typeof useRouteContext<typeof routeTree, Route>>

export type RouterContext = {
  queryClient: QueryClient
}

export function createRouter() {
  const queryClient = createQueryClient()

  const routerContext: RouterContext = {
    queryClient,
  }

  const router = createTanStackRouter({
    routeTree,
    context: routerContext,
    search: {
      strict: true,
    },
    defaultPreload: 'intent',
  })

  return routerWithQueryClient(router, queryClient)
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof createRouter>
  }
}
