import React from "react";
import { Outlet } from "@tanstack/react-router";
import { ClientWrapper } from "@/components/ClientWrapper";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useThemeStore } from "@/store/themeStore";
import { AuthWrapper } from "@/components/AuthWrapper";
import { ElysiaSessionProvider } from "@/contexts/ElysiaSessionContext";
import { ElysiaSessionManager } from "@/components/ElysiaSessionManager";
import { CompilerVerification } from "@/components/CompilerVerification";
import { CompilerTest } from "@/components/CompilerTest";
import { CompilerDebug } from "@/components/CompilerDebug";

const queryClient = new QueryClient();

export function LayoutComponent() {
  const { theme } = useThemeStore();

  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <AuthWrapper>
          <ElysiaSessionProvider broadcastChannel="your-broadcast-channel">
            <ClientWrapper>
              <Navigation />
              <Outlet />
              {process.env.NODE_ENV === "development" && <CompilerDebug />}
              <Footer />
              <CompilerTest />
            </ClientWrapper>
            <ElysiaSessionManager />
          </ElysiaSessionProvider>
        </AuthWrapper>
        <CompilerVerification />
      </QueryClientProvider>
    </React.StrictMode>
  );
}
