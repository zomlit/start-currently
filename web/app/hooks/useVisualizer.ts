import { useCallback, useEffect, useRef } from "react";
import { useVisualizerProfiles } from "./useVisualizerProfiles";
import { useCurrentVisualizerProfile } from "./useCurrentVisualizerProfile";
import type { VisualizerProfile } from "@/schemas/visualizer";
import { useAudioAnalyzer } from "./useAudioAnalyzer";
import { useDynamicColors } from "./useDynamicColors";

export function useVisualizer(track?: {
  id: string;
  artwork?: string;
  isPlaying: boolean;
}) {
  const { profile } = useCurrentVisualizerProfile();
  const { settings } = profile;
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Audio analysis hook
  const analyzer = useAudioAnalyzer({
    fftSize: settings.functional.audio.fftSize,
    minDecibels: settings.functional.audio.minDecibels,
    maxDecibels: settings.functional.audio.maxDecibels,
    smoothing: settings.functional.visualizer.smoothing,
  });

  // Dynamic colors based on artwork
  const { colors, palette } = useDynamicColors(track?.artwork, {
    enabled: settings.functional.behavior.syncColors,
  });

  // Memoized render function
  const render = useCallback(() => {
    if (!canvasRef.current || !analyzer.dataArray) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Apply visual settings
    const { type, sensitivity, mirror, barSpace } =
      settings.functional.visualizer;

    // Render based on type
    switch (type) {
      case "bar":
        renderBars(ctx, analyzer.dataArray, {
          sensitivity,
          mirror,
          barSpace,
          colors: settings.functional.behavior.syncColors
            ? colors
            : {
                primary: settings.visual.background.color,
                secondary: settings.visual.text.color,
              },
        });
        break;
      // Add other visualization types
    }

    // Request next frame if playing
    if (track?.isPlaying) {
      requestAnimationFrame(render);
    }
  }, [analyzer.dataArray, settings, track?.isPlaying, colors]);

  // Start/stop rendering based on playback
  useEffect(() => {
    if (track?.isPlaying) {
      render();
    }
  }, [track?.isPlaying, render]);

  return {
    canvasRef,
    analyzer,
    colors,
    palette,
    settings,
  };
}

// Optimized bar rendering
function renderBars(
  ctx: CanvasRenderingContext2D,
  dataArray: Uint8Array,
  options: {
    sensitivity: number;
    mirror: number;
    barSpace: number;
    colors: { primary: string; secondary: string };
  }
) {
  const { width, height } = ctx.canvas;
  const barWidth = width / dataArray.length;
  const { sensitivity, mirror, barSpace, colors } = options;

  // Create gradient once
  const gradient = ctx.createLinearGradient(0, height, 0, 0);
  gradient.addColorStop(0, colors.primary);
  gradient.addColorStop(1, colors.secondary);
  ctx.fillStyle = gradient;

  // Batch draw calls for performance
  ctx.beginPath();

  for (let i = 0; i < dataArray.length; i++) {
    const barHeight = (dataArray[i] / 255) * height * sensitivity;
    const x = i * (barWidth + barSpace);
    ctx.rect(x, height - barHeight, barWidth, barHeight);

    if (mirror > 0) {
      ctx.rect(x, 0, barWidth, barHeight * mirror);
    }
  }

  ctx.fill();
}
