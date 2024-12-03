import { createFileRoute } from "@tanstack/react-router";
import { Dashboard } from "@/components/Dashboard";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { HorizontalNav } from "@/components/navigation/HorizontalNav";

export const Route = createFileRoute("/_app/_authed/dashboard")({
  component: DashboardWithLayout,
});

function DashboardWithLayout() {
  return (
    <DashboardLayout>
      <Dashboard />
    </DashboardLayout>
  );
}
