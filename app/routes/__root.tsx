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
import {
  ClerkProvider,
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/tanstack-start";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const fetchClerkAuth = createServerFn("GET", async (_, ctx) => {
  const user = await getAuth(ctx.request);

  return {
    user,
  };
});

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
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
    // { rel: "preload", href: "/images/hero-bg.webp", as: "image" },
  ],
  beforeLoad: async () => {
    const { user } = await fetchClerkAuth();

    return {
      user,
    };
  },
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
    <ClerkProvider>
      <RootDocument>
        <Outlet />
      </RootDocument>
    </ClerkProvider>
  );
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <Html>
      <Head>
        <Meta />
      </Head>
      <Body>
        {children}
        <ScrollRestoration />
        <TanStackRouterDevtools position="bottom-right" />
        <ReactQueryDevtools buttonPosition="bottom-left" />
        <Scripts />
      </Body>
    </Html>
  );
}
