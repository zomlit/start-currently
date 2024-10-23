import React from "react";
import { createFileRoute, Outlet, useMatches } from "@tanstack/react-router";
import DashboardNavigation from "@/components/DashboardNavigation";
import { Container } from "@/components/layout/Container";
import GenericHeader from "@/components/GenericHeader";

export const Route = createFileRoute("/_app/sections")({
  component: SectionsLayout,
});

function SectionsLayout() {
  const matches = useMatches();
  const currentRoute = matches[matches.length - 1];

  // Define section-specific content
  const sectionContent = {
    "/_app/sections/": {
      category: "Sections",
      title: "Dashboard",
      description: "Welcome to your sections dashboard",
    },
    "/_app/sections/chat": {
      category: "Sections",
      title: "Chat",
      description: "Manage your chat interactions",
    },
    "/_app/sections/alerts": {
      category: "Sections",
      title: "Alerts",
      description: "View and manage your alerts",
    },
    "/_app/sections/stats": {
      category: "Sections",
      title: "Stats",
      description: "Analyze your statistics",
    },
    "/_app/sections/visualizer": {
      category: "Sections",
      title: "Visualizer",
      description: "Visualize your data",
    },
  };

  const content = sectionContent[
    currentRoute.id as keyof typeof sectionContent
  ] || {
    category: "Sections",
    title: "Unknown Section",
    description: "Section not found",
  };

  return (
    <div className="">
      <DashboardNavigation />
      <main className="">
        <Container maxWidth="7xl" isDashboard>
          <GenericHeader
            category={content.category}
            title={content.title}
            description={content.description}
          />
          <Outlet />
        </Container>
      </main>
    </div>
  );
}
