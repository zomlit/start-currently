import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

// Ensure we have values and throw early if not
const supabaseUrl = import.meta.env.VITE_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error("Missing VITE_PUBLIC_SUPABASE_URL");
}

if (!supabaseAnonKey) {
  throw new Error("Missing VITE_PUBLIC_SUPABASE_ANON_KEY");
}

// Create the Supabase client instance
const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
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

// Export a type-safe authenticated client creator
export function getAuthenticatedClient(token: string): SupabaseClient {
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
  return supabaseClient.channel(channelName, {
    config: {
      broadcast: {
        self: true,
      },
    },
  });
}

// Export the main client instance
export const supabase = supabaseClient;

// Log initialization for debugging
if (import.meta.env.DEV) {
  console.log("Supabase initialization:", {
    hasUrl: !!supabaseUrl,
    hasAnonKey: !!supabaseAnonKey,
  });
}

// Export everything as a single object
export default {
  supabase: supabaseClient,
  getAuthenticatedClient,
  createRealtimeChannel,
} as const;
