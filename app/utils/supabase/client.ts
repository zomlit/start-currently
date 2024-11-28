import { createClient } from "@supabase/supabase-js";

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

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
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

// Create a function to get an authenticated client
export const getAuthenticatedClient = (token: string) => {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });
};

// Add a helper for realtime channels
export const createRealtimeChannel = (channelName: string) => {
  return supabase.channel(channelName, {
    config: {
      broadcast: {
        self: true,
      },
    },
  });
};
