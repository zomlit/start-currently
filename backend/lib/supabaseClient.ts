import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/supabase";

export function createClerkSupabaseClient() {
  const { getToken } = auth();

  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_KEY!,
    {
      global: {
        fetch: async (url, options = {}) => {
          const clerkToken = await getToken({
            template: "supabase",
          });

          const headers = new Headers(options?.headers);
          headers.set("Authorization", `Bearer ${clerkToken}`);

          return fetch(url, {
            ...options,
            headers,
          });
        },
      },
    }
  );
}

// Helper function to get a typed Supabase client
export function getSupabase() {
  return createClerkSupabaseClient();
}

// Example of a typed query function
export async function getTasks(userId: string) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("Task")
    .select("*")
    .eq("userId", userId);

  if (error) throw error;
  return data;
}

// Add more Supabase operations here as needed
