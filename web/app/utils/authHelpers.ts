import { AuthApiError } from "@supabase/supabase-js";
import { supabase } from "@/utils/supabase/client";

// Add a mutex to prevent concurrent profile operations
const profileOperations = new Map<string, Promise<any>>();

export const ensureUserProfile = async (username: string) => {
  try {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();
    if (sessionError) throw sessionError;

    if (!session) {
      console.warn("No active session found. User might need to log in.");
      return null;
    }

    const userId = session.user.id;

    // If there's an ongoing operation for this user, wait for it
    if (profileOperations.has(userId)) {
      return await profileOperations.get(userId);
    }

    // Create a new operation promise
    const operationPromise = (async () => {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();
        if (userError) throw userError;

        if (!user) {
          console.error("User data not found");
          throw new Error("User data not found");
        }

        const displayName = user.user_metadata.name || username;

        // First check if profile exists
        const { data: existingProfile } = await supabase
          .from("UserProfile")
          .select("*")
          .eq("user_id", userId)
          .single();

        if (existingProfile) {
          // Update existing profile
          const { data, error: updateError } = await supabase
            .from("UserProfile")
            .update({
              username: username,
              displayName: displayName,
              updated_at: new Date().toISOString(),
              is_active: true,
            })
            .eq("user_id", userId)
            .select()
            .single();

          if (updateError) throw updateError;
          return data;
        }

        // Create new profile
        const { data, error: insertError } = await supabase
          .from("UserProfile")
          .insert({
            user_id: userId,
            username: username,
            displayName: displayName,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            is_active: true,
          })
          .select()
          .single();

        if (insertError) {
          if (insertError.code === "23505") {
            // Handle race condition - profile was created between our check and insert
            const { data: retryProfile, error: retryError } = await supabase
              .from("UserProfile")
              .select("*")
              .eq("user_id", userId)
              .single();

            if (retryError) throw retryError;
            return retryProfile;
          }
          throw insertError;
        }

        return data;
      } finally {
        // Clean up the operation when done
        profileOperations.delete(userId);
      }
    })();

    // Store the operation
    profileOperations.set(userId, operationPromise);
    return await operationPromise;
  } catch (error) {
    console.error("Error in ensureUserProfile:", error);
    throw error;
  }
};
