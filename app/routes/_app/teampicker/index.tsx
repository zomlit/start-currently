import { createFileRoute } from "@tanstack/react-router";
import TeamPicker from "@/components/TeamPicker";

export const Route = createFileRoute("/_app/teampicker/")({
  component: TeamPicker,
});
