import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface HydrationErrorBoundaryProps {
  children: React.ReactNode;
}

interface HydrationErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class HydrationErrorBoundary extends React.Component<
  HydrationErrorBoundaryProps,
  HydrationErrorBoundaryState
> {
  constructor(props: HydrationErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    if (error.message.includes("JSON")) {
      console.warn("JSON parse error during hydration:", error);
      if (typeof window !== "undefined") {
        window.location.reload();
      }
    }
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Hydration error:", error, errorInfo);
  }

  handleRetry = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
            <p className="text-gray-600 mb-6">
              There was an error loading the page. Please try again.
            </p>
            <Button
              onClick={this.handleRetry}
              className="gap-2"
              variant="secondary"
            >
              <RefreshCw className="h-4 w-4" />
              Retry
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
