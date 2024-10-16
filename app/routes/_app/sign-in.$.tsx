import { SignIn } from "@clerk/tanstack-start";
import { createFileRoute } from "@tanstack/react-router";
import { CircleDot } from "../../components/icons";

export const Route = createFileRoute("/_app/sign-in/$")({
  component: SignInPage,
});

function SignInPage() {
  return (
    <div className="flex items-center justify-center min-h-screen w-full">
      <div className="w-auto relative">
        <div className="relative z-20 backdrop-blur-lg rounded-lg shadow-xl">
          <SignIn
            routing="path"
            path="/sign-in"
            appearance={{
              elements: {
                formButtonPrimary:
                  "bg-purple-600 hover:bg-purple-700 text-white",
                formFieldInput:
                  "bg-white/20 border-purple-300 text-white placeholder-purple-200",
                headerTitle: "text-white",
                headerSubtitle: "text-purple-200",
                card: "!bg-gradient/20 backdrop-blur-lg !border-none",
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
