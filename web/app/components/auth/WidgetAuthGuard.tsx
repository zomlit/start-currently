import { useUser } from "@clerk/tanstack-start";
import { Navigate } from "@tanstack/react-router";
import { Spinner } from "@/components/ui/spinner";

interface WidgetAuthGuardProps {
  children: React.ReactNode;
}

export function WidgetAuthGuard({ children }: WidgetAuthGuardProps) {
  const { isLoaded, isSignedIn } = useUser();

  if (!isLoaded) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!isSignedIn) {
    return <Navigate to="/sign-in" />;
  }

  return <>{children}</>;
}
