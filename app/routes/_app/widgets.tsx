import React from "react";
import { createFileRoute, Outlet, useMatches } from "@tanstack/react-router";
import DashboardNavigation from "@/components/DashboardNavigation";
import { Container } from "@/components/layout/Container";
import GenericHeader from "@/components/GenericHeader";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import { MainNav } from "@/components/Dashboard/MainNav";
import { NavItem, navItems } from "@/config/navigation";

export const Route = createFileRoute("/_app/widgets")({
  component: SectionsLayout,
  options: {
    keepAlive: true,
    backgroundPolling: true,
  },
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

  const sectionContent = {
    "/_app/widgets": {
      category: "Widgets",
      title: "Widget Gallery",
      description: "Browse and manage your stream widgets",
    },
    "/_app/widgets/visualizer": {
      category: "Widgets",
      title: "Visualizer",
      description: "Create dynamic visual effects for your stream",
    },
    "/_app/widgets/lyrics": {
      category: "Widgets",
      title: "Lyrics",
      description: "Display synchronized lyrics during music playback",
    },
    "/_app/widgets/chat": {
      category: "Widgets",
      title: "Chat",
      description: "Customize your stream chat experience",
    },
    "/_app/widgets/alerts": {
      category: "Widgets",
      title: "Alerts",
      description: "Set up and customize stream alerts",
    },
    "/_app/widgets/stats": {
      category: "Widgets",
      title: "Stats",
      description: "Display real-time statistics and metrics",
    },
    "/_app/widgets/gamepad": {
      category: "Widgets",
      title: "Gamepad",
      description: "Show controller inputs and game interactions",
    },
  };

  const content = sectionContent[
    currentRoute.id as keyof typeof sectionContent
  ] || {
    category: "Widgets",
    title: "Widget Gallery",
    description: "Browse and manage your stream widgets",
  };

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
          <MainNav items={navItems as NavItem[]} />
          <div className="mt-4">
            <Outlet />
          </div>
        </Container>
      </main>
    </div>
  );
}
