import {
  Outlet,
  ScrollRestoration,
  createRootRoute,
  useRouter,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import {
  Body,
  Head,
  Html,
  Meta,
  Scripts,
  createServerFn,
} from "@tanstack/start";
import "@fontsource-variable/sofia-sans-condensed";
import * as React from "react";
import { DefaultCatchBoundary } from "../components/DefaultCatchBoundary";
import { NotFound } from "../components/NotFound";
import { seo } from "../utils/seo";
import { getAuth } from "@clerk/tanstack-start/server";
import appCss from "../styles/app.css?url";
import { CustomClerkProvider } from "../contexts/ClerkContext";

const coreCSS = `
  body {
    background-color: hsl(20 14.3% 4.1%);
  }
`;

const fetchClerkAuth = createServerFn("GET", async (_, ctx) => {
  const user = await getAuth(ctx.request);
  return { user };
});

export const Route = createRootRoute({
  meta: () => [
    { charSet: "utf-8" },
    { name: "viewport", content: "width=device-width, initial-scale=1" },
    ...seo({
      title:
        "TanStack Start | Type-Safe, Client-First, Full-Stack React Framework",
      description:
        "TanStack Start is a type-safe, client-first, full-stack React framework.",
    }),
  ],
  links: () => [
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
  ],
  beforeLoad: async () => {
    const { user } = await fetchClerkAuth();
    return { user };
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
  const router = useRouter();

  return (
    <CustomClerkProvider navigate={(to) => router.navigate(to)}>
      <RootDocument>
        <Outlet />
      </RootDocument>
    </CustomClerkProvider>
  );
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <Html className="bg-red-500">
      <Head>
        {/* <style dangerouslySetInnerHTML={{ __html: coreCSS }} /> */}
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
