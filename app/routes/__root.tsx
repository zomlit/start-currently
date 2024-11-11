import {
  Outlet,
  ScrollRestoration,
  createRootRouteWithContext,
} from "@tanstack/react-router";
import {
  Body,
  Head,
  Html,
  Meta,
  Scripts,
  createServerFn,
} from "@tanstack/start";
import * as React from "react";
import type { QueryClient } from "@tanstack/react-query";
import { DefaultCatchBoundary } from "@/components/DefaultCatchBoundary";
import { NotFound } from "@/components/NotFound";
import { seo } from "@/utils/seo";
import { getAuth } from "@clerk/tanstack-start/server";
import appCss from "@/styles/app.css?url";
import globalCss from "@/styles/global.css?url";
import { ClerkProvider } from "@clerk/tanstack-start";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { AccessControl } from "@/components/AccessControl";
import { dark, default as defaultTheme } from "@clerk/themes";
import { useThemeStore } from "@/store/themeStore";
import type { RouterContext } from '@/lib/router'

const fetchClerkAuth = createServerFn("GET", async (_, ctx) => {
  const user = await getAuth(ctx.request);

  return {
    user,
  };
});

export const Route = createRootRouteWithContext<RouterContext>()({

  beforeLoad: async () => {
    const { user } = await fetchClerkAuth();

    return {
      user,
    };
  },
  meta: () => [
    { charSet: "utf-8" },
    { name: "viewport", content: "width=device-width, initial-scale=1" },
    ...seo({
      title: "Currently | Modern Tools for the Modern Streamer.",
      description: "Currently is a streaming platform for the modern streamer.",
    }),
  ],

  links: () => [
    { rel: "stylesheet", href: globalCss },
    { rel: "stylesheet", href: appCss },
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
    { rel: "preload", href: "/images/hero-bg.webp", as: "image" },
  ],

  errorComponent: (props) => (
    <RootDocument>
      <DefaultCatchBoundary {...props} />
    </RootDocument>
  ),
  notFoundComponent: () => <NotFound />,
  component: RootComponent,
});

function RootComponent() {
  return (
    <RootDocument>
      <AccessControl>
        <Outlet />
      </AccessControl>
    </RootDocument>
  );
}

function RootDocument({ children }: { children: React.ReactNode }) {
  const { theme } = useThemeStore();

  return (
    <ClerkProvider
      appearance={{
        baseTheme: theme === "dark" ? dark : undefined,
        // elements: {
        //   avatarBox:
        //     "w-10 h-10 hover:scale-110 transition-all duration-300 border-violet-500 border-[2px]",
        //   impersonationFabTitle: "text-black",
        //   colorNeutral: "border-solid border-2 border-sky-500",
        //   tagInputContainer: "bg-transparent border-white/10",
        //   input: "bg-white/10 text-white border-white/10",
        //   navbar: "text-violet-500 !bg-transparent bg-none",
        //   navbarButton: "text-violet-500",
        //   navbarButtonIcon: "text-violet-500",
        // },
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
      <Html>
        <Head>
          <Meta />
        </Head>
        <Body>
          {children}
          <ScrollRestoration />
          {/* <TanStackRouterDevtools position="bottom-right" />
          <ReactQueryDevtools buttonPosition="bottom-left" /> */}
          <Scripts />
        </Body>
      </Html>
    </ClerkProvider>
  );
}
