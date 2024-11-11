import { FileRoute } from "@tanstack/react-router";

export interface SupabaseTokenResponse {
  token: string;
}

export type SupabaseTokenRoute = FileRoute<{
  parentRoute: any;
  path: "/api/supabase-token";
  search: Record<string, never>;
  loader: () => Promise<SupabaseTokenResponse>;
}>;
