import { createFileRoute } from "@tanstack/react-router";
import { getAuth } from "@clerk/backend";
import { SignJWT } from "jose";

export const Route = createFileRoute("/api/supabase-token")({
  validateSearch: (search: Record<string, unknown>) => ({}),
  loader: async ({ request }) => {
    try {
      // Get the user from Clerk
      const { userId } = await getAuth(request);

      if (!userId) {
        throw new Response("Unauthorized", { status: 401 });
      }

      // Create a JWT token that Supabase can verify
      const token = await new SignJWT({
        role: "authenticated",
        sub: userId,
        exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour expiry
      })
        .setProtectedHeader({ alg: "HS256" })
        .sign(new TextEncoder().encode(process.env.SUPABASE_JWT_SECRET));

      return { token };
    } catch (error) {
      console.error("Error generating Supabase token:", error);
      throw new Response("Internal Server Error", { status: 500 });
    }
  },
});
