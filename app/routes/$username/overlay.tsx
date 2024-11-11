import { createFileRoute } from "@tanstack/react-router";
import { PublicOverlayView } from "@/components/PublicOverlayView";

export const Route = createFileRoute("/$username/overlay")({
  component: PublicOverlayView,
});
