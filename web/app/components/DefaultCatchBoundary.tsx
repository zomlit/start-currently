import { useRouter } from "@tanstack/react-router";
import type { ErrorComponentProps } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  Home,
  RefreshCw,
  Copy,
  MessageSquare,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { ClientWrapper } from "@/components/ClientWrapper";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Toaster } from "sonner";
import { useMemo, useCallback } from "react";
import { CircleDot } from "@/components/icons";
import { toast } from "@/utils/toast";
import { Input } from "@/components/ui/input";
import { MainLayout } from "@/components/layouts/MainLayout";

export function DefaultCatchBoundary({ error, reset }: ErrorComponentProps) {
  const router = useRouter();

  const errorDetails = useMemo(() => {
    if (!(error instanceof Error)) {
      return {
        message: "An unknown error occurred",
        stack: "",
        isHookError: false,
        isHmrError: false,
        isHydrationError: false,
      };
    }

    const isHookError = error.message.includes(
      "Rendered more hooks than during the previous render"
    );
    const isHmrError = error.message.includes("server.hmr.overlay");
    const isHydrationError = error.message.includes("Hydration failed");

    let friendlyMessage = error.message;

    if (isHydrationError) {
      friendlyMessage = "A page loading error occurred. Please try refreshing.";
    } else if (isHookError) {
      friendlyMessage =
        "A React rendering error occurred. Please try refreshing the page.";
    } else if (isHmrError) {
      friendlyMessage = `${error.message}\n\nTip: You can disable this overlay by adding this to your vite.config.ts:\n\nserver: {\n  hmr: {\n    overlay: false\n  }\n}`;
    }

    return {
      message: friendlyMessage,
      stack: error.stack || "",
      isHookError,
      isHmrError,
      isHydrationError,
    };
  }, [error]);

  const formatStackLine = (line: string) => {
    // Color "at" statements
    line = line.replace(
      /(at )([^(]+)( \()?/g,
      '<span class="text-zinc-500">$1</span><span class="text-blue-400">$2</span>$3'
    );

    // Color file paths
    line = line.replace(
      /([a-zA-Z0-9_-]+\.[a-zA-Z]+:\d+:\d+)/g,
      '<span class="text-yellow-300">$1</span>'
    );

    // Color function calls
    line = line.replace(
      /([a-zA-Z0-9_$.]+)(\()/g,
      '<span class="text-pink-400">$1</span>$2'
    );

    // Color parentheses and special characters
    line = line.replace(
      /([(){}[\]])/g,
      '<span class="text-zinc-600">$1</span>'
    );

    return line;
  };

  const copyErrorDetails = useCallback(async () => {
    try {
      const errorText = `Error: ${errorDetails.message}\n\n${
        errorDetails.stack ? `Stack Trace:\n${errorDetails.stack}` : ""
      }`;

      await navigator.clipboard.writeText(errorText);
      toast.success("Error details copied to clipboard");
    } catch (err) {
      toast.error("Failed to copy error details");
    }
  }, [errorDetails]);

  return (
    <MainLayout>
      <ClientWrapper>
        <div className="flex min-h-[calc(100vh-var(--nav-height)-var(--footer-height))] flex-col items-center justify-center p-4 my-8 ">
          <Card className="w-full max-w-3xl bg-white/5 border-none shadow-2xl backdrop-blur-sm p-6">
            <CardContent className="pt-6">
              <div className="flex flex-col items-start gap-4">
                <div className="w-full flex flex-col items-center">
                  <div className="relative rounded-full p-3 animate-pulse">
                    <CircleDot className="h-12 w-12 text-pink-500 fill-pink-500 drop-shadow-[0_0_10px_rgba(236,72,153,0.7)] animate-glow" />

                    <div className="absolute inset-0 rounded-full">
                      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-pink-500/30 to-violet-500/30 blur-xl animate-pulse" />
                      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-pink-500/20 to-violet-500/20 blur-2xl animate-pulse delay-75" />
                      <div className="absolute inset-0 rounded-full border-2 border-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.7)] animate-pulse delay-150" />
                    </div>
                  </div>

                  <h1 className="text-3xl font-bold tracking-tight text-center mt-8">
                    Oops! Something went wrong
                  </h1>
                </div>

                <div className="w-full">
                  <div className="bg-zinc-950/80 rounded-lg border border-zinc-800">
                    <div className="flex items-center border-b border-zinc-800 px-4 py-2">
                      <div
                        className="relative text-lg text-red-400 uppercase font-black mr-2"
                        style={{ pointerEvents: "none" }}
                      >
                        Error:
                      </div>
                      <Input
                        value={errorDetails.message}
                        readOnly
                        onClick={(e: any) => {
                          e.currentTarget.select();
                          navigator.clipboard.writeText(errorDetails.message);
                          toast.success("Error message copied to clipboard");
                        }}
                        className="flex-1 p-0 font-mono text-sm bg-transparent border-none ring-0 ring-offset-0 focus:ring-0 focus:ring-offset-0 focus:outline-none focus:border-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none focus-visible:border-none hover:outline-none hover:ring-0 hover:ring-offset-0 active:outline-none active:ring-0 active:ring-offset-0 cursor-pointer rounded-none [&::selection]:bg-violet-500/50"
                        style={{ color: "#facc15" }} // yellow-400
                      />

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 shrink-0 hover:bg-zinc-800 ml-2"
                        onClick={copyErrorDetails}
                      >
                        <Copy className="h-3.5 w-3.5 text-zinc-400" />
                      </Button>
                    </div>
                    <div className="pl-4 space-y-4">
                      {process.env.NODE_ENV === "development" &&
                        errorDetails.stack &&
                        !errorDetails.isHookError && (
                          <pre className="text-xs font-mono text-zinc-400 whitespace-pre-wrap break-words border-zinc-800 pt-4 max-h-[300px] overflow-y-auto scrollbar scrollbar-w-2 scrollbar-track-transparent scrollbar-thumb-zinc-700/30 hover:scrollbar-thumb-zinc-700/50">
                            {errorDetails.stack.split("\n").map((line, i) => (
                              <div
                                key={i}
                                className="py-0.5"
                                dangerouslySetInnerHTML={{
                                  __html: formatStackLine(line),
                                }}
                              />
                            ))}
                          </pre>
                        )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex justify-center gap-4 pb-6">
              {errorDetails.isHookError ? (
                <Button
                  variant="secondary"
                  onClick={() => {
                    toast.info("Refreshing page...");
                    setTimeout(() => window.location.reload(), 1000);
                  }}
                  className="gap-2 bg-zinc-800/50 hover:bg-zinc-800"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh Page
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  onClick={() => {
                    const promise = new Promise((resolve) => {
                      reset?.();
                      setTimeout(resolve, 1000);
                    });

                    toast.promise(promise, {
                      loading: "Retrying...",
                      success: "Operation retried",
                      error: "Failed to retry",
                    });
                  }}
                  className="gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Try Again
                </Button>
              )}

              <Button
                variant="ghost"
                onClick={() => {
                  const promise = router.navigate({ to: "/" });
                  toast.promise(promise, {
                    loading: "Navigating home...",
                    success: "Navigated to home",
                    error: "Failed to navigate",
                  });
                }}
                className="gap-2 hover:bg-zinc-800/50"
              >
                <Home className="h-4 w-4" />
                Go Home
              </Button>
            </CardFooter>
          </Card>
        </div>
      </ClientWrapper>
    </MainLayout>
  );
}

// Add type declaration for Cursor's window API
declare global {
  interface Window {
    __cursor?: {
      openChatWithText: (text: string) => void;
    };
  }
}