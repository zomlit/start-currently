import { Outlet } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_lyrics")({
  component: LyricsLayout,
});

export function LyricsLayout() {
  return <Outlet />;
}
