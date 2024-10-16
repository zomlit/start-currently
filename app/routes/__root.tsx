import {
  Outlet,
  ScrollRestoration,
  createRootRoute,
  useRouter,
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
import { DefaultCatchBoundary } from "../components/DefaultCatchBoundary";
import { NotFound } from "../components/NotFound";
import { seo } from "../utils/seo";
import { getAuth } from "@clerk/tanstack-start/server";
import appCss from "../styles/app.css?url";
import globalCss from "../styles/global.css?url";
import { CustomClerkProvider } from "../contexts/ClerkContext";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";

const fetchClerkAuth = createServerFn("GET", async (_, ctx) => {
  const auth = await getAuth(ctx.request);
  return { auth };
});

export const Route = createRootRoute({
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
  beforeLoad: async ({ context }) => {
    const { auth } = await fetchClerkAuth();
    return { auth };
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
    <RootDocument>
      <Outlet />
    </RootDocument>
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
        <Scripts />
      </Body>
    </Html>
  );
}
