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
      category: "Widgets",
      title: "Dashboard",
      description: "Dashboard",
    },
    "/_app/sections/chat": {
      category: "Widgets",
      title: "Chat",
      description: "",
    },
    "/_app/sections/alerts": {
      category: "Widgets",
      title: "Alerts",
      description: "",
    },
    "/_app/sections/stats": {
      category: "Widgets",
      title: "Stats",
      description: "",
    },
    "/_app/sections/visualizer": {
      category: "Widgets",
      title: "Visualizer",
      description: "",
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
