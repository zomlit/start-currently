import React from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  handleRetry = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4">
          <div className="flex flex-col items-center space-y-4 text-center">
            <AlertCircle className="h-12 w-12 text-red-500" />
            <h1 className="text-2xl font-bold">Something went wrong</h1>
            <div className="max-w-md space-y-2">
              <p className="text-muted-foreground">
                {this.state.error?.message || "An unexpected error occurred"}
              </p>
              {import.meta.env.DEV && this.state.error && (
                <pre className="mt-2 max-h-96 overflow-auto rounded bg-muted p-4 text-left text-sm">
                  {this.state.error.stack}
                </pre>
              )}
            </div>
            <Button onClick={this.handleRetry} className="mt-4">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
