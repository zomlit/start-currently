import React from "react";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useUser } from "@clerk/tanstack-start";
import { useStatsStore } from "@/store/statsStore";
import { StatsSettingsForm } from "@/components/widget-settings/StatsSettingsForm";
import { PublicUrlHeader } from "@/components/widget-settings/PublicUrlHeader";
import { StatsDisplay } from "@/components/stats/StatsDisplay";
import type { StatsSettings } from "@/types/stats";

export const Route = createFileRoute("/_app/widgets/stats")({
  component: StatsPage,
  beforeLoad: ({ context, location }) => {
    return {
      layout: {
        preview: <StatsPreviewSection />,
        settings: <StatsSettingsSection />,
      },
    };
  },
});

function StatsPage() {
  return <Outlet />;
}

function StatsPreviewSection() {
  const { settings } = useStatsStore();

  return (
    <div className="h-full w-full">
      <StatsDisplay settings={settings} />
    </div>
  );
}

function StatsSettingsSection() {
  const { user } = useUser();
  const { settings, updateSettings } = useStatsStore();
  const publicUrl = user?.username
    ? `${window.location.origin}/${user.username}/stats`
    : "";

  const handleSettingsChange = async (newSettings: Partial<StatsSettings>) => {
    if (!user?.id) return;
    await updateSettings(newSettings, user.id);
  };

  const handlePreviewUpdate = (newSettings: Partial<StatsSettings>) => {
    useStatsStore.setState((state) => ({
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
        <StatsSettingsForm
          settings={settings}
          onSettingsChange={handleSettingsChange}
          onPreviewUpdate={handlePreviewUpdate}
        />
      </div>
    </div>
  );
}
