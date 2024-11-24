import React from "react";
import { VisualizerProfile, VisualizerSettings } from "@/types/visualizer";

interface VisualizerPreviewProps {
  profile: VisualizerProfile;
  userId: string;
  settings: VisualizerSettings;
}

export function VisualizerPreview({
  profile,
  userId,
  settings,
}: VisualizerPreviewProps) {
  const { commonSettings, specificSettings } = settings;

  // Apply the settings to your visualizer canvas/component here
  // This is where you'll implement the actual visualization logic
  // using the settings provided

  return (
    <div
      className="w-full h-full relative"
      style={{
        backgroundColor: commonSettings.backgroundColor,
        color: commonSettings.fontColor,
        fontFamily: `'${commonSettings.fontFamily}', sans-serif`,
        fontSize: `${commonSettings.fontSize}px`,
        lineHeight: commonSettings.lineHeight,
      }}
    >
      {/* Your visualization canvas/component goes here */}
      {/* Apply all the specific settings from specificSettings */}
      <canvas
        className="w-full h-full"
        style={{
          opacity: specificSettings.canvasEnabled ? 1 : 0,
        }}
      />
    </div>
  );
}
