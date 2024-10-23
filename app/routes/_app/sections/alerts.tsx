import React from "react";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/sections/alerts")({
  component: AlertsSection,
});

function AlertsSection() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Alerts Section</h2>
      <p>Manage and view your alerts here.</p>
    </div>
  );
}
