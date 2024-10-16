import React from "react";
import { Outlet, createFileRoute, useRouter } from "@tanstack/react-router";
import { ClientWrapper } from "@/components/ClientWrapper";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { OptimisticProfileSettingsProvider } from "@/contexts/OptimisticProfileSettingsContext";
export const Route = createFileRoute("/_app")({
  component: LayoutComponent,
});

export const queryClient = new QueryClient();

function LayoutComponent() {
  const router = useRouter();

  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <OptimisticProfileSettingsProvider>
          <ClientWrapper>
            <Navigation />
            <Outlet />
          </ClientWrapper>
        </OptimisticProfileSettingsProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
}
