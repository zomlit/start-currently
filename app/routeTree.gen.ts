/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file was automatically generated by TanStack Router.
// You should NOT make any changes in this file as it will be overwritten.
// Additionally, you should also exclude this file from your linter and/or formatter to prevent it from being checked or modified.

// Import Routes

import { Route as rootRoute } from './routes/__root'
import { Route as LyricsImport } from './routes/_lyrics'
import { Route as AppImport } from './routes/_app'
import { Route as UsernameImport } from './routes/$username'
import { Route as AppIndexImport } from './routes/_app/index'
import { Route as AppTestImport } from './routes/_app/test'
import { Route as AppSectionsImport } from './routes/_app/sections'
import { Route as AppPostsImport } from './routes/_app/posts'
import { Route as AppAuthedImport } from './routes/_app/_authed'
import { Route as UsernameLyricsImport } from './routes/$username/lyrics'
import { Route as LyricsLyricsIndexImport } from './routes/_lyrics/lyrics.index'
import { Route as AppWheelspinIndexImport } from './routes/_app/wheelspin/index'
import { Route as AppTeampickerIndexImport } from './routes/_app/teampicker/index'
import { Route as AppSectionsIndexImport } from './routes/_app/sections/index'
import { Route as AppPricingIndexImport } from './routes/_app/pricing/index'
import { Route as AppTeampickerBracketIdImport } from './routes/_app/teampicker/$bracketId'
import { Route as AppSignUpSplatImport } from './routes/_app/sign-up.$'
import { Route as AppSignInSplatImport } from './routes/_app/sign-in.$'
import { Route as AppSectionsVisualizerImport } from './routes/_app/sections/visualizer'
import { Route as AppSectionsStatsImport } from './routes/_app/sections/stats'
import { Route as AppSectionsLyricsImport } from './routes/_app/sections/lyrics'
import { Route as AppSectionsChatImport } from './routes/_app/sections/chat'
import { Route as AppSectionsAlertsImport } from './routes/_app/sections/alerts'
import { Route as AppPostsPostIdImport } from './routes/_app/posts.$postId'
import { Route as AppCheckoutSuccessImport } from './routes/_app/checkout.success'
import { Route as AppCheckoutProductIdImport } from './routes/_app/checkout.$productId'
import { Route as AppAuthedDashboardImport } from './routes/_app/_authed/dashboard'
import { Route as AppPostsPostIdDeepImport } from './routes/_app/posts_.$postId.deep'
import { Route as AppDashboardWidgetsVisualizerImport } from './routes/_app/dashboard/widgets/visualizer'
import { Route as AppDashboardWidgetsDevImport } from './routes/_app/dashboard/widgets/dev'

// Create/Update Routes

const LyricsRoute = LyricsImport.update({
  id: '/_lyrics',
  getParentRoute: () => rootRoute,
} as any)

const AppRoute = AppImport.update({
  id: '/_app',
  getParentRoute: () => rootRoute,
} as any)

const UsernameRoute = UsernameImport.update({
  id: '/$username',
  path: '/$username',
  getParentRoute: () => rootRoute,
} as any)

const AppIndexRoute = AppIndexImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => AppRoute,
} as any)

const AppTestRoute = AppTestImport.update({
  id: '/test',
  path: '/test',
  getParentRoute: () => AppRoute,
} as any)

const AppSectionsRoute = AppSectionsImport.update({
  id: '/sections',
  path: '/sections',
  getParentRoute: () => AppRoute,
} as any)

const AppPostsRoute = AppPostsImport.update({
  id: '/posts',
  path: '/posts',
  getParentRoute: () => AppRoute,
} as any)

const AppAuthedRoute = AppAuthedImport.update({
  id: '/_authed',
  getParentRoute: () => AppRoute,
} as any)

const UsernameLyricsRoute = UsernameLyricsImport.update({
  id: '/lyrics',
  path: '/lyrics',
  getParentRoute: () => UsernameRoute,
} as any)

const LyricsLyricsIndexRoute = LyricsLyricsIndexImport.update({
  id: '/lyrics/',
  path: '/lyrics/',
  getParentRoute: () => LyricsRoute,
} as any)

const AppWheelspinIndexRoute = AppWheelspinIndexImport.update({
  id: '/wheelspin/',
  path: '/wheelspin/',
  getParentRoute: () => AppRoute,
} as any)

const AppTeampickerIndexRoute = AppTeampickerIndexImport.update({
  id: '/teampicker/',
  path: '/teampicker/',
  getParentRoute: () => AppRoute,
} as any)

const AppSectionsIndexRoute = AppSectionsIndexImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => AppSectionsRoute,
} as any)

const AppPricingIndexRoute = AppPricingIndexImport.update({
  id: '/pricing/',
  path: '/pricing/',
  getParentRoute: () => AppRoute,
} as any)

const AppTeampickerBracketIdRoute = AppTeampickerBracketIdImport.update({
  id: '/teampicker/$bracketId',
  path: '/teampicker/$bracketId',
  getParentRoute: () => AppRoute,
} as any)

const AppSignUpSplatRoute = AppSignUpSplatImport.update({
  id: '/sign-up/$',
  path: '/sign-up/$',
  getParentRoute: () => AppRoute,
} as any)

const AppSignInSplatRoute = AppSignInSplatImport.update({
  id: '/sign-in/$',
  path: '/sign-in/$',
  getParentRoute: () => AppRoute,
} as any)

const AppSectionsVisualizerRoute = AppSectionsVisualizerImport.update({
  id: '/visualizer',
  path: '/visualizer',
  getParentRoute: () => AppSectionsRoute,
} as any)

const AppSectionsStatsRoute = AppSectionsStatsImport.update({
  id: '/stats',
  path: '/stats',
  getParentRoute: () => AppSectionsRoute,
} as any)

const AppSectionsLyricsRoute = AppSectionsLyricsImport.update({
  id: '/lyrics',
  path: '/lyrics',
  getParentRoute: () => AppSectionsRoute,
} as any)

const AppSectionsChatRoute = AppSectionsChatImport.update({
  id: '/chat',
  path: '/chat',
  getParentRoute: () => AppSectionsRoute,
} as any)

const AppSectionsAlertsRoute = AppSectionsAlertsImport.update({
  id: '/alerts',
  path: '/alerts',
  getParentRoute: () => AppSectionsRoute,
} as any)

const AppPostsPostIdRoute = AppPostsPostIdImport.update({
  id: '/$postId',
  path: '/$postId',
  getParentRoute: () => AppPostsRoute,
} as any)

const AppCheckoutSuccessRoute = AppCheckoutSuccessImport.update({
  id: '/checkout/success',
  path: '/checkout/success',
  getParentRoute: () => AppRoute,
} as any)

const AppCheckoutProductIdRoute = AppCheckoutProductIdImport.update({
  id: '/checkout/$productId',
  path: '/checkout/$productId',
  getParentRoute: () => AppRoute,
} as any)

const AppAuthedDashboardRoute = AppAuthedDashboardImport.update({
  id: '/dashboard',
  path: '/dashboard',
  getParentRoute: () => AppAuthedRoute,
} as any)

const AppPostsPostIdDeepRoute = AppPostsPostIdDeepImport.update({
  id: '/posts_/$postId/deep',
  path: '/posts/$postId/deep',
  getParentRoute: () => AppRoute,
} as any)

const AppDashboardWidgetsVisualizerRoute =
  AppDashboardWidgetsVisualizerImport.update({
    id: '/dashboard/widgets/visualizer',
    path: '/dashboard/widgets/visualizer',
    getParentRoute: () => AppRoute,
  } as any)

const AppDashboardWidgetsDevRoute = AppDashboardWidgetsDevImport.update({
  id: '/dashboard/widgets/dev',
  path: '/dashboard/widgets/dev',
  getParentRoute: () => AppRoute,
} as any)

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/$username': {
      id: '/$username'
      path: '/$username'
      fullPath: '/$username'
      preLoaderRoute: typeof UsernameImport
      parentRoute: typeof rootRoute
    }
    '/_app': {
      id: '/_app'
      path: ''
      fullPath: ''
      preLoaderRoute: typeof AppImport
      parentRoute: typeof rootRoute
    }
    '/_lyrics': {
      id: '/_lyrics'
      path: ''
      fullPath: ''
      preLoaderRoute: typeof LyricsImport
      parentRoute: typeof rootRoute
    }
    '/$username/lyrics': {
      id: '/$username/lyrics'
      path: '/lyrics'
      fullPath: '/$username/lyrics'
      preLoaderRoute: typeof UsernameLyricsImport
      parentRoute: typeof UsernameImport
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
    '/_app/sections': {
      id: '/_app/sections'
      path: '/sections'
      fullPath: '/sections'
      preLoaderRoute: typeof AppSectionsImport
      parentRoute: typeof AppImport
    }
    '/_app/test': {
      id: '/_app/test'
      path: '/test'
      fullPath: '/test'
      preLoaderRoute: typeof AppTestImport
      parentRoute: typeof AppImport
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
    '/_app/posts/$postId': {
      id: '/_app/posts/$postId'
      path: '/$postId'
      fullPath: '/posts/$postId'
      preLoaderRoute: typeof AppPostsPostIdImport
      parentRoute: typeof AppPostsImport
    }
    '/_app/sections/alerts': {
      id: '/_app/sections/alerts'
      path: '/alerts'
      fullPath: '/sections/alerts'
      preLoaderRoute: typeof AppSectionsAlertsImport
      parentRoute: typeof AppSectionsImport
    }
    '/_app/sections/chat': {
      id: '/_app/sections/chat'
      path: '/chat'
      fullPath: '/sections/chat'
      preLoaderRoute: typeof AppSectionsChatImport
      parentRoute: typeof AppSectionsImport
    }
    '/_app/sections/lyrics': {
      id: '/_app/sections/lyrics'
      path: '/lyrics'
      fullPath: '/sections/lyrics'
      preLoaderRoute: typeof AppSectionsLyricsImport
      parentRoute: typeof AppSectionsImport
    }
    '/_app/sections/stats': {
      id: '/_app/sections/stats'
      path: '/stats'
      fullPath: '/sections/stats'
      preLoaderRoute: typeof AppSectionsStatsImport
      parentRoute: typeof AppSectionsImport
    }
    '/_app/sections/visualizer': {
      id: '/_app/sections/visualizer'
      path: '/visualizer'
      fullPath: '/sections/visualizer'
      preLoaderRoute: typeof AppSectionsVisualizerImport
      parentRoute: typeof AppSectionsImport
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
    '/_app/pricing/': {
      id: '/_app/pricing/'
      path: '/pricing'
      fullPath: '/pricing'
      preLoaderRoute: typeof AppPricingIndexImport
      parentRoute: typeof AppImport
    }
    '/_app/sections/': {
      id: '/_app/sections/'
      path: '/'
      fullPath: '/sections/'
      preLoaderRoute: typeof AppSectionsIndexImport
      parentRoute: typeof AppSectionsImport
    }
    '/_app/teampicker/': {
      id: '/_app/teampicker/'
      path: '/teampicker'
      fullPath: '/teampicker'
      preLoaderRoute: typeof AppTeampickerIndexImport
      parentRoute: typeof AppImport
    }
    '/_app/wheelspin/': {
      id: '/_app/wheelspin/'
      path: '/wheelspin'
      fullPath: '/wheelspin'
      preLoaderRoute: typeof AppWheelspinIndexImport
      parentRoute: typeof AppImport
    }
    '/_lyrics/lyrics/': {
      id: '/_lyrics/lyrics/'
      path: '/lyrics'
      fullPath: '/lyrics'
      preLoaderRoute: typeof LyricsLyricsIndexImport
      parentRoute: typeof LyricsImport
    }
    '/_app/dashboard/widgets/dev': {
      id: '/_app/dashboard/widgets/dev'
      path: '/dashboard/widgets/dev'
      fullPath: '/dashboard/widgets/dev'
      preLoaderRoute: typeof AppDashboardWidgetsDevImport
      parentRoute: typeof AppImport
    }
    '/_app/dashboard/widgets/visualizer': {
      id: '/_app/dashboard/widgets/visualizer'
      path: '/dashboard/widgets/visualizer'
      fullPath: '/dashboard/widgets/visualizer'
      preLoaderRoute: typeof AppDashboardWidgetsVisualizerImport
      parentRoute: typeof AppImport
    }
    '/_app/posts_/$postId/deep': {
      id: '/_app/posts_/$postId/deep'
      path: '/posts/$postId/deep'
      fullPath: '/posts/$postId/deep'
      preLoaderRoute: typeof AppPostsPostIdDeepImport
      parentRoute: typeof AppImport
    }
  }
}

// Create and export the route tree

interface UsernameRouteChildren {
  UsernameLyricsRoute: typeof UsernameLyricsRoute
}

const UsernameRouteChildren: UsernameRouteChildren = {
  UsernameLyricsRoute: UsernameLyricsRoute,
}

const UsernameRouteWithChildren = UsernameRoute._addFileChildren(
  UsernameRouteChildren,
)

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
}

const AppPostsRouteChildren: AppPostsRouteChildren = {
  AppPostsPostIdRoute: AppPostsPostIdRoute,
}

const AppPostsRouteWithChildren = AppPostsRoute._addFileChildren(
  AppPostsRouteChildren,
)

interface AppSectionsRouteChildren {
  AppSectionsAlertsRoute: typeof AppSectionsAlertsRoute
  AppSectionsChatRoute: typeof AppSectionsChatRoute
  AppSectionsLyricsRoute: typeof AppSectionsLyricsRoute
  AppSectionsStatsRoute: typeof AppSectionsStatsRoute
  AppSectionsVisualizerRoute: typeof AppSectionsVisualizerRoute
  AppSectionsIndexRoute: typeof AppSectionsIndexRoute
}

const AppSectionsRouteChildren: AppSectionsRouteChildren = {
  AppSectionsAlertsRoute: AppSectionsAlertsRoute,
  AppSectionsChatRoute: AppSectionsChatRoute,
  AppSectionsLyricsRoute: AppSectionsLyricsRoute,
  AppSectionsStatsRoute: AppSectionsStatsRoute,
  AppSectionsVisualizerRoute: AppSectionsVisualizerRoute,
  AppSectionsIndexRoute: AppSectionsIndexRoute,
}

const AppSectionsRouteWithChildren = AppSectionsRoute._addFileChildren(
  AppSectionsRouteChildren,
)

interface AppRouteChildren {
  AppAuthedRoute: typeof AppAuthedRouteWithChildren
  AppPostsRoute: typeof AppPostsRouteWithChildren
  AppSectionsRoute: typeof AppSectionsRouteWithChildren
  AppTestRoute: typeof AppTestRoute
  AppIndexRoute: typeof AppIndexRoute
  AppCheckoutProductIdRoute: typeof AppCheckoutProductIdRoute
  AppCheckoutSuccessRoute: typeof AppCheckoutSuccessRoute
  AppSignInSplatRoute: typeof AppSignInSplatRoute
  AppSignUpSplatRoute: typeof AppSignUpSplatRoute
  AppTeampickerBracketIdRoute: typeof AppTeampickerBracketIdRoute
  AppPricingIndexRoute: typeof AppPricingIndexRoute
  AppTeampickerIndexRoute: typeof AppTeampickerIndexRoute
  AppWheelspinIndexRoute: typeof AppWheelspinIndexRoute
  AppDashboardWidgetsDevRoute: typeof AppDashboardWidgetsDevRoute
  AppDashboardWidgetsVisualizerRoute: typeof AppDashboardWidgetsVisualizerRoute
  AppPostsPostIdDeepRoute: typeof AppPostsPostIdDeepRoute
}

const AppRouteChildren: AppRouteChildren = {
  AppAuthedRoute: AppAuthedRouteWithChildren,
  AppPostsRoute: AppPostsRouteWithChildren,
  AppSectionsRoute: AppSectionsRouteWithChildren,
  AppTestRoute: AppTestRoute,
  AppIndexRoute: AppIndexRoute,
  AppCheckoutProductIdRoute: AppCheckoutProductIdRoute,
  AppCheckoutSuccessRoute: AppCheckoutSuccessRoute,
  AppSignInSplatRoute: AppSignInSplatRoute,
  AppSignUpSplatRoute: AppSignUpSplatRoute,
  AppTeampickerBracketIdRoute: AppTeampickerBracketIdRoute,
  AppPricingIndexRoute: AppPricingIndexRoute,
  AppTeampickerIndexRoute: AppTeampickerIndexRoute,
  AppWheelspinIndexRoute: AppWheelspinIndexRoute,
  AppDashboardWidgetsDevRoute: AppDashboardWidgetsDevRoute,
  AppDashboardWidgetsVisualizerRoute: AppDashboardWidgetsVisualizerRoute,
  AppPostsPostIdDeepRoute: AppPostsPostIdDeepRoute,
}

const AppRouteWithChildren = AppRoute._addFileChildren(AppRouteChildren)

interface LyricsRouteChildren {
  LyricsLyricsIndexRoute: typeof LyricsLyricsIndexRoute
}

const LyricsRouteChildren: LyricsRouteChildren = {
  LyricsLyricsIndexRoute: LyricsLyricsIndexRoute,
}

const LyricsRouteWithChildren =
  LyricsRoute._addFileChildren(LyricsRouteChildren)

export interface FileRoutesByFullPath {
  '/$username': typeof UsernameRouteWithChildren
  '': typeof AppAuthedRouteWithChildren
  '/$username/lyrics': typeof UsernameLyricsRoute
  '/posts': typeof AppPostsRouteWithChildren
  '/sections': typeof AppSectionsRouteWithChildren
  '/test': typeof AppTestRoute
  '/': typeof AppIndexRoute
  '/dashboard': typeof AppAuthedDashboardRoute
  '/checkout/$productId': typeof AppCheckoutProductIdRoute
  '/checkout/success': typeof AppCheckoutSuccessRoute
  '/posts/$postId': typeof AppPostsPostIdRoute
  '/sections/alerts': typeof AppSectionsAlertsRoute
  '/sections/chat': typeof AppSectionsChatRoute
  '/sections/lyrics': typeof AppSectionsLyricsRoute
  '/sections/stats': typeof AppSectionsStatsRoute
  '/sections/visualizer': typeof AppSectionsVisualizerRoute
  '/sign-in/$': typeof AppSignInSplatRoute
  '/sign-up/$': typeof AppSignUpSplatRoute
  '/teampicker/$bracketId': typeof AppTeampickerBracketIdRoute
  '/pricing': typeof AppPricingIndexRoute
  '/sections/': typeof AppSectionsIndexRoute
  '/teampicker': typeof AppTeampickerIndexRoute
  '/wheelspin': typeof AppWheelspinIndexRoute
  '/lyrics': typeof LyricsLyricsIndexRoute
  '/dashboard/widgets/dev': typeof AppDashboardWidgetsDevRoute
  '/dashboard/widgets/visualizer': typeof AppDashboardWidgetsVisualizerRoute
  '/posts/$postId/deep': typeof AppPostsPostIdDeepRoute
}

export interface FileRoutesByTo {
  '/$username': typeof UsernameRouteWithChildren
  '': typeof AppAuthedRouteWithChildren
  '/$username/lyrics': typeof UsernameLyricsRoute
  '/posts': typeof AppPostsRouteWithChildren
  '/test': typeof AppTestRoute
  '/': typeof AppIndexRoute
  '/dashboard': typeof AppAuthedDashboardRoute
  '/checkout/$productId': typeof AppCheckoutProductIdRoute
  '/checkout/success': typeof AppCheckoutSuccessRoute
  '/posts/$postId': typeof AppPostsPostIdRoute
  '/sections/alerts': typeof AppSectionsAlertsRoute
  '/sections/chat': typeof AppSectionsChatRoute
  '/sections/lyrics': typeof AppSectionsLyricsRoute
  '/sections/stats': typeof AppSectionsStatsRoute
  '/sections/visualizer': typeof AppSectionsVisualizerRoute
  '/sign-in/$': typeof AppSignInSplatRoute
  '/sign-up/$': typeof AppSignUpSplatRoute
  '/teampicker/$bracketId': typeof AppTeampickerBracketIdRoute
  '/pricing': typeof AppPricingIndexRoute
  '/sections': typeof AppSectionsIndexRoute
  '/teampicker': typeof AppTeampickerIndexRoute
  '/wheelspin': typeof AppWheelspinIndexRoute
  '/lyrics': typeof LyricsLyricsIndexRoute
  '/dashboard/widgets/dev': typeof AppDashboardWidgetsDevRoute
  '/dashboard/widgets/visualizer': typeof AppDashboardWidgetsVisualizerRoute
  '/posts/$postId/deep': typeof AppPostsPostIdDeepRoute
}

export interface FileRoutesById {
  __root__: typeof rootRoute
  '/$username': typeof UsernameRouteWithChildren
  '/_app': typeof AppRouteWithChildren
  '/_lyrics': typeof LyricsRouteWithChildren
  '/$username/lyrics': typeof UsernameLyricsRoute
  '/_app/_authed': typeof AppAuthedRouteWithChildren
  '/_app/posts': typeof AppPostsRouteWithChildren
  '/_app/sections': typeof AppSectionsRouteWithChildren
  '/_app/test': typeof AppTestRoute
  '/_app/': typeof AppIndexRoute
  '/_app/_authed/dashboard': typeof AppAuthedDashboardRoute
  '/_app/checkout/$productId': typeof AppCheckoutProductIdRoute
  '/_app/checkout/success': typeof AppCheckoutSuccessRoute
  '/_app/posts/$postId': typeof AppPostsPostIdRoute
  '/_app/sections/alerts': typeof AppSectionsAlertsRoute
  '/_app/sections/chat': typeof AppSectionsChatRoute
  '/_app/sections/lyrics': typeof AppSectionsLyricsRoute
  '/_app/sections/stats': typeof AppSectionsStatsRoute
  '/_app/sections/visualizer': typeof AppSectionsVisualizerRoute
  '/_app/sign-in/$': typeof AppSignInSplatRoute
  '/_app/sign-up/$': typeof AppSignUpSplatRoute
  '/_app/teampicker/$bracketId': typeof AppTeampickerBracketIdRoute
  '/_app/pricing/': typeof AppPricingIndexRoute
  '/_app/sections/': typeof AppSectionsIndexRoute
  '/_app/teampicker/': typeof AppTeampickerIndexRoute
  '/_app/wheelspin/': typeof AppWheelspinIndexRoute
  '/_lyrics/lyrics/': typeof LyricsLyricsIndexRoute
  '/_app/dashboard/widgets/dev': typeof AppDashboardWidgetsDevRoute
  '/_app/dashboard/widgets/visualizer': typeof AppDashboardWidgetsVisualizerRoute
  '/_app/posts_/$postId/deep': typeof AppPostsPostIdDeepRoute
}

export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths:
    | '/$username'
    | ''
    | '/$username/lyrics'
    | '/posts'
    | '/sections'
    | '/test'
    | '/'
    | '/dashboard'
    | '/checkout/$productId'
    | '/checkout/success'
    | '/posts/$postId'
    | '/sections/alerts'
    | '/sections/chat'
    | '/sections/lyrics'
    | '/sections/stats'
    | '/sections/visualizer'
    | '/sign-in/$'
    | '/sign-up/$'
    | '/teampicker/$bracketId'
    | '/pricing'
    | '/sections/'
    | '/teampicker'
    | '/wheelspin'
    | '/lyrics'
    | '/dashboard/widgets/dev'
    | '/dashboard/widgets/visualizer'
    | '/posts/$postId/deep'
  fileRoutesByTo: FileRoutesByTo
  to:
    | '/$username'
    | ''
    | '/$username/lyrics'
    | '/posts'
    | '/test'
    | '/'
    | '/dashboard'
    | '/checkout/$productId'
    | '/checkout/success'
    | '/posts/$postId'
    | '/sections/alerts'
    | '/sections/chat'
    | '/sections/lyrics'
    | '/sections/stats'
    | '/sections/visualizer'
    | '/sign-in/$'
    | '/sign-up/$'
    | '/teampicker/$bracketId'
    | '/pricing'
    | '/sections'
    | '/teampicker'
    | '/wheelspin'
    | '/lyrics'
    | '/dashboard/widgets/dev'
    | '/dashboard/widgets/visualizer'
    | '/posts/$postId/deep'
  id:
    | '__root__'
    | '/$username'
    | '/_app'
    | '/_lyrics'
    | '/$username/lyrics'
    | '/_app/_authed'
    | '/_app/posts'
    | '/_app/sections'
    | '/_app/test'
    | '/_app/'
    | '/_app/_authed/dashboard'
    | '/_app/checkout/$productId'
    | '/_app/checkout/success'
    | '/_app/posts/$postId'
    | '/_app/sections/alerts'
    | '/_app/sections/chat'
    | '/_app/sections/lyrics'
    | '/_app/sections/stats'
    | '/_app/sections/visualizer'
    | '/_app/sign-in/$'
    | '/_app/sign-up/$'
    | '/_app/teampicker/$bracketId'
    | '/_app/pricing/'
    | '/_app/sections/'
    | '/_app/teampicker/'
    | '/_app/wheelspin/'
    | '/_lyrics/lyrics/'
    | '/_app/dashboard/widgets/dev'
    | '/_app/dashboard/widgets/visualizer'
    | '/_app/posts_/$postId/deep'
  fileRoutesById: FileRoutesById
}

export interface RootRouteChildren {
  UsernameRoute: typeof UsernameRouteWithChildren
  AppRoute: typeof AppRouteWithChildren
  LyricsRoute: typeof LyricsRouteWithChildren
}

const rootRouteChildren: RootRouteChildren = {
  UsernameRoute: UsernameRouteWithChildren,
  AppRoute: AppRouteWithChildren,
  LyricsRoute: LyricsRouteWithChildren,
}

export const routeTree = rootRoute
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()

/* ROUTE_MANIFEST_START
{
  "routes": {
    "__root__": {
      "filePath": "__root.tsx",
      "children": [
        "/$username",
        "/_app",
        "/_lyrics"
      ]
    },
    "/$username": {
      "filePath": "$username.tsx",
      "children": [
        "/$username/lyrics"
      ]
    },
    "/_app": {
      "filePath": "_app.tsx",
      "children": [
        "/_app/_authed",
        "/_app/posts",
        "/_app/sections",
        "/_app/test",
        "/_app/",
        "/_app/checkout/$productId",
        "/_app/checkout/success",
        "/_app/sign-in/$",
        "/_app/sign-up/$",
        "/_app/teampicker/$bracketId",
        "/_app/pricing/",
        "/_app/teampicker/",
        "/_app/wheelspin/",
        "/_app/dashboard/widgets/dev",
        "/_app/dashboard/widgets/visualizer",
        "/_app/posts_/$postId/deep"
      ]
    },
    "/_lyrics": {
      "filePath": "_lyrics.tsx",
      "children": [
        "/_lyrics/lyrics/"
      ]
    },
    "/$username/lyrics": {
      "filePath": "$username/lyrics.tsx",
      "parent": "/$username"
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
        "/_app/posts/$postId"
      ]
    },
    "/_app/sections": {
      "filePath": "_app/sections.tsx",
      "parent": "/_app",
      "children": [
        "/_app/sections/alerts",
        "/_app/sections/chat",
        "/_app/sections/lyrics",
        "/_app/sections/stats",
        "/_app/sections/visualizer",
        "/_app/sections/"
      ]
    },
    "/_app/test": {
      "filePath": "_app/test.tsx",
      "parent": "/_app"
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
    "/_app/posts/$postId": {
      "filePath": "_app/posts.$postId.tsx",
      "parent": "/_app/posts"
    },
    "/_app/sections/alerts": {
      "filePath": "_app/sections/alerts.tsx",
      "parent": "/_app/sections"
    },
    "/_app/sections/chat": {
      "filePath": "_app/sections/chat.tsx",
      "parent": "/_app/sections"
    },
    "/_app/sections/lyrics": {
      "filePath": "_app/sections/lyrics.tsx",
      "parent": "/_app/sections"
    },
    "/_app/sections/stats": {
      "filePath": "_app/sections/stats.tsx",
      "parent": "/_app/sections"
    },
    "/_app/sections/visualizer": {
      "filePath": "_app/sections/visualizer.tsx",
      "parent": "/_app/sections"
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
    "/_app/pricing/": {
      "filePath": "_app/pricing/index.tsx",
      "parent": "/_app"
    },
    "/_app/sections/": {
      "filePath": "_app/sections/index.tsx",
      "parent": "/_app/sections"
    },
    "/_app/teampicker/": {
      "filePath": "_app/teampicker/index.tsx",
      "parent": "/_app"
    },
    "/_app/wheelspin/": {
      "filePath": "_app/wheelspin/index.tsx",
      "parent": "/_app"
    },
    "/_lyrics/lyrics/": {
      "filePath": "_lyrics/lyrics.index.tsx",
      "parent": "/_lyrics"
    },
    "/_app/dashboard/widgets/dev": {
      "filePath": "_app/dashboard/widgets/dev.tsx",
      "parent": "/_app"
    },
    "/_app/dashboard/widgets/visualizer": {
      "filePath": "_app/dashboard/widgets/visualizer.tsx",
      "parent": "/_app"
    },
    "/_app/posts_/$postId/deep": {
      "filePath": "_app/posts_.$postId.deep.tsx",
      "parent": "/_app"
    }
  }
}
ROUTE_MANIFEST_END */
