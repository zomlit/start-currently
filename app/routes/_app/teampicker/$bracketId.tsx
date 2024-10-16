import React from "react";
import { createFileRoute } from "@tanstack/react-router";
import SharedTeamPicker from "@/components/SharedTeamPicker";

export const Route = createFileRoute("/_app/teampicker/$bracketId")({
  component: SharedTeamPickerPage,
});

function SharedTeamPickerPage() {
  const { bracketId } = Route.useParams();
  return <SharedTeamPicker bracketId={bracketId} />;
}
