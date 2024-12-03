import { SignUp } from "@clerk/tanstack-start";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/sign-up/$")({
  component: SignUpPage,
});

function SignUpPage() {
  return (
    <div className="flex items-center justify-center min-h-screen w-full">
      <div className="w-auto relative">
        <div className="relative z-20 backdrop-blur-lg rounded-lg shadow-xl">
          <SignUp
            routing="path"
            path="/sign-up"
            appearance={{
              elements: {
                formButtonPrimary:
                  "bg-purple-600 hover:bg-purple-700 text-white",
                formFieldInput:
                  "bg-white/20 border-purple-300 text-white placeholder-purple-200",
                headerTitle: "",
                headerSubtitle: "",
                card: "!bg-gradient/20 backdrop-blur-lg !border-none",
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
