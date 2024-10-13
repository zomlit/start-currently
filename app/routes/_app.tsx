import { Outlet, createFileRoute } from "@tanstack/react-router";
import { ClientWrapper } from "../components/ClientWrapper";
import { Navigation } from "../components/Navigation";

export const Route = createFileRoute("/_layout copy")({
  component: LayoutComponent,
});

function LayoutComponent() {
  return (
    <ClientWrapper>
      <div className="p-2">
        <Navigation />
        <hr />
        <Outlet />
      </div>
    </ClientWrapper>
  );
}
