import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl =
  import.meta.env.VITE_PUBLIC_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey =
  import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl)
  throw new Error("Missing VITE_PUBLIC_SUPABASE_URL or VITE_SUPABASE_URL");
if (!supabaseAnonKey)
  throw new Error(
    "Missing VITE_PUBLIC_SUPABASE_ANON_KEY or VITE_SUPABASE_ANON_KEY"
  );

// Create a single instance to export
const supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
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

// Export the instance
export const supabase = supabaseInstance;

// Export the authenticated client creator
export function getAuthenticatedClient(token: string): SupabaseClient {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });
}

// Export the realtime channel creator
export function createRealtimeChannel(channelName: string) {
  return supabaseInstance.channel(channelName, {
    config: {
      broadcast: {
        self: true,
      },
    },
  });
}

// Debug log
console.log("Supabase initialization:", {
  url: supabaseUrl,
  hasAnonKey: !!supabaseAnonKey,
  envKeys: {
    public: {
      url: import.meta.env.VITE_PUBLIC_SUPABASE_URL,
      key: !!import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY,
    },
    regular: {
      url: import.meta.env.VITE_SUPABASE_URL,
      key: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
    },
  },
});

// Export everything as a single default export as well
export default {
  supabase: supabaseInstance,
  getAuthenticatedClient,
  createRealtimeChannel,
};
