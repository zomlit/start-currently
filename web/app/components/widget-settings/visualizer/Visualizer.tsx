import { memo } from "react";
import { useVisualizer } from "@/hooks/useVisualizer";
import { cn } from "@/lib/utils";

interface VisualizerProps {
  track?: {
    id: string;
    artwork?: string;
    isPlaying: boolean;
  };
  className?: string;
}

export const Visualizer = memo(function Visualizer({
  track,
  className,
}: VisualizerProps) {
  const { canvasRef, settings } = useVisualizer(track);

  const {
    background: { opacity },
    border: { radius },
  } = settings.visual;

  return (
    <div
      className={cn("relative w-full overflow-hidden", className)}
      style={{
        borderRadius: `${radius}px`,
        opacity,
      }}
    >
      <canvas
        ref={canvasRef}
        className="h-full w-full"
        style={{
          imageRendering: "pixelated",
        }}
      />
    </div>
  );
});
