import React from "react";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { Spinner } from "@/components/ui/spinner";

interface WidgetLayoutProps {
  preview: React.ReactNode;
  settings: React.ReactNode;
  className?: string;
  isLoading?: boolean;
}

export function WidgetLayout({
  preview,
  settings,
  className,
  isLoading = false,
}: WidgetLayoutProps) {
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  return (
    <div className="min-h-[calc(100vh-var(--header-height)-var(--nav-height))] h-full overflow-auto">
      {isDesktop ? (
        <ResizablePanelGroup
          direction="horizontal"
          className="h-full min-h-full"
        >
          <ResizablePanel
            defaultSize={72}
            minSize={28}
            className="relative min-h-full"
          >
            {preview}
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel
            defaultSize={28}
            minSize={28}
            className="bg-white/40 dark:bg-black/40 min-h-full z-50 relative overflow-visible"
          >
            <div className="h-full flex flex-col min-h-full">
              <div className="flex-1 overflow-y-auto">
                <div className="p-6">
                  {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <Spinner className="w-[30px] h-[30px] dark:fill-white" />
                    </div>
                  ) : (
                    settings
                  )}
                </div>
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      ) : (
        <div className="flex flex-col min-h-full">
          <div className="flex-1 bg-gradient/5 p-10">{preview}</div>
          <div className="bg-white/5">
            <div className="h-full flex flex-col">
              <div className="flex-1 overflow-y-auto">
                <div className="p-6">
                  {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <Spinner className="w-[30px] h-[30px] dark:fill-white" />
                    </div>
                  ) : (
                    settings
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
