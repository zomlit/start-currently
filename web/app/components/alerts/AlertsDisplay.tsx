import React from "react";
import type { AlertsSettings } from "@/types/alerts";

interface AlertsDisplayProps {
  settings: AlertsSettings;
}

export function AlertsDisplay({ settings }: AlertsDisplayProps) {
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
        <h2 className="text-2xl font-bold">Alerts Preview</h2>
        <div className="mt-4 space-y-4">
          <div className="text-center">
            <p>Animation Duration: {settings.animationDuration}ms</p>
            <p>Sound {settings.soundEnabled ? "Enabled" : "Disabled"}</p>
            {settings.soundEnabled && <p>Volume: {settings.soundVolume}%</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
