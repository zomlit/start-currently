import {
  Outlet,
  ScrollRestoration,
  createRootRoute,
} from "@tanstack/react-router";
import { Meta, Scripts } from "@tanstack/start";
import { ClerkProvider } from "@clerk/tanstack-start";
import { useThemeStore } from "@/store/themeStore";
import { dark } from "@clerk/themes";
import { seo } from "@/utils/seo";
import { AccessControl } from "@/components/AccessControl";
import { DefaultCatchBoundary } from "@/components/DefaultCatchBoundary";
import { NotFound } from "@/components/NotFound";
import type { ReactNode } from "react";

// Import CSS files
import "@/styles/app.css";
import "@/styles/gamepad.css";

export const Route = createRootRoute({
  head: () => {
    return {
      links: [
        {
          rel: "icon",
          href: "/favicon.ico",
        },
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
    };
  },

  beforeLoad: async () => {
    return {};
  },

  errorComponent: DefaultCatchBoundary,
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
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
      </head>
      <body className="min-h-screen font-sofia antialiased">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
