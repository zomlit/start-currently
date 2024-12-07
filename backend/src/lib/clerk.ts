import { createClerkClient } from "@clerk/clerk-sdk-node";
import { config } from "@/config";

const clerk = createClerkClient({ secretKey: config.CLERK_SECRET_KEY });

export async function verifyToken(token: string) {
  try {
    const claims = await clerk.verifyToken(token);
    return claims;
  } catch (error) {
    console.error("Failed to verify token:", error);
    throw new Error("Invalid token");
  }
}
