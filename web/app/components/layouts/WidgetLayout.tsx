import React from "react";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { useMediaQuery } from "@/hooks/useMediaQuery";

interface WidgetLayoutProps {
  preview: React.ReactNode;
  settings: React.ReactNode;
  className?: string;
}

export function WidgetLayout({
  preview,
  settings,
  className,
}: WidgetLayoutProps) {
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  return (
    <div className="min-h-[calc(100vh-var(--header-height)-var(--nav-height))] h-full overflow-auto">
      {isDesktop ? (
        // Desktop layout - horizontal split
        <ResizablePanelGroup
          direction="horizontal"
          className="h-full min-h-full"
        >
          <ResizablePanel
            defaultSize={72}
            minSize={28}
            className="relative min-h-full "
          >
            {preview}
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel
            defaultSize={28}
            minSize={28}
            className="bg-white/40 dark:bg-black/40 min-h-full z-50 relative"
          >
            <div className="h-full flex flex-col min-h-full">
              <h3 className="flex-none text-lg font-bold p-6 pb-2">Settings</h3>
              <div className="flex-1 overflow-y-auto">
                <div className="p-6 pt-2">{settings}</div>
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      ) : (
        // Mobile layout - stacked vertically without resizing
        <div className="flex flex-col min-h-full">
          <div className="flex-1 bg-gradient/5 p-10">{preview}</div>
          <div className="bg-white/5">
            <div className="h-full flex flex-col">
              <h3 className="flex-none text-lg font-bold p-6 pb-2">Settings</h3>
              <div className="flex-1 overflow-y-auto">
                <div className="p-6 pt-2">{settings}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
