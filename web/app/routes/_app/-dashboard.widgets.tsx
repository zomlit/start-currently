import { createFileRoute } from "@tanstack/react-router";
import DashboardWidgets from "@/components/DashboardWidgets";

export const Route = createFileRoute("/_app/dashboard/widgets")({
  component: DashboardWidgets,
});
