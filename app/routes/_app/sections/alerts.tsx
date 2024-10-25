import React from "react";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/sections/alerts")({
  component: AlertsSection,
});

function AlertsSection() {
  return <div></div>;
}
