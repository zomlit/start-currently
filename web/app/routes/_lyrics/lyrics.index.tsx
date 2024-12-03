import { createFileRoute } from "@tanstack/react-router";
import { PublicLyricsPage } from "@/components/PublicLyricsPage";

export const Route = createFileRoute("/_lyrics/lyrics/")({
  component: PublicLyricsPage,
});
