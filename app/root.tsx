import { ClerkProvider } from "@clerk/tanstack-start";

export default function Root() {
  return (
    <ClerkProvider publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}>
      {/* Your app content */}
    </ClerkProvider>
  );
}
