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
}

export function WidgetLayout({ preview, settings }: WidgetLayoutProps) {
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  return (
    <ResizablePanelGroup
      direction={isDesktop ? "horizontal" : "vertical"}
      className="!overflow-visible h-screen"
      onLayout={(sizes: number[]) => {
        // Ensure panels maintain 72/28 ratio on initial load
        if (sizes[0] !== 72 || sizes[1] !== 28) {
          return [72, 28];
        }
        return sizes;
      }}
    >
      <ResizablePanel
        defaultSize={72}
        minSize={50}
        className="relative !overflow-visible bg-gradient/5 lg:flex-row h-full"
      >
        {preview}
      </ResizablePanel>
      {isDesktop && <ResizableHandle withHandle />}
      <ResizablePanel
        defaultSize={28}
        minSize={20}
        className="min-w-[20rem] !overflow-visible rounded-br-3xl bg-gradient/15"
      >
        <div className="flex-grow overflow-hidden flex flex-col">
          <h3 className="text-lg font-bold p-6 pb-2">Settings</h3>
          <div className="flex-grow overflow-y-auto">
            <div className="p-6 pt-2">{settings}</div>
          </div>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
