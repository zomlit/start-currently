// import { createServerClient } from "@supabase/ssr";
// import { Database } from "@/types/supabase";

// export function supabase(cookieStore: {
//   get: (name: string) => { value: string } | undefined;
//   set: (name: string, value: string, options: any) => void;
// }) {
//   return createServerClient<Database>(
//     process.env.NEXT_PUBLIC_SUPABASE_URL!,
//     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
//     {
//       cookies: {
//         get(name: string) {
//           return cookieStore.get(name)?.value;
//         },
//         set(name: string, value: string, options: any) {
//           cookieStore.set(name, value, options);
//         },
//         remove(name: string, options: any) {
//           cookieStore.set(name, "", { ...options, maxAge: 0 });
//         },
//       },
//     }
//   );
// }
