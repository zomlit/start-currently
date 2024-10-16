import React from "react";
import { Outlet, createFileRoute, useRouter } from "@tanstack/react-router";
import { ClientWrapper } from "../components/ClientWrapper";
import { Navigation } from "../components/Navigation";
import { Footer } from "../components/Footer";
import { CustomClerkProvider } from "@/contexts/ClerkContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export const Route = createFileRoute("/_app")({
  component: LayoutComponent,
});

const queryClient = new QueryClient();

function LayoutComponent() {
  const router = useRouter();

  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <CustomClerkProvider navigate={(to) => router.navigate(to)}>
          <ClientWrapper>
            <Navigation />
            <Outlet />
          </ClientWrapper>
        </CustomClerkProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
}
