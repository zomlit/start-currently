import React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@clerk/tanstack-start";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { WidgetLayout } from "@/components/layouts/WidgetLayout";
import { useQueryClient } from "@tanstack/react-query";
import { useProfile, useProfiles } from "@/hooks/useProfile";
import { useVisualizerStore } from "@/store/visualizerStore";
import { VisualizerSettings } from "@/components/widget-settings/visualizer/VisualizerSettings";
import { VisualizerPreview } from "@/components/widget-settings/visualizer/VisualizerPreview";
import { CreateProfileDialog } from "@/components/widget-settings/visualizer/CreateProfileDialog";
import type { VisualizerProfile } from "@/types/visualizer";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { LiveStatusCard } from "@/components/widget-settings/visualizer/LiveStatusCard";

export const Route = createFileRoute("/_app/widgets/visualizer")({
  component: () => (
    <ErrorBoundary>
      <VisualizerPage />
    </ErrorBoundary>
  ),
});

function VisualizerPage() {
  const { userId, isLoaded } = useAuth();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const { selectedProfileId, setSelectedProfileId } = useVisualizerStore();

  const {
    data: profiles = [],
    isLoading: isProfilesLoading,
    error: profilesError,
  } = useProfiles("visualizer", {
    onSuccess: (data: VisualizerProfile[]) => {
      if (data.length > 0 && !selectedProfileId) {
        const defaultProfile = data.find((p) => p.settings.isDefault);
        setSelectedProfileId(defaultProfile?.id || data[0].id);
      }
    },
  });

  const { data: profile, isLoading: isProfileLoading } = useProfile(
    "visualizer",
    selectedProfileId
  );

  // Loading state
  if (!isLoaded || isProfilesLoading || isProfileLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner className="h-8 w-8 animate-spin text-violet-500" />
      </div>
    );
  }

  // Auth check
  if (!userId) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Please sign in to access the visualizer settings
        </p>
      </div>
    );
  }

  // Error state
  if (profilesError) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4">
        <p className="text-red-500">
          Error loading profiles: {profilesError.message}
        </p>
        <Button
          onClick={() =>
            queryClient.invalidateQueries({
              queryKey: ["profiles", "visualizer"],
            })
          }
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <>
      <WidgetLayout
        preview={
          <VisualizerPreview
            profile={profile as VisualizerProfile}
            userId={userId}
          />
        }
        settings={
          <VisualizerSettings
            profile={profile}
            profiles={profiles}
            onOpenAddDialog={() => setIsAddDialogOpen(true)}
          />
        }
      />
      <CreateProfileDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
      />
    </>
  );
}
