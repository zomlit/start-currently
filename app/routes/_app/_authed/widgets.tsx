import { createFileRoute, redirect } from "@tanstack/react-router";
import DashboardWidgets from "@/components/DashboardWidgets";
import { useUser } from "@clerk/clerk-react";
import { Spinner } from "@/components/ui/spinner";

export const Route = createFileRoute("/_app/_authed/widgets")({
  component: WidgetsRoute,
});

function WidgetsRoute() {
  const { isLoaded, isSignedIn, user } = useUser();

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner className="w-8 fill-violet-300 text-white" />
      </div>
    );
  }

  if (!isSignedIn) {
    throw redirect({
      to: "/login",
      search: {
        redirect: "/widgets",
      },
    });
  }

  return <DashboardWidgets userId={user.id} />;
}
