import { parseCookies, setCookie } from "vinxi/http";
import { createServerClient } from "@supabase/ssr";

export function getSupabaseServerClient() {
  return createServerClient(
    import.meta.env.VITE_SUPABASE_URL!,
    import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY!
    {
      cookies: {
        // @ts-ignore Wait till Supabase overload works
        getAll() {
          return Object.entries(parseCookies()).map(([name, value]) => ({
            name,
            value,
          }));
        },
        setAll(cookies) {
          cookies.forEach((cookie) => {
            setCookie(cookie.name, cookie.value);
          });
        },
      },
    }
  );
}
