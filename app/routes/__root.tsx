import globalStyle from "@/styles/global.css?url";

import {
  createRootRouteWithContext,
  Outlet,
  ScrollRestoration,
} from "@tanstack/react-router";
import { Meta, Scripts } from "@tanstack/start";
import type { ErrorComponentProps } from "@tanstack/react-router";
import type { PropsWithChildren } from "react";
import { RouterContext } from "@/lib/router";
import { ClerkProvider } from "@clerk/tanstack-start";

export const Route = createRootRouteWithContext<RouterContext>()({
  meta: () => [
    ...createMetadata({
      charSet: "utf-8",
      viewport: "width=device-width, initial-scale=1",
      title: "TanStack Boilerplate",
      description:
        "A fully type-safe boilerplate with a focus on UX and DX, complete with multiple examples.",
      robots: "index, follow",
    }),
  ],
  // TODO: dynamic import font depending on locale
  // https://github.com/TanStack/router/pull/2571
  links: () => [
    {
      rel: "icon",
      href: "/favicon.ico",
    },
    {
      rel: "stylesheet",
      href: fontsourceInter,
    },
    {
      rel: "stylesheet",
      href: fontsourceNotoSansTC,
    },
    {
      rel: "stylesheet",
      href: globalStyle,
    },
  ],
  // https://github.com/TanStack/router/issues/1992#issuecomment-2397896356
  // 2024-11-15: I think HMR is fixed?
  scripts: () =>
    import.meta.env.PROD
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
  component: RootComponent,
  errorComponent: ErrorComponent,
  pendingComponent: PendingComponent,
  notFoundComponent: NotFoundComponent,
});

function RootComponent() {
  return (
    <ClerkProvider
      appearance={{
        variables: {
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
        <div className="flex h-full flex-col">
          <div className="flex h-full flex-1 flex-col items-center px-2">
            <Outlet />
          </div>
        </div>
      </RootDocument>
    </ClerkProvider>
  );
}

function PendingComponent() {
  return <div className="space-y-6 p-6"></div>;
}

function ErrorComponent({ error }: ErrorComponentProps) {
  return (
    <RootDocument>
      <div className="space-y-6 p-6">
        <p className="text-destructive">{error.message}</p>
      </div>
    </RootDocument>
  );
}

function NotFoundComponent() {
  return <div className="space-y-6"></div>;
}

function RootDocument({ children }: PropsWithChildren) {
  return (
    <html suppressHydrationWarning>
      <head>
        <Meta />
      </head>
      <body>
        {children}

        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
