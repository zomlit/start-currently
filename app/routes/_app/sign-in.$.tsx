import { SignIn, useAuth } from "@clerk/tanstack-start";
import { createFileRoute, useRouter, useSearch } from "@tanstack/react-router";
import { getReturnTo, type SearchParams } from "@/lib/auth";

export const Route = createFileRoute("/_app/sign-in/$")({
  validateSearch: (search: Record<string, unknown>): SearchParams => ({
    returnTo: search.returnTo as string | undefined,
  }),
  component: SignInPage,
});

function SignInPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const search = Route.useSearch();

  // Redirect if already signed in
  if (isLoaded && isSignedIn) {
    const returnTo = getReturnTo(search);
    router.navigate({ to: returnTo });
    return null;
  }

  return (
    <div className="flex items-center justify-center w-full h-screen">
      <div className="w-auto relative">
        <div className="relative z-20 backdrop-blur-lg rounded-lg shadow-xl">
          <SignIn
            routing="path"
            path="/sign-in"
            redirectUrl={getReturnTo(search)}
            appearance={{
              elements: {
                formButtonPrimary:
                  "bg-purple-600 hover:bg-purple-700 dark:text-white",
                formFieldInput:
                  "bg-white/20 border-purple-300 text-white placeholder-purple-200 dark:text-white",
                formFieldLabel: "dark:text-white",
                headerTitle: "dark:text-white text-xl uppercase",
                headerSubtitle: "text-purple-400",
                card: "dark:bg-background backdrop-blur-lg",
                footer: "dark:text-white !dark:bg-background bg-none",
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
