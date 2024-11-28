import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

// Create a function to get the Supabase client
function createSupabaseClient() {
  const supabaseUrl = import.meta.env.VITE_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl) {
    throw new Error("Missing VITE_PUBLIC_SUPABASE_URL");
  }

  if (!supabaseAnonKey) {
    throw new Error("Missing VITE_PUBLIC_SUPABASE_ANON_KEY");
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

// Create a singleton instance
let supabaseInstance: SupabaseClient | null = null;

// Export a function to get the instance
export function getSupabase(): SupabaseClient {
  if (!supabaseInstance) {
    supabaseInstance = createSupabaseClient();
  }
  return supabaseInstance;
}

// Export the main client instance
export const supabase = getSupabase();

// Export a type-safe authenticated client creator
export function getAuthenticatedClient(token: string): SupabaseClient {
  const supabaseUrl = import.meta.env.VITE_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase configuration is missing");
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

// Log initialization for debugging
if (import.meta.env.DEV) {
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
