import { createFileRoute, Outlet } from "@tanstack/react-router";
import { SignIn, useUser } from "@clerk/tanstack-start";
import { Spinner } from "@/components/ui/spinner";

export const Route = createFileRoute("/_app/_authed")({
  component: AuthedLayout,
});

function AuthedLayout() {
  const { isLoaded, isSignedIn } = useUser();

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner className="w-8 fill-violet-300 text-white" />
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="flex items-center justify-center p-12">
        <SignIn routing="hash" />
      </div>
    );
  }

  return <Outlet />;
}
