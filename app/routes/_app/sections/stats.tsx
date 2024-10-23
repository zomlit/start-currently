import React from "react";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/sections/stats")({
  component: StatsSection,
});

function StatsSection() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Stats Section</h2>
      <p>View and analyze your statistics here.</p>
    </div>
  );
}
