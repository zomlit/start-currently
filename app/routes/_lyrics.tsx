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
import { ThemeProvider } from "@/components/ThemeProvider";

const queryClient = new QueryClient();

export const Route = createFileRoute("/_lyrics")({
  component: LyricsComponent,
});

function LyricsComponent() {
  const { theme } = useThemeStore();

  return (
    <React.StrictMode>
      <ThemeProvider defaultTheme="dark" storageKey="app-theme">
        <QueryClientProvider client={queryClient}>
          <AuthWrapper>
            <ElysiaSessionProvider broadcastChannel="your-broadcast-channel">
              <OptimisticProfileSettingsProvider
                initialProfileSettings={{
                  commonSettings: {},
                  specificSettings: {},
                }}
              >
                {/* <ClientWrapper> */}
                <Outlet />
                {/* </ClientWrapper> */}
              </OptimisticProfileSettingsProvider>
              {/* <ElysiaSessionManager /> */}
            </ElysiaSessionProvider>
          </AuthWrapper>
        </QueryClientProvider>
      </ThemeProvider>
    </React.StrictMode>
  );
}
