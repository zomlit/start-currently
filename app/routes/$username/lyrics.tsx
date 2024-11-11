import React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PublicLyricsPage } from "@/components/PublicLyricsPage";

export const Route = createFileRoute("/$username/lyrics")({
  component: PublicLyricsPage,
});
