import { supabase } from "@/utils/supabase/client";
import {
  WidgetProfile,
  WidgetProfileSchema,
  WidgetType,
} from "@/types/widgetProfiles";

export async function fetchProfiles(userId: string): Promise<WidgetProfile[]> {
  const { data, error } = await supabase
    .from("Profiles")
    .select("*")
    .eq("user_id", userId);

  if (error) {
    console.error("Error fetching profiles:", error);
    throw new Error(error.message);
  }

  if (!data) {
    console.error("No data returned from fetchProfiles");
    return [];
  }

  return data.map((profile) => {
    try {
      if (!profile.widgetType) {
        console.warn(
          `Profile ${profile.id} is missing widgetType. Setting default to 'visualizer'.`
        );
        profile.widgetType = "visualizer" as WidgetType;
      }

      // Parse settings if it's a string
      if (typeof profile.settings === "string") {
        try {
          profile.settings = JSON.parse(profile.settings);
        } catch (parseError) {
          console.error(
            `Error parsing settings for profile ${profile.id}:`,
            parseError
          );
          profile.settings = {
            commonSettings: {},
            specificSettings: {},
          };
        }
      }

      return WidgetProfileSchema.parse(profile);
    } catch (parseError) {
      console.error(`Error parsing profile ${profile.id}:`, parseError);
      // Return a default profile if parsing fails
      return {
        id: profile.id || "unknown",
        name: profile.name || "Unknown Profile",
        widgetType: "visualizer" as WidgetType,
        settings: {
          commonSettings: {
            backgroundColor: "#000000",
            textColor: "#ffffff",
          },
          specificSettings: {},
        },
        color: "#000000",
        is_active: true,
        is_current: false,
        user_id: userId,
      };
    }
  });
}

export async function createProfile(
  profile: Omit<WidgetProfile, "id">
): Promise<WidgetProfile> {
  let newName = profile.name;
  let counter = 0;
  let created = false;
  let data;

  while (!created && counter < 100) {
    try {
      // Check for existing profiles with the same name
      const { data: existingProfiles, error: checkError } = await supabase
        .from("Profiles")
        .select("name")
        .eq("user_id", profile.user_id)
        .eq("widgetType", profile.widgetType)
        .ilike("name", `${profile.name}%`);

      if (checkError) throw checkError;

      if (existingProfiles && existingProfiles.length > 0) {
        const regex = new RegExp(`^${profile.name}(?: \\((\\d+)\\))?$`);
        const numbers = existingProfiles
          .map((p) => {
            const match = p.name.match(regex);
            return match ? parseInt(match[1] || "0") : 0;
          })
          .filter((n) => !isNaN(n));

        counter = Math.max(0, ...numbers) + 1;
        newName = counter > 0 ? `${profile.name} (${counter})` : profile.name;
      }

      // Attempt to upsert the profile with the new name
      const { data: upsertedData, error } = await supabase
        .from("Profiles")
        .upsert({ ...profile, name: newName })
        .select()
        .single();

      if (error) {
        throw error;
      } else {
        data = upsertedData;
        created = true;
      }
    } catch (error) {
      console.error("Error in createProfile loop:", error);
      if (counter >= 99) {
        throw new Error("Failed to create profile after multiple attempts");
      }
      counter++;
    }
  }

  if (!data) {
    throw new Error("Failed to create profile after multiple attempts");
  }

  return WidgetProfileSchema.parse(data);
}

export async function updateProfile(
  id: string,
  updates: Partial<WidgetProfile>
): Promise<WidgetProfile> {
  // Prepare the upsert data
  const upsertData = {
    id,
    ...updates,
    updated_at: new Date().toISOString(),
  };

  // Perform the upsert operation
  const { data, error } = await supabase
    .from("Profiles")
    .upsert(upsertData)
    .select()
    .single();

  if (error) {
    console.error("Error upserting profile:", error);
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error("Failed to upsert profile");
  }

  return WidgetProfileSchema.parse(data);
}

export async function deleteProfile(id: string): Promise<void> {
  const { error } = await supabase.from("Profiles").delete().eq("id", id);

  if (error) throw new Error(error.message);
}
