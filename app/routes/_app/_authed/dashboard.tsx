import { createFileRoute } from "@tanstack/react-router";
import { Dashboard } from "@/components/Dashboard";

export const Route = createFileRoute("/_app/_authed/dashboard")({
  component: Dashboard,
});
