import React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { WidgetLayout } from "@/components/layouts/WidgetLayout";
import { WidgetAuthGuard } from "@/components/auth/WidgetAuthGuard";

export const Route = createFileRoute("/_app/widgets/alerts")({
  component: () => (
    <WidgetAuthGuard>
      <AlertsSection />
    </WidgetAuthGuard>
  ),
});

function AlertsSection() {
  const AlertsPreview = (
    <div className="h-full w-full flex items-center justify-center">
      <h2 className="text-2xl font-bold text-gray-400">Alerts Preview</h2>
    </div>
  );

  const AlertsSettings = (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Alert Settings</h3>
      {/* Add alert settings controls here */}
    </div>
  );

  return <WidgetLayout preview={AlertsPreview} settings={AlertsSettings} />;
}
