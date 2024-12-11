import React from "react";
import type { StatsSettings } from "@/types/stats";

interface StatsDisplayProps {
  settings: StatsSettings;
}

export function StatsDisplay({ settings }: StatsDisplayProps) {
  return (
    <div
      className="h-full w-full flex items-center justify-center"
      style={{
        backgroundColor: settings.backgroundColor,
        padding: settings.padding,
        opacity: settings.opacity / 100,
        border: settings.showBorders
          ? `${settings.borderWidth}px solid ${settings.borderColor}`
          : "none",
        borderRadius: settings.borderRadius,
      }}
    >
      <div
        style={{
          color: settings.textColor,
          fontSize: settings.fontSize,
          fontFamily: settings.fontFamily,
        }}
      >
        <h2 className="text-2xl font-bold">Stats Preview</h2>
        {/* Add your stats display content here */}
      </div>
    </div>
  );
}
