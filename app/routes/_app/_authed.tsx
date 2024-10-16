import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import DashboardNavigation from "../../components/DashboardNavigation";

export const Route = createFileRoute("/_app/_authed")({
  component: AuthedLayout,
  beforeLoad: ({ context }) => {
    if (!context.auth?.userId) {
      throw redirect({
        to: "/sign-in/$",
        search: {
          redirect: location.pathname + location.search,
        },
      });
    }
  },
});

function AuthedLayout() {
  return (
    <>
      <DashboardNavigation />
      <Outlet />
    </>
  );
}
