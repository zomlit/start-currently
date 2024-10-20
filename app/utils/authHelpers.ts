import { AuthApiError } from "@supabase/supabase-js";
import { supabase } from "@/utils/supabase/client";

export const ensureUserProfile = async (username: string) => {
  try {
    // Fetch the current session
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

    // Fetch the user's metadata
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

    // First, try to fetch the existing profile
    const { data: existingProfile, error: fetchError } = await supabase
      .from("UserProfile")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      // PGRST116 is the error code for "no rows returned", which is fine in this case
      console.error("Error fetching existing profile:", fetchError);
      throw fetchError;
    }

    if (existingProfile) {
      // If the profile exists, update it
      const { data, error } = await supabase
        .from("UserProfile")
        .update({
          username: username,
          displayName: displayName,
          updated_at: new Date().toISOString(), // Ensure this is always set
        })
        .eq("user_id", userId)
        .select()
        .single();

      if (error) throw error;
      console.log("UserProfile updated");
      return data;
    } else {
      // If the profile doesn't exist, insert a new one
      const { data, error } = await supabase
        .from("UserProfile")
        .insert({
          user_id: userId,
          username: username,
          displayName: displayName,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(), // Ensure this is always set
        })
        .select()
        .single();

      if (error) throw error;
      console.log("New UserProfile created");
      return data;
    }
  } catch (error) {
    if (error instanceof AuthApiError) {
      console.error("Authentication error:", error.message);
    } else {
      console.error("Error ensuring UserProfile:", error);
    }
    throw error;
  }
};
