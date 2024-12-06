import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

export const updateSettings = async (userId: string, settings: any) => {
  try {
    const { data, error } = await supabase
      .from("user_settings")
      .update({
        settings,
      })
      .eq("user_id", userId);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating settings:", error);
    throw error;
  }
};
