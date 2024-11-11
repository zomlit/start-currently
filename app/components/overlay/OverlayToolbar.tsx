import React from "react";
import { Button } from "@/components/ui/button";
import { useOverlayStore } from "@/store/overlayStore";

const WIDGET_TYPES = [
  { type: "lyrics", label: "Lyrics" },
  { type: "visualizer", label: "Visualizer" },
  { type: "nowPlaying", label: "Now Playing" },
  { type: "chat", label: "Chat" },
  { type: "alerts", label: "Alerts" },
];

export function OverlayToolbar() {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <div className="p-4 bg-card rounded-lg shadow-lg space-y-2">
      <h3 className="font-semibold mb-4">Widgets</h3>
      <div className="space-y-2">
        {WIDGET_TYPES.map(({ type, label }) => (
          <Button
            key={type}
            variant="outline"
            className="w-full justify-start"
            draggable
            onDragStart={(e) => onDragStart(e, type)}
          >
            {label}
          </Button>
        ))}
      </div>
    </div>
  );
}
