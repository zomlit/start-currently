import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_PUBLIC_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  },
  auth: {
    persistSession: false
  },
  global: {
    headers: {
      'Access-Control-Allow-Origin': '*'
    }
  }
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
        self: true
      }
    }
  });
};
