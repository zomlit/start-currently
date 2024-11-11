import React from "react";
import { createFileRoute, Outlet, useMatches } from "@tanstack/react-router";
import DashboardNavigation from "@/components/DashboardNavigation";
import { Container } from "@/components/layout/Container";
import GenericHeader from "@/components/GenericHeader";

export const Route = createFileRoute("/_app/widgets")({
  component: SectionsLayout,
});

function SectionsLayout() {
  const matches = useMatches();
  const currentRoute = matches[matches.length - 1];

  // Define section-specific content
  const sectionContent = {
    "/_app/widgets/visualizer": {
      category: "Widgets",
      title: "Visualizer",
      description: "",
    },
    "/_app/widgets/lyrics": {
      category: "Widgets",
      title: "Lyrics",
      description: "",
    },
    "/_app/widgets/chat": {
      category: "Widgets",
      title: "Chat",
      description: "",
    },
    "/_app/widgets/alerts": {
      category: "Widgets",
      title: "Alerts",
      description: "",
    },
    "/_app/widgets/stats": {
      category: "Widgets",
      title: "Stats",
      description: "",
    },
    "/_app/widgets/gamepad": {
      category: "Widgets",
      title: "Gamepad",
      description: "Track and display your controller inputs in real-time",
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
