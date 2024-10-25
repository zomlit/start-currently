import React, { useEffect } from "react";
import { Outlet, createFileRoute, useNavigate } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useThemeStore } from "@/store/themeStore";
import { OptimisticProfileSettingsProvider } from "@/contexts/OptimisticProfileSettingsContext";
import { AuthWrapper } from "@/components/AuthWrapper";
import { ElysiaSessionProvider } from "@/contexts/ElysiaSessionContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import { useAuth } from "@clerk/tanstack-start";

const queryClient = new QueryClient();

export const Route = createFileRoute("/_lyrics")({
  component: LyricsComponent,
});

function LyricsComponent() {
  const { theme } = useThemeStore();
  const { userId, isLoaded } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  useEffect(() => {
    if (isLoaded && !userId) {
      // User is not logged in, redirect to sign-in or sign-up
      navigate({ to: "/sign-in" });
    }
  }, [isLoaded, userId, navigate]);

  if (!isLoaded || !userId) {
    return null; // Or a loading spinner
  }

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
                <div style={{ height: "100vh", overflow: "hidden" }}>
                  <Outlet />
                </div>
              </OptimisticProfileSettingsProvider>
            </ElysiaSessionProvider>
          </AuthWrapper>
        </QueryClientProvider>
      </ThemeProvider>
    </React.StrictMode>
  );
}
