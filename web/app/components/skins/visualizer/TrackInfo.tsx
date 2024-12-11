import { memo } from "react";
import type { VisualizerProfile } from "@/schemas/visualizer";

interface TrackInfoProps {
  track?: {
    title: string;
    artist: string;
  };
  settings: VisualizerProfile["settings"];
}

export const TrackInfo = memo(function TrackInfo({
  track,
  settings,
}: TrackInfoProps) {
  const { text } = settings.visual;

  return (
    <div className="flex flex-col">
      <h2
        className="truncate text-lg font-medium"
        style={{ fontSize: text.size }}
      >
        {track?.title || "Not Playing"}
      </h2>
      <p className="truncate text-sm opacity-80">
        {track?.artist || "Unknown Artist"}
      </p>
    </div>
  );
});
