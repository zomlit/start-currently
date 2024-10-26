import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/$username")({
  component: UsernameLayout,
});

function UsernameLayout() {
  return (
    <div>
      <Outlet />
    </div>
  );
}
