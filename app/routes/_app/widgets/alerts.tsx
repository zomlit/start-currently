import React from "react";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/widgets/alerts")({
  component: AlertsSection,
});

function AlertsSection() {
  return <div>Alerts</div>;
}
