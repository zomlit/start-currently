import { useEffect } from "react";
import { useNavigate, createFileRoute } from "@tanstack/react-router";
import { useUser } from "@clerk/tanstack-start";
import BackgroundImage from "@/components/ui/background-image";

export const Route = createFileRoute("/_app/checkout/success")({
  component: CheckoutSuccessPage,
});

function CheckoutSuccessPage() {
  const navigate = useNavigate();
  const { user, isLoaded } = useUser();

  useEffect(() => {
    if (isLoaded && !user) {
      navigate({ to: "/sign-in" });
      return;
    }

    const updateUserCredits = async () => {
      if (!user) return;

      try {
        const currentCredits = (user.unsafeMetadata?.credits as number) || 0;
        await user.update({
          unsafeMetadata: {
            ...user.unsafeMetadata,
            credits: currentCredits + 100,
          },
        });

        // TODO: Store subscription information in Supabase
        // This is where you can integrate Supabase to store subscription details

        navigate({ to: "/dashboard" });
      } catch (error) {
        console.error("Error updating user metadata:", error);
        // Handle the error appropriately
      }
    };

    updateUserCredits();
  }, [user, isLoaded, navigate]);

  if (!isLoaded || !user) {
    return <div>Loading...</div>;
  }

  return <div>Payment successful! Redirecting to dashboard...</div>;
}
