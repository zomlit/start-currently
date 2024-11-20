import {
  Link,
  Outlet,
  ReactNode,
  ScrollRestoration,
  createRootRouteWithContext,
} from "@tanstack/react-router";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { Meta, Scripts } from "@tanstack/start";
import * as React from "react";
import type { QueryClient } from "@tanstack/react-query";
import { AccessControl } from "@/components/AccessControl";

import { DefaultCatchBoundary } from "@/components/DefaultCatchBoundary";
import { NotFound } from "@/components/NotFound";
import appCss from "@/styles/app.css?url";
import gamepadCss from "@/styles/gamepad.css?url";
import { dark } from "@clerk/themes";
import { seo } from "@/utils/seo";
import { ClerkProvider } from "@clerk/tanstack-start";
import { useThemeStore } from "@/store/themeStore";
export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      ...seo({
        title: "",
        description: ``,
      }),
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "stylesheet", href: gamepadCss },
      {
        rel: "apple-touch-icon",
        sizes: "180x180",
        href: "/apple-touch-icon.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "32x32",
        href: "/favicon-32x32.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "16x16",
        href: "/favicon-16x16.png",
      },
      { rel: "manifest", href: "/site.webmanifest", color: "#fffff" },
      { rel: "icon", href: "/favicon.ico" },
    ],
    scripts: import.meta.env.PROD
      ? []
      : [
          {
            type: "module",
            children: /* js */ `
      import RefreshRuntime from "/_build/@react-refresh"
      RefreshRuntime.injectIntoGlobalHook(window)
      window.$RefreshReg$ = () => {}
      window.$RefreshSig$ = () => (type) => type
    `,
          },
        ],
  }),

  beforeLoad: async () => {
    return {};
  },
  errorComponent: DefaultCatchBoundary,

  notFoundComponent: () => <NotFound />,
  component: RootComponent,
});

function RootComponent() {
  const { theme } = useThemeStore();

  return (
    <ClerkProvider
      appearance={{
        baseTheme: theme === "dark" ? dark : undefined,
        variables: {
          colorBackground:
            theme === "dark"
              ? "hsl(20 14.3% 4.1% / 0.8)"
              : "hsl(0 0% 100% / 1)",
          colorPrimary: "hsl(263 70% 50%)",
          colorShimmer: "transparent",
        },
        elements: {
          card: "backdrop-blur-[14px]",
          rootBox: "backdrop-blur-[14px]",
          formContainer: "backdrop-blur-[14px]",
          userButtonPopoverCard: "backdrop-blur-[14px]",
          organizationSwitcherPopoverCard: "backdrop-blur-[14px]",
        },
      }}
    >
      <RootDocument>
        <AccessControl>
          <Outlet />
        </AccessControl>
      </RootDocument>
    </ClerkProvider>
  );
}

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Meta />
      </head>
      <body className="min-h-screen font-sofia antialiased">
        {children}
        <ScrollRestoration />
        <TanStackRouterDevtools position="bottom-right" />
        <ReactQueryDevtools buttonPosition="bottom-left" />
        <Scripts />
      </body>
    </html>
  );
}
