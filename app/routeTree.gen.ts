/* prettier-ignore-start */

/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file is auto-generated by TanStack Router

// Import Routes

import { Route as rootRoute } from './routes/__root'
import { Route as LayoutImport } from './routes/_layout'
import { Route as AppImport } from './routes/_app'
import { Route as AppIndexImport } from './routes/_app/index'
import { Route as LayoutLayout2Import } from './routes/_layout/_layout-2'
import { Route as AppTestImport } from './routes/_app/test'
import { Route as AppPostsImport } from './routes/_app/posts'
import { Route as AppAuthedImport } from './routes/_app/_authed'
import { Route as AppTeampickerIndexImport } from './routes/_app/teampicker/index'
import { Route as AppPricingIndexImport } from './routes/_app/pricing/index'
import { Route as AppPostsIndexImport } from './routes/_app/posts.index'
import { Route as LayoutLayout2LayoutBImport } from './routes/_layout/_layout-2/layout-b'
import { Route as LayoutLayout2LayoutAImport } from './routes/_layout/_layout-2/layout-a'
import { Route as AppTeampickerBracketIdImport } from './routes/_app/teampicker/$bracketId'
import { Route as AppSignUpSplatImport } from './routes/_app/sign-up.$'
import { Route as AppSignInSplatImport } from './routes/_app/sign-in.$'
import { Route as AppPostsPostIdImport } from './routes/_app/posts.$postId'
import { Route as AppDashboardWidgetsImport } from './routes/_app/dashboard.widgets'
import { Route as AppCheckoutSuccessImport } from './routes/_app/checkout.success'
import { Route as AppCheckoutProductIdImport } from './routes/_app/checkout.$productId'
import { Route as AppAuthedDashboardImport } from './routes/_app/_authed/dashboard'
import { Route as AppPostsPostIdDeepImport } from './routes/_app/posts_.$postId.deep'

// Create/Update Routes

const LayoutRoute = LayoutImport.update({
  id: '/_layout',
  getParentRoute: () => rootRoute,
} as any)

const AppRoute = AppImport.update({
  id: '/_app',
  getParentRoute: () => rootRoute,
} as any)

const AppIndexRoute = AppIndexImport.update({
  path: '/',
  getParentRoute: () => AppRoute,
} as any)

const LayoutLayout2Route = LayoutLayout2Import.update({
  id: '/_layout-2',
  getParentRoute: () => LayoutRoute,
} as any)

const AppTestRoute = AppTestImport.update({
  path: '/test',
  getParentRoute: () => AppRoute,
} as any)

const AppPostsRoute = AppPostsImport.update({
  path: '/posts',
  getParentRoute: () => AppRoute,
} as any)

const AppAuthedRoute = AppAuthedImport.update({
  id: '/_authed',
  getParentRoute: () => AppRoute,
} as any)

const AppTeampickerIndexRoute = AppTeampickerIndexImport.update({
  path: '/teampicker/',
  getParentRoute: () => AppRoute,
} as any)

const AppPricingIndexRoute = AppPricingIndexImport.update({
  path: '/pricing/',
  getParentRoute: () => AppRoute,
} as any)

const AppPostsIndexRoute = AppPostsIndexImport.update({
  path: '/',
  getParentRoute: () => AppPostsRoute,
} as any)

const LayoutLayout2LayoutBRoute = LayoutLayout2LayoutBImport.update({
  path: '/layout-b',
  getParentRoute: () => LayoutLayout2Route,
} as any)

const LayoutLayout2LayoutARoute = LayoutLayout2LayoutAImport.update({
  path: '/layout-a',
  getParentRoute: () => LayoutLayout2Route,
} as any)

const AppTeampickerBracketIdRoute = AppTeampickerBracketIdImport.update({
  path: '/teampicker/$bracketId',
  getParentRoute: () => AppRoute,
} as any)

const AppSignUpSplatRoute = AppSignUpSplatImport.update({
  path: '/sign-up/$',
  getParentRoute: () => AppRoute,
} as any)

const AppSignInSplatRoute = AppSignInSplatImport.update({
  path: '/sign-in/$',
  getParentRoute: () => AppRoute,
} as any)

const AppPostsPostIdRoute = AppPostsPostIdImport.update({
  path: '/$postId',
  getParentRoute: () => AppPostsRoute,
} as any)

const AppDashboardWidgetsRoute = AppDashboardWidgetsImport.update({
  path: '/dashboard/widgets',
  getParentRoute: () => AppRoute,
} as any)

const AppCheckoutSuccessRoute = AppCheckoutSuccessImport.update({
  path: '/checkout/success',
  getParentRoute: () => AppRoute,
} as any)

const AppCheckoutProductIdRoute = AppCheckoutProductIdImport.update({
  path: '/checkout/$productId',
  getParentRoute: () => AppRoute,
} as any)

const AppAuthedDashboardRoute = AppAuthedDashboardImport.update({
  path: '/dashboard',
  getParentRoute: () => AppAuthedRoute,
} as any)

const AppPostsPostIdDeepRoute = AppPostsPostIdDeepImport.update({
  path: '/posts/$postId/deep',
  getParentRoute: () => AppRoute,
} as any)

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/_app': {
      id: '/_app'
      path: ''
      fullPath: ''
      preLoaderRoute: typeof AppImport
      parentRoute: typeof rootRoute
    }
    '/_layout': {
      id: '/_layout'
      path: ''
      fullPath: ''
      preLoaderRoute: typeof LayoutImport
      parentRoute: typeof rootRoute
    }
    '/_app/_authed': {
      id: '/_app/_authed'
      path: ''
      fullPath: ''
      preLoaderRoute: typeof AppAuthedImport
      parentRoute: typeof AppImport
    }
    '/_app/posts': {
      id: '/_app/posts'
      path: '/posts'
      fullPath: '/posts'
      preLoaderRoute: typeof AppPostsImport
      parentRoute: typeof AppImport
    }
    '/_app/test': {
      id: '/_app/test'
      path: '/test'
      fullPath: '/test'
      preLoaderRoute: typeof AppTestImport
      parentRoute: typeof AppImport
    }
    '/_layout/_layout-2': {
      id: '/_layout/_layout-2'
      path: ''
      fullPath: ''
      preLoaderRoute: typeof LayoutLayout2Import
      parentRoute: typeof LayoutImport
    }
    '/_app/': {
      id: '/_app/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof AppIndexImport
      parentRoute: typeof AppImport
    }
    '/_app/_authed/dashboard': {
      id: '/_app/_authed/dashboard'
      path: '/dashboard'
      fullPath: '/dashboard'
      preLoaderRoute: typeof AppAuthedDashboardImport
      parentRoute: typeof AppAuthedImport
    }
    '/_app/checkout/$productId': {
      id: '/_app/checkout/$productId'
      path: '/checkout/$productId'
      fullPath: '/checkout/$productId'
      preLoaderRoute: typeof AppCheckoutProductIdImport
      parentRoute: typeof AppImport
    }
    '/_app/checkout/success': {
      id: '/_app/checkout/success'
      path: '/checkout/success'
      fullPath: '/checkout/success'
      preLoaderRoute: typeof AppCheckoutSuccessImport
      parentRoute: typeof AppImport
    }
    '/_app/dashboard/widgets': {
      id: '/_app/dashboard/widgets'
      path: '/dashboard/widgets'
      fullPath: '/dashboard/widgets'
      preLoaderRoute: typeof AppDashboardWidgetsImport
      parentRoute: typeof AppImport
    }
    '/_app/posts/$postId': {
      id: '/_app/posts/$postId'
      path: '/$postId'
      fullPath: '/posts/$postId'
      preLoaderRoute: typeof AppPostsPostIdImport
      parentRoute: typeof AppPostsImport
    }
    '/_app/sign-in/$': {
      id: '/_app/sign-in/$'
      path: '/sign-in/$'
      fullPath: '/sign-in/$'
      preLoaderRoute: typeof AppSignInSplatImport
      parentRoute: typeof AppImport
    }
    '/_app/sign-up/$': {
      id: '/_app/sign-up/$'
      path: '/sign-up/$'
      fullPath: '/sign-up/$'
      preLoaderRoute: typeof AppSignUpSplatImport
      parentRoute: typeof AppImport
    }
    '/_app/teampicker/$bracketId': {
      id: '/_app/teampicker/$bracketId'
      path: '/teampicker/$bracketId'
      fullPath: '/teampicker/$bracketId'
      preLoaderRoute: typeof AppTeampickerBracketIdImport
      parentRoute: typeof AppImport
    }
    '/_layout/_layout-2/layout-a': {
      id: '/_layout/_layout-2/layout-a'
      path: '/layout-a'
      fullPath: '/layout-a'
      preLoaderRoute: typeof LayoutLayout2LayoutAImport
      parentRoute: typeof LayoutLayout2Import
    }
    '/_layout/_layout-2/layout-b': {
      id: '/_layout/_layout-2/layout-b'
      path: '/layout-b'
      fullPath: '/layout-b'
      preLoaderRoute: typeof LayoutLayout2LayoutBImport
      parentRoute: typeof LayoutLayout2Import
    }
    '/_app/posts/': {
      id: '/_app/posts/'
      path: '/'
      fullPath: '/posts/'
      preLoaderRoute: typeof AppPostsIndexImport
      parentRoute: typeof AppPostsImport
    }
    '/_app/pricing/': {
      id: '/_app/pricing/'
      path: '/pricing'
      fullPath: '/pricing'
      preLoaderRoute: typeof AppPricingIndexImport
      parentRoute: typeof AppImport
    }
    '/_app/teampicker/': {
      id: '/_app/teampicker/'
      path: '/teampicker'
      fullPath: '/teampicker'
      preLoaderRoute: typeof AppTeampickerIndexImport
      parentRoute: typeof AppImport
    }
    '/_app/posts/$postId/deep': {
      id: '/_app/posts/$postId/deep'
      path: '/posts/$postId/deep'
      fullPath: '/posts/$postId/deep'
      preLoaderRoute: typeof AppPostsPostIdDeepImport
      parentRoute: typeof AppImport
    }
  }
}

// Create and export the route tree

interface AppAuthedRouteChildren {
  AppAuthedDashboardRoute: typeof AppAuthedDashboardRoute
}

const AppAuthedRouteChildren: AppAuthedRouteChildren = {
  AppAuthedDashboardRoute: AppAuthedDashboardRoute,
}

const AppAuthedRouteWithChildren = AppAuthedRoute._addFileChildren(
  AppAuthedRouteChildren,
)

interface AppPostsRouteChildren {
  AppPostsPostIdRoute: typeof AppPostsPostIdRoute
  AppPostsIndexRoute: typeof AppPostsIndexRoute
}

const AppPostsRouteChildren: AppPostsRouteChildren = {
  AppPostsPostIdRoute: AppPostsPostIdRoute,
  AppPostsIndexRoute: AppPostsIndexRoute,
}

const AppPostsRouteWithChildren = AppPostsRoute._addFileChildren(
  AppPostsRouteChildren,
)

interface AppRouteChildren {
  AppAuthedRoute: typeof AppAuthedRouteWithChildren
  AppPostsRoute: typeof AppPostsRouteWithChildren
  AppTestRoute: typeof AppTestRoute
  AppIndexRoute: typeof AppIndexRoute
  AppCheckoutProductIdRoute: typeof AppCheckoutProductIdRoute
  AppCheckoutSuccessRoute: typeof AppCheckoutSuccessRoute
  AppDashboardWidgetsRoute: typeof AppDashboardWidgetsRoute
  AppSignInSplatRoute: typeof AppSignInSplatRoute
  AppSignUpSplatRoute: typeof AppSignUpSplatRoute
  AppTeampickerBracketIdRoute: typeof AppTeampickerBracketIdRoute
  AppPricingIndexRoute: typeof AppPricingIndexRoute
  AppTeampickerIndexRoute: typeof AppTeampickerIndexRoute
  AppPostsPostIdDeepRoute: typeof AppPostsPostIdDeepRoute
}

const AppRouteChildren: AppRouteChildren = {
  AppAuthedRoute: AppAuthedRouteWithChildren,
  AppPostsRoute: AppPostsRouteWithChildren,
  AppTestRoute: AppTestRoute,
  AppIndexRoute: AppIndexRoute,
  AppCheckoutProductIdRoute: AppCheckoutProductIdRoute,
  AppCheckoutSuccessRoute: AppCheckoutSuccessRoute,
  AppDashboardWidgetsRoute: AppDashboardWidgetsRoute,
  AppSignInSplatRoute: AppSignInSplatRoute,
  AppSignUpSplatRoute: AppSignUpSplatRoute,
  AppTeampickerBracketIdRoute: AppTeampickerBracketIdRoute,
  AppPricingIndexRoute: AppPricingIndexRoute,
  AppTeampickerIndexRoute: AppTeampickerIndexRoute,
  AppPostsPostIdDeepRoute: AppPostsPostIdDeepRoute,
}

const AppRouteWithChildren = AppRoute._addFileChildren(AppRouteChildren)

interface LayoutLayout2RouteChildren {
  LayoutLayout2LayoutARoute: typeof LayoutLayout2LayoutARoute
  LayoutLayout2LayoutBRoute: typeof LayoutLayout2LayoutBRoute
}

const LayoutLayout2RouteChildren: LayoutLayout2RouteChildren = {
  LayoutLayout2LayoutARoute: LayoutLayout2LayoutARoute,
  LayoutLayout2LayoutBRoute: LayoutLayout2LayoutBRoute,
}

const LayoutLayout2RouteWithChildren = LayoutLayout2Route._addFileChildren(
  LayoutLayout2RouteChildren,
)

interface LayoutRouteChildren {
  LayoutLayout2Route: typeof LayoutLayout2RouteWithChildren
}

const LayoutRouteChildren: LayoutRouteChildren = {
  LayoutLayout2Route: LayoutLayout2RouteWithChildren,
}

const LayoutRouteWithChildren =
  LayoutRoute._addFileChildren(LayoutRouteChildren)

export interface FileRoutesByFullPath {
  '': typeof LayoutLayout2RouteWithChildren
  '/posts': typeof AppPostsRouteWithChildren
  '/test': typeof AppTestRoute
  '/': typeof AppIndexRoute
  '/dashboard': typeof AppAuthedDashboardRoute
  '/checkout/$productId': typeof AppCheckoutProductIdRoute
  '/checkout/success': typeof AppCheckoutSuccessRoute
  '/dashboard/widgets': typeof AppDashboardWidgetsRoute
  '/posts/$postId': typeof AppPostsPostIdRoute
  '/sign-in/$': typeof AppSignInSplatRoute
  '/sign-up/$': typeof AppSignUpSplatRoute
  '/teampicker/$bracketId': typeof AppTeampickerBracketIdRoute
  '/layout-a': typeof LayoutLayout2LayoutARoute
  '/layout-b': typeof LayoutLayout2LayoutBRoute
  '/posts/': typeof AppPostsIndexRoute
  '/pricing': typeof AppPricingIndexRoute
  '/teampicker': typeof AppTeampickerIndexRoute
  '/posts/$postId/deep': typeof AppPostsPostIdDeepRoute
}

export interface FileRoutesByTo {
  '': typeof LayoutLayout2RouteWithChildren
  '/test': typeof AppTestRoute
  '/': typeof AppIndexRoute
  '/dashboard': typeof AppAuthedDashboardRoute
  '/checkout/$productId': typeof AppCheckoutProductIdRoute
  '/checkout/success': typeof AppCheckoutSuccessRoute
  '/dashboard/widgets': typeof AppDashboardWidgetsRoute
  '/posts/$postId': typeof AppPostsPostIdRoute
  '/sign-in/$': typeof AppSignInSplatRoute
  '/sign-up/$': typeof AppSignUpSplatRoute
  '/teampicker/$bracketId': typeof AppTeampickerBracketIdRoute
  '/layout-a': typeof LayoutLayout2LayoutARoute
  '/layout-b': typeof LayoutLayout2LayoutBRoute
  '/posts': typeof AppPostsIndexRoute
  '/pricing': typeof AppPricingIndexRoute
  '/teampicker': typeof AppTeampickerIndexRoute
  '/posts/$postId/deep': typeof AppPostsPostIdDeepRoute
}

export interface FileRoutesById {
  __root__: typeof rootRoute
  '/_app': typeof AppRouteWithChildren
  '/_layout': typeof LayoutRouteWithChildren
  '/_app/_authed': typeof AppAuthedRouteWithChildren
  '/_app/posts': typeof AppPostsRouteWithChildren
  '/_app/test': typeof AppTestRoute
  '/_layout/_layout-2': typeof LayoutLayout2RouteWithChildren
  '/_app/': typeof AppIndexRoute
  '/_app/_authed/dashboard': typeof AppAuthedDashboardRoute
  '/_app/checkout/$productId': typeof AppCheckoutProductIdRoute
  '/_app/checkout/success': typeof AppCheckoutSuccessRoute
  '/_app/dashboard/widgets': typeof AppDashboardWidgetsRoute
  '/_app/posts/$postId': typeof AppPostsPostIdRoute
  '/_app/sign-in/$': typeof AppSignInSplatRoute
  '/_app/sign-up/$': typeof AppSignUpSplatRoute
  '/_app/teampicker/$bracketId': typeof AppTeampickerBracketIdRoute
  '/_layout/_layout-2/layout-a': typeof LayoutLayout2LayoutARoute
  '/_layout/_layout-2/layout-b': typeof LayoutLayout2LayoutBRoute
  '/_app/posts/': typeof AppPostsIndexRoute
  '/_app/pricing/': typeof AppPricingIndexRoute
  '/_app/teampicker/': typeof AppTeampickerIndexRoute
  '/_app/posts/$postId/deep': typeof AppPostsPostIdDeepRoute
}

export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths:
    | ''
    | '/posts'
    | '/test'
    | '/'
    | '/dashboard'
    | '/checkout/$productId'
    | '/checkout/success'
    | '/dashboard/widgets'
    | '/posts/$postId'
    | '/sign-in/$'
    | '/sign-up/$'
    | '/teampicker/$bracketId'
    | '/layout-a'
    | '/layout-b'
    | '/posts/'
    | '/pricing'
    | '/teampicker'
    | '/posts/$postId/deep'
  fileRoutesByTo: FileRoutesByTo
  to:
    | ''
    | '/test'
    | '/'
    | '/dashboard'
    | '/checkout/$productId'
    | '/checkout/success'
    | '/dashboard/widgets'
    | '/posts/$postId'
    | '/sign-in/$'
    | '/sign-up/$'
    | '/teampicker/$bracketId'
    | '/layout-a'
    | '/layout-b'
    | '/posts'
    | '/pricing'
    | '/teampicker'
    | '/posts/$postId/deep'
  id:
    | '__root__'
    | '/_app'
    | '/_layout'
    | '/_app/_authed'
    | '/_app/posts'
    | '/_app/test'
    | '/_layout/_layout-2'
    | '/_app/'
    | '/_app/_authed/dashboard'
    | '/_app/checkout/$productId'
    | '/_app/checkout/success'
    | '/_app/dashboard/widgets'
    | '/_app/posts/$postId'
    | '/_app/sign-in/$'
    | '/_app/sign-up/$'
    | '/_app/teampicker/$bracketId'
    | '/_layout/_layout-2/layout-a'
    | '/_layout/_layout-2/layout-b'
    | '/_app/posts/'
    | '/_app/pricing/'
    | '/_app/teampicker/'
    | '/_app/posts/$postId/deep'
  fileRoutesById: FileRoutesById
}

export interface RootRouteChildren {
  AppRoute: typeof AppRouteWithChildren
  LayoutRoute: typeof LayoutRouteWithChildren
}

const rootRouteChildren: RootRouteChildren = {
  AppRoute: AppRouteWithChildren,
  LayoutRoute: LayoutRouteWithChildren,
}

export const routeTree = rootRoute
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()

/* prettier-ignore-end */

/* ROUTE_MANIFEST_START
{
  "routes": {
    "__root__": {
      "filePath": "__root.tsx",
      "children": [
        "/_app",
        "/_layout"
      ]
    },
    "/_app": {
      "filePath": "_app.tsx",
      "children": [
        "/_app/_authed",
        "/_app/posts",
        "/_app/test",
        "/_app/",
        "/_app/checkout/$productId",
        "/_app/checkout/success",
        "/_app/dashboard/widgets",
        "/_app/sign-in/$",
        "/_app/sign-up/$",
        "/_app/teampicker/$bracketId",
        "/_app/pricing/",
        "/_app/teampicker/",
        "/_app/posts/$postId/deep"
      ]
    },
    "/_layout": {
      "filePath": "_layout.tsx",
      "children": [
        "/_layout/_layout-2"
      ]
    },
    "/_app/_authed": {
      "filePath": "_app/_authed.tsx",
      "parent": "/_app",
      "children": [
        "/_app/_authed/dashboard"
      ]
    },
    "/_app/posts": {
      "filePath": "_app/posts.tsx",
      "parent": "/_app",
      "children": [
        "/_app/posts/$postId",
        "/_app/posts/"
      ]
    },
    "/_app/test": {
      "filePath": "_app/test.tsx",
      "parent": "/_app"
    },
    "/_layout/_layout-2": {
      "filePath": "_layout/_layout-2.tsx",
      "parent": "/_layout",
      "children": [
        "/_layout/_layout-2/layout-a",
        "/_layout/_layout-2/layout-b"
      ]
    },
    "/_app/": {
      "filePath": "_app/index.tsx",
      "parent": "/_app"
    },
    "/_app/_authed/dashboard": {
      "filePath": "_app/_authed/dashboard.tsx",
      "parent": "/_app/_authed"
    },
    "/_app/checkout/$productId": {
      "filePath": "_app/checkout.$productId.tsx",
      "parent": "/_app"
    },
    "/_app/checkout/success": {
      "filePath": "_app/checkout.success.tsx",
      "parent": "/_app"
    },
    "/_app/dashboard/widgets": {
      "filePath": "_app/dashboard.widgets.tsx",
      "parent": "/_app"
    },
    "/_app/posts/$postId": {
      "filePath": "_app/posts.$postId.tsx",
      "parent": "/_app/posts"
    },
    "/_app/sign-in/$": {
      "filePath": "_app/sign-in.$.tsx",
      "parent": "/_app"
    },
    "/_app/sign-up/$": {
      "filePath": "_app/sign-up.$.tsx",
      "parent": "/_app"
    },
    "/_app/teampicker/$bracketId": {
      "filePath": "_app/teampicker/$bracketId.tsx",
      "parent": "/_app"
    },
    "/_layout/_layout-2/layout-a": {
      "filePath": "_layout/_layout-2/layout-a.tsx",
      "parent": "/_layout/_layout-2"
    },
    "/_layout/_layout-2/layout-b": {
      "filePath": "_layout/_layout-2/layout-b.tsx",
      "parent": "/_layout/_layout-2"
    },
    "/_app/posts/": {
      "filePath": "_app/posts.index.tsx",
      "parent": "/_app/posts"
    },
    "/_app/pricing/": {
      "filePath": "_app/pricing/index.tsx",
      "parent": "/_app"
    },
    "/_app/teampicker/": {
      "filePath": "_app/teampicker/index.tsx",
      "parent": "/_app"
    },
    "/_app/posts/$postId/deep": {
      "filePath": "_app/posts_.$postId.deep.tsx",
      "parent": "/_app"
    }
  }
}
ROUTE_MANIFEST_END */
