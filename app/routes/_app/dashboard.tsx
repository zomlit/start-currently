import { createFileRoute } from "@tanstack/react-router";
import { MainNav } from "@/components/Dashboard/MainNav";
import { navItems } from "@/config/navigation";
import DashboardNavigation from "@/components/DashboardNavigation";
import { Container } from "@/components/layout/Container";
import GenericHeader from "@/components/GenericHeader";

export const Route = createFileRoute("/_app/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  return (
    <>
      <DashboardNavigation />
      <Container isDashboard maxWidth="7xl">
        <GenericHeader
          category="Widgets"
          title="Dashboard"
          description=""
          keyModalText=""
          buttonUrl={``}
          buttonText=""
          backText=""
        />
        <MainNav items={navItems} />
        {/* ... rest of the component ... */}
      </Container>
    </>
  );
}
