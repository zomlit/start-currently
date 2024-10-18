import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/supabase";

// Export a function to get an authenticated Supabase client
export const getAuthenticatedClient = () => {
  return createClient<Database>();
};

// If you need to fetch user profile, you can create a separate function for it
export const fetchUserProfile = async (userId: string) => {
  const supabase = getAuthenticatedClient();

  try {
    const { data, error } = await supabase
      .from("UserProfile")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Unexpected error fetching user profile:", error);
    return null;
  }
};
