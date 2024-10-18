import React from "react";
import { Outlet, createFileRoute, useRouter } from "@tanstack/react-router";
import { ClientWrapper } from "@/components/ClientWrapper";
import { Navigation } from "@/components/Navigation";
import { Toaster } from "sonner";
import { Footer } from "@/components/Footer";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useThemeStore } from "@/store/themeStore";
import { OptimisticProfileSettingsProvider } from "@/contexts/OptimisticProfileSettingsContext";

export const Route = createFileRoute("/_app")({
  component: LayoutComponent,
});

export const queryClient = new QueryClient();

function LayoutComponent() {
  const { theme } = useThemeStore();

  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <OptimisticProfileSettingsProvider
          initialProfileSettings={{ commonSettings: {}, specificSettings: {} }}
        >
          <ClientWrapper>
            <Navigation />
            <Outlet />
            <Toaster theme={theme === "system" ? undefined : theme} />
          </ClientWrapper>
        </OptimisticProfileSettingsProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
}
