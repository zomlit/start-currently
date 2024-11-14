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
    <div className="h-[calc(100vh-var(--header-height)-var(--nav-height))] overflow-hidden">
      <ResizablePanelGroup
        direction={isDesktop ? "horizontal" : "vertical"}
        className="h-full"
        onLayout={(sizes: number[]) => {
          if (sizes[0] !== 72 || sizes[1] !== 28) {
            return [72, 28];
          }
          return sizes;
        }}
      >
        <ResizablePanel
          defaultSize={72}
          minSize={50}
          className="relative bg-gradient/5 lg:flex-row overflow-hidden"
        >
          {preview}
        </ResizablePanel>
        {isDesktop && <ResizableHandle withHandle />}
        <ResizablePanel
          defaultSize={28}
          minSize={20}
          className="min-w-[20rem] rounded-br-3xl bg-gradient/15 overflow-hidden"
        >
          <div className="h-full flex flex-col">
            <h3 className="flex-none text-lg font-bold p-6 pb-2">Settings</h3>
            <div className="flex-1 overflow-y-auto min-h-0">
              <div className="p-6 pt-2">{settings}</div>
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
