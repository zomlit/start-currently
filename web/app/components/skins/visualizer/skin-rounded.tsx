import { memo } from "react";
import { Visualizer } from "@/components/widget-settings/visualizer/Visualizer";
import { TrackInfo } from "./TrackInfo";
import { TrackProgress } from "./TrackProgress";
import { TrackControls } from "./TrackControls";
import { useCurrentVisualizerProfile } from "@/hooks/useCurrentVisualizerProfile";

interface SkinRoundedProps {
  track?: {
    id: string;
    title: string;
    artist: string;
    artwork?: string;
    progress: number;
    isPlaying: boolean;
    elapsed: number;
    duration: number;
  };
}

export const SkinRounded = memo(function SkinRounded({
  track,
}: SkinRoundedProps) {
  const { profile } = useCurrentVisualizerProfile();
  const { settings } = profile;

  if (!track && settings.functional.behavior.hideWhenPaused) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-4">
        {/* Album Art */}
        <div className="relative aspect-square w-[114px]">
          <Visualizer track={track} className="absolute inset-0" />
          {track?.artwork && (
            <img
              src={track.artwork}
              alt="Album Art"
              className="absolute inset-0 z-10 object-cover"
              style={{
                borderRadius: `${settings.visual.border.radius}px`,
              }}
            />
          )}
        </div>

        {/* Track Info */}
        <div className="flex flex-col justify-between">
          <TrackInfo track={track} settings={settings} />
          <TrackProgress track={track} settings={settings} />
          <TrackControls track={track} settings={settings} />
        </div>
      </div>
    </div>
  );
});
