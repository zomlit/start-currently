import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import GenericHeader from "@/components/GenericHeader";

export const Route = createFileRoute("/_app/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  return (
    <DashboardLayout>
      <GenericHeader category="Widgets" title="Dashboard" description="" />
      <div className="">{/* Dashboard content */}</div>
    </DashboardLayout>
  );
}
