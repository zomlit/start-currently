import { createFileRoute, Outlet, useMatches } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import GenericHeader from "@/components/GenericHeader";
import { getSectionContent } from "@/config/widgets";
import { HorizontalNav } from "@/components/navigation/HorizontalNav";

export const Route = createFileRoute("/_app/widgets")({
  component: SectionsLayout,
});

function SectionsLayout() {
  const matches = useMatches();
  const currentRoute = matches[matches.length - 1];
  const content = getSectionContent(currentRoute.id);

  return (
    <DashboardLayout>
      <GenericHeader
        category={content.category}
        title={content.title}
        description={content.description}
      />
      <div className="">
        <Outlet />
      </div>
    </DashboardLayout>
  );
}
