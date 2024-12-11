import React from "react";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useUser } from "@clerk/tanstack-start";
import { useAlertsStore } from "@/store/alertsStore";
import { AlertsSettingsForm } from "@/components/widget-settings/AlertsSettingsForm";
import { PublicUrlHeader } from "@/components/widget-settings/PublicUrlHeader";
import { AlertsDisplay } from "@/components/alerts/AlertsDisplay";
import type { AlertsSettings } from "@/types/alerts";

export const Route = createFileRoute("/_app/widgets/alerts")({
  component: AlertsPage,
  beforeLoad: ({ context, location }) => {
    return {
      layout: {
        preview: <AlertsPreviewSection />,
        settings: <AlertsSettingsSection />,
      },
    };
  },
});

function AlertsPage() {
  return <Outlet />;
}

function AlertsPreviewSection() {
  const { settings } = useAlertsStore();

  return (
    <div className="h-full w-full">
      <AlertsDisplay settings={settings} />
    </div>
  );
}

function AlertsSettingsSection() {
  const { user } = useUser();
  const { settings, updateSettings } = useAlertsStore();
  const publicUrl = user?.username
    ? `${window.location.origin}/${user.username}/alerts`
    : "";

  const handleSettingsChange = async (newSettings: Partial<AlertsSettings>) => {
    if (!user?.id) return;
    await updateSettings(newSettings, user.id);
  };

  const handlePreviewUpdate = (newSettings: Partial<AlertsSettings>) => {
    useAlertsStore.setState((state) => ({
      settings: {
        ...state.settings,
        ...newSettings,
      },
    }));
  };

  return (
    <div className="flex flex-col">
      <PublicUrlHeader publicUrl={publicUrl} />
      <div className="flex-1">
        <AlertsSettingsForm
          settings={settings}
          onSettingsChange={handleSettingsChange}
          onPreviewUpdate={handlePreviewUpdate}
        />
      </div>
    </div>
  );
}
