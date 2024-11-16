import { NowPlayingDisplay } from "./NowPlayingDisplay";
import { WidgetPreview } from "@/components/widget-preview";
import type { VisualizerProfile } from "@/types/visualizer";
import { useDatabaseStore } from "@/store/supabaseCacheStore";
import type { SpotifyTrack } from "@/types/spotify";

interface VisualizerPreviewProps {
  profile: VisualizerProfile;
  userId: string;
}

export function VisualizerPreview({ profile, userId }: VisualizerPreviewProps) {
  const currentTrack = useDatabaseStore((state) => state.currentTrack);

  return (
    <div className="h-full w-full">
      <WidgetPreview
        currentProfile={profile}
        selectedWidget="visualizer"
        initialTrack={currentTrack as SpotifyTrack}
        userId={userId}
      />
      <NowPlayingDisplay />
    </div>
  );
}
