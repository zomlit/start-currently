import React from "react";
import { Outlet, createFileRoute } from "@tanstack/react-router";
import { ClientWrapper } from "@/components/ClientWrapper";
import { Navigation } from "@/components/Navigation";
import { Toaster } from "sonner";
import { Footer } from "@/components/Footer";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useThemeStore } from "@/store/themeStore";
import { OptimisticProfileSettingsProvider } from "@/contexts/OptimisticProfileSettingsContext";
import { AuthWrapper } from "@/components/AuthWrapper";
import { ElysiaSessionProvider } from "@/contexts/ElysiaSessionContext";
import { ElysiaSessionManager } from "@/components/ElysiaSessionManager";

const queryClient = new QueryClient();

export const Route = createFileRoute("/_app")({
  component: LayoutComponent,
});

function LayoutComponent() {
  const { theme } = useThemeStore();

  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <AuthWrapper>
          <ElysiaSessionProvider broadcastChannel="your-broadcast-channel">
            <OptimisticProfileSettingsProvider
              initialProfileSettings={{
                commonSettings: {},
                specificSettings: {},
              }}
            >
              <ClientWrapper>
                <Navigation />
                <Outlet />
                <Footer />
              </ClientWrapper>
            </OptimisticProfileSettingsProvider>
            <ElysiaSessionManager />
          </ElysiaSessionProvider>
        </AuthWrapper>
      </QueryClientProvider>
    </React.StrictMode>
  );
}
