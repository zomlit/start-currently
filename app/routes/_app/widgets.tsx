import React from "react";
import { createFileRoute, Outlet, useMatches } from "@tanstack/react-router";
import DashboardNavigation from "@/components/DashboardNavigation";
import { Container } from "@/components/layout/Container";
import GenericHeader from "@/components/GenericHeader";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import { MainNav } from "@/components/Dashboard/MainNav";
import { navItems } from "@/config/navigation";
import { getSectionContent } from "@/config/widgets";

export const Route = createFileRoute("/_app/widgets")({
  component: SectionsLayout,
  loader: async () => {
    return {
      keepAlive: true,
      backgroundPolling: true,
    };
  },
  preload: true,
});

function SectionsLayout() {
  const matches = useMatches();
  const currentRoute = matches[matches.length - 1];
  const content = getSectionContent(currentRoute.id);

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardNavigation />
      <main className="flex-1">
        <Container maxWidth="7xl" isDashboard>
          <GenericHeader
            category={content.category}
            title={content.title}
            description={content.description}
          />
          <PageBreadcrumb />
          <MainNav items={[...navItems]} />
          <div className="">
            <Outlet />
          </div>
        </Container>
      </main>
    </div>
  );
}
