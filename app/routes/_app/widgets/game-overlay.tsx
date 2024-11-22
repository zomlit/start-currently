import { createFileRoute } from "@tanstack/react-router";
import { GameOverlaySection } from "@/components/GameOverlaySection";

export const Route = createFileRoute("/_app/widgets/game-overlay")({
  component: GameOverlaySection,
  loader: async () => {
    return {
      keepAlive: true,
      backgroundPolling: true,
    };
  },
  preload: true,
});
