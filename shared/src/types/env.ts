// Environment variable types
export interface Env {
  // API URLs
  VITE_ELYSIA_API_URL: string;
  VITE_API_URL: string;
  VITE_WEBSOCKET_URL: string;

  // Authentication
  VITE_CLERK_PUBLISHABLE_KEY: string;
  VITE_SUPABASE_URL: string;
  VITE_SUPABASE_ANON_KEY: string;

  // External APIs
  VITE_PUBLIC_GOOGLE_FONTS_API_KEY: string;

  // Spotify
  VITE_SPOTIFY_CLIENT_ID: string;
  VITE_SPOTIFY_CLIENT_SECRET: string;
  VITE_SPOTIFY_REDIRECT_URI: string;

  // Twitch
  VITE_TWITCH_CLIENT_ID: string;
  VITE_TWITCH_CLIENT_SECRET: string;
  VITE_TWITCH_REDIRECT_URI: string;

  // Backend
  DATABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  CLERK_SECRET_KEY: string;
}

// Declare global env type
declare global {
  interface ImportMetaEnv extends Env {}
}
