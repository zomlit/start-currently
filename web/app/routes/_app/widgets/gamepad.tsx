import { createFileRoute } from "@tanstack/react-router";
import { WidgetAuthGuard } from "@/components/auth/WidgetAuthGuard";
import { GamepadSection } from "@/components/gamepad/GamepadSection";

export const Route = createFileRoute("/_app/widgets/gamepad")({
  component: () => (
    <WidgetAuthGuard>
      <GamepadSection />
    </WidgetAuthGuard>
  ),
});
