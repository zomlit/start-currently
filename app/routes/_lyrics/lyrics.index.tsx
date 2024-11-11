import { createFileRoute } from "@tanstack/react-router";
import { LyricsPage } from "@/components/lyrics/LyricsPage";

export const Route = createFileRoute("/_lyrics/lyrics/")({
  component: LyricsPage,
});
