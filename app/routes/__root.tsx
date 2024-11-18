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

// Import CSS directly
import "@/styles/app.css";

export const Route = createRootRoute({
  component: RootComponent,
  beforeLoad: async () => {
    return {};
  },
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
  errorComponent: DefaultCatchBoundary,
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

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html>
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
