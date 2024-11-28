import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

function getEnvVars() {
  // Try both process.env and import.meta.env
  const supabaseUrl =
    process.env.VITE_PUBLIC_SUPABASE_URL ||
    import.meta.env.VITE_PUBLIC_SUPABASE_URL ||
    "";

  const supabaseAnonKey =
    process.env.VITE_PUBLIC_SUPABASE_ANON_KEY ||
    import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY ||
    "";

  return { supabaseUrl, supabaseAnonKey };
}

// Create a function to get the Supabase client
function createSupabaseClient() {
  const { supabaseUrl, supabaseAnonKey } = getEnvVars();

  // Only throw in client-side code
  if (typeof window !== "undefined") {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("Supabase environment variables missing:", {
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseAnonKey,
      });
      throw new Error("Supabase configuration is missing");
    }
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
    auth: {
      persistSession: false,
    },
    global: {
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    },
  });
}

// Create a singleton instance, but only in the browser
let supabaseInstance: SupabaseClient | null = null;

// Export a function to get the instance
export function getSupabase(): SupabaseClient {
  // For SSR, always create a new instance
  if (typeof window === "undefined") {
    return createSupabaseClient();
  }

  // In the browser, use singleton pattern
  if (!supabaseInstance) {
    supabaseInstance = createSupabaseClient();
  }
  return supabaseInstance;
}

// Export the main client instance
export const supabase = getSupabase();

// Export a type-safe authenticated client creator
export function getAuthenticatedClient(token: string): SupabaseClient {
  const supabaseUrl = import.meta.env.VITE_PUBLIC_SUPABASE_URL || "";
  const supabaseAnonKey = import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY || "";

  // Only throw in client-side code
  if (typeof window !== "undefined") {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Supabase configuration is missing");
    }
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });
}

// Export a type-safe realtime channel creator
export function createRealtimeChannel(channelName: string) {
  const client = getSupabase();
  return client.channel(channelName, {
    config: {
      broadcast: {
        self: true,
      },
    },
  });
}

// Log initialization for debugging (only in browser)
if (typeof window !== "undefined" && import.meta.env.DEV) {
  console.log("Supabase initialization:", {
    hasUrl: !!import.meta.env.VITE_PUBLIC_SUPABASE_URL,
    hasAnonKey: !!import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY,
  });
}

// Export everything as a single object
export default {
  supabase,
  getSupabase,
  getAuthenticatedClient,
  createRealtimeChannel,
} as const;
