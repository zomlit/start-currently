import React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { WidgetLayout } from "@/components/layouts/WidgetLayout";
import { WidgetAuthGuard } from "@/components/auth/WidgetAuthGuard";

export const Route = createFileRoute("/_app/widgets/stats")({
  component: () => (
    <WidgetAuthGuard>
      <StatsSection />
    </WidgetAuthGuard>
  ),
});

function StatsSection() {
  const StatsPreview = (
    <div className="h-full w-full flex items-center justify-center">
      <h2 className="text-2xl font-bold text-gray-400">Stats Preview</h2>
    </div>
  );

  const StatsSettings = (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Stats Settings</h3>
      {/* Add stats settings controls here */}
    </div>
  );

  return <WidgetLayout preview={StatsPreview} settings={StatsSettings} />;
}
