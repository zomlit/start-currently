import { useRouter } from "@tanstack/react-router";
import type { ErrorComponentProps } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { AlertCircle, Home, RefreshCw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { ClientWrapper } from "@/components/ClientWrapper";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Toaster } from "sonner";
import { useThemeStore } from "@/store/themeStore";
import { ClerkProvider } from "@clerk/tanstack-start";
import { dark } from "@clerk/themes";
import { useMemo } from "react";

export function DefaultCatchBoundary({ error, reset }: ErrorComponentProps) {
  const router = useRouter();
  const { theme } = useThemeStore();

  const errorDetails = useMemo(() => {
    if (!(error instanceof Error)) {
      return {
        message: "An unknown error occurred",
        stack: "",
        isHookError: false,
        isHmrError: false,
      };
    }

    const isHookError = error.message.includes(
      "Rendered more hooks than during the previous render"
    );
    const isHmrError = error.message.includes("server.hmr.overlay");

    let friendlyMessage = error.message;

    if (isHookError) {
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
    };
  }, [error]);

  const formatStackLine = (line: string) => {
    // Match file paths and line numbers in error messages
    return line.replace(
      /([a-zA-Z0-9_-]+\.[a-zA-Z]+:\d+:\d+)/g,
      "<strong>$1</strong>"
    );
  };

  return (
    <ClerkProvider
      appearance={{
        baseTheme: theme === "dark" ? dark : undefined,
      }}
    >
      <ClientWrapper>
        <Navigation />
        <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center p-4">
          <Card className="w-full max-w-2xl bg-white/5 border-none shadow-2xl backdrop-blur-sm p-6">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="rounded-full bg-destructive/40 p-3">
                  <AlertCircle className="h-8 w-8 text-pink-500" />
                </div>

                <h1 className="text-3xl font-bold tracking-tight">
                  Oops! Something went wrong
                </h1>

                <Alert
                  variant="destructive"
                  className="mt-2 text-pink-500 border-none bg-white/5 backdrop-blur-sm"
                >
                  <AlertTitle className="text-2xl uppercase font-black"></AlertTitle>
                  <AlertDescription className="break-words font-normal text-lg">
                    {errorDetails.message}
                  </AlertDescription>
                </Alert>

                {process.env.NODE_ENV === "development" &&
                  errorDetails.stack &&
                  !errorDetails.isHookError && (
                    <div className="w-full bg-white/5 p-0">
                      <pre className="max-h-[240px] overflow-y-auto p-4 text-left overflow-x-hidden text-xs font-mono text-muted-foreground">
                        {errorDetails.stack.split("\n").map((line, i) => (
                          <div
                            key={i}
                            className="py-0.5 break-words whitespace-pre-wrap"
                            dangerouslySetInnerHTML={{
                              __html: formatStackLine(line),
                            }}
                          />
                        ))}
                      </pre>
                    </div>
                  )}
              </div>
            </CardContent>

            <CardFooter className="flex justify-center gap-4 pb-6">
              {errorDetails.isHookError ? (
                <Button
                  variant="secondary"
                  onClick={() => window.location.reload()}
                  className="gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh Page
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  onClick={() => reset?.()}
                  className="gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Try Again
                </Button>
              )}

              <Button
                variant="outline"
                onClick={() => router.navigate({ to: "/" })}
                className="gap-2"
              >
                <Home className="h-4 w-4" />
                Go Home
              </Button>
            </CardFooter>
          </Card>
        </div>
        <Footer />
        <Toaster theme={theme === "system" ? undefined : theme} />
      </ClientWrapper>
    </ClerkProvider>
  );
}
