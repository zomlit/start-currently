import { createFileRoute } from "@tanstack/react-router";
import { PublicGamepadView } from "@/components/PublicGamepadView";

export const Route = createFileRoute("/$username/gamepad")({
  component: PublicGamepadView,
  options: {
    keepAlive: true,
    backgroundPolling: true,
  },
  loader: async () => {
    return {
      keepAlive: true,
      backgroundPolling: true,
    };
  },
  preload: true,
});
