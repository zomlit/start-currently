import { Outlet, createFileRoute } from "@tanstack/react-router";
import { ClientWrapper } from "@/components/ClientWrapper";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";

export const Route = createFileRoute("/_layout")({
  component: LayoutComponent,
});

function LayoutComponent() {
  return (
    <ClientWrapper>
      <Navigation />
      <Outlet />
    </ClientWrapper>
  );
}

if (import.meta.hot) {
  import.meta.hot.accept();
}
