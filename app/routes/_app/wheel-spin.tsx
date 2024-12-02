import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";

export const Route = createFileRoute("/_app/wheel-spin")({
  component: WheelSpinPage,
});

function WheelSpinPage() {
  return <DashboardLayout hideNav>{/* Wheel spin content */}</DashboardLayout>;
}
