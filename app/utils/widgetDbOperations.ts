import { supabase } from "@/utils/supabase/client";
import { Database } from "@/types/supabase";
import { WidgetType, WidgetProfile, WidgetSettings } from "@/types";
import { defaultCommonSettings } from "@/types/initialWidgets";
import { v4 as uuidv4 } from "uuid";

const defaultProfiles: Partial<Record<WidgetType, WidgetProfile>> = {
  visualizer: {
    id: "1",
    name: "Default Visualizer",
    widgetType: "visualizer",
    settings: {
      commonSettings: defaultCommonSettings,
      specificSettings: {
        showAlbumArt: true,
        showPlaylist: true,
        colorSync: true,
        hideOnDisabled: false,
        pauseEnabled: false,
        canvasEnabled: true,
        albumArtSize: 100,
        progressBarBackgroundColor: "rgba(200, 200, 200, 0.6)",
        progressBarForegroundColor: "rgba(0, 0, 0, 1)",
        enableTextShadow: false,
        textShadowColor: "rgba(0, 0, 0, 0.5)",
        textShadowHorizontal: 2,
        textShadowVertical: 2,
        textShadowBlur: 4,
        syncTextShadow: false,
        width: 300,
        height: 100,
      },
    },
    color: "#8A4FFF",
    is_current: true,
  },
};

const ensureDefaultProfiles = async (userId: string) => {
  for (const [widgetType, defaultProfile] of Object.entries(defaultProfiles)) {
    const { error: insertError } = await supabase.from("Profiles").insert({
      user_id: userId,
      widget_type: widgetType,
      name: defaultProfile.name,
      settings: JSON.stringify({
        commonSettings: defaultProfile.settings.commonSettings,
        specificSettings: defaultProfile.settings.specificSettings,
      }),
      color: "#000000",
      is_active: true, // Add this line
    });

    if (insertError) {
      console.error(
        `Error creating default ${widgetType} profile:`,
        insertError
      );
    } else {
      console.log(`Created default ${widgetType} profile for user ${userId}`);
    }
  }
};

export const loadProfiles = async (
  userId: string
): Promise<WidgetProfile[]> => {
  console.log("Fetching profiles from Supabase for user:", userId);
  let { data, error } = await supabase
    .from("Profiles")
    .select("*")
    .eq("user_id", userId);

  if (error) {
    console.error("Supabase error:", error);
    throw error;
  }

  console.log("Profiles fetched from Supabase:", data);

  // If no profiles are found, create default profiles
  if (!data || data.length === 0) {
    console.log("No profiles found, creating default profiles");
    await ensureDefaultProfiles(userId);
    const { data: newData, error: newError } = await supabase
      .from("Profiles")
      .select("*")
      .eq("user_id", userId);

    if (newError) {
      console.error("Error fetching new profiles:", newError);
      throw newError;
    }
    data = newData;
  }

  return data.map((profile) => ({
    id: profile.id,
    user_id: profile.user_id,
    widgetType: profile.widget_type as WidgetType,
    name: profile.name,
    settings:
      typeof profile.settings === "string"
        ? JSON.parse(profile.settings)
        : profile.settings,
    created_at: profile.created_at,
    updated_at: profile.updated_at,
    color: profile.color || "#000000",
    is_current: profile.is_current,
    is_active: profile.is_active,
  }));
};

export const saveProfileToSupabase = async (
  profile: WidgetProfile
): Promise<void> => {
  if (!profile.id) {
    throw new Error("Profile ID is undefined");
  }

  const { error } = await supabase
    .from("Profiles")
    .update({
      settings: JSON.stringify(profile.settings),
      color: profile.color,
      name: profile.name,
      widget_type: profile.widgetType,
      is_current: profile.is_current,
    })
    .eq("id", profile.id);

  if (error) throw error;
};

export const addProfileToSupabase = async (
  userId: string,
  widgetType: WidgetType,
  name: string
): Promise<WidgetProfile> => {
  // Always create a new profile
  const { data, error } = await supabase
    .from("Profiles")
    .insert({
      user_id: userId,
      widget_type: widgetType,
      name: name,
      settings: JSON.stringify({
        commonSettings:
          defaultProfiles[widgetType]?.settings.commonSettings || {},
        specificSettings:
          defaultProfiles[widgetType]?.settings.specificSettings || {},
      }),
      color: "#000000",
      is_active: true,
      is_current: false, // Set to false by default
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating new profile:", error);
    throw error;
  }

  if (!data) {
    throw new Error("No data returned from profile creation");
  }

  // Transform the data to match WidgetProfile type
  const newProfile: WidgetProfile = {
    id: data.id,
    user_id: data.user_id,
    name: data.name,
    widgetType: data.widget_type as WidgetType,
    settings:
      typeof data.settings === "string"
        ? JSON.parse(data.settings)
        : data.settings,
    color: data.color || "#000000",
    is_current: data.is_current || false,
    is_active: data.is_active || true,
  };

  return newProfile;
};

export const deleteProfileFromSupabase = async (profileId: string) => {
  if (!profileId) {
    throw new Error("Profile ID is undefined");
  }

  const { error } = await supabase
    .from("Profiles")
    .delete()
    .eq("id", profileId);

  if (error) {
    console.error("Error deleting profile:", error);
    throw error;
  }
};

export const updateProfileNameInSupabase = async (
  profileId: string,
  newName: string
) => {
  if (!profileId) {
    throw new Error("Profile ID is undefined");
  }

  const { error } = await supabase
    .from("Profiles")
    .update({ name: newName })
    .eq("id", profileId);

  if (error) {
    console.error("Error updating profile name:", error);
    throw error;
  }
};

export const checkProfileExists = async (
  userId: string,
  widgetType: WidgetType,
  profileName: string
) => {
  const { data, error } = await supabase
    .from("Profiles")
    .select()
    .eq("user_id", userId)
    .eq("widget_type", widgetType)
    .eq("name", profileName)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("Error checking for existing profile:", error);
    throw error;
  }

  return !!data;
};

export const createProfileInSupabase = async (
  profile: WidgetProfileWithoutId
) => {
  const { data, error } = await supabase
    .from("Profiles")
    .insert({ ...profile, is_active: true })
    .select()
    .single();

  if (error) {
    console.error("Error creating profile:", error);
    throw error;
  }

  return data;
};

export const updateProfile = async (
  profileId: string,
  updates: Partial<WidgetProfile>
) => {
  console.log(`Updating profile ${profileId} with:`, updates);

  // Only update if there are actual changes
  if (Object.keys(updates).length === 0) {
    console.log("No updates to apply, skipping API call");
    return null;
  }

  const { data, error } = await supabase
    .from("Profiles")
    .update(updates)
    .eq("id", profileId)
    .select()
    .single();

  if (error) {
    console.error("Error updating profile:", error);
    throw error;
  }

  console.log("Profile updated successfully:", data);
  return data;
};

export const updateProfileInSupabase = async (
  profileId: string,
  updates: Partial<WidgetProfile>
) => {
  const { data, error } = await supabase
    .from("Profiles")
    .update({ ...updates, is_active: true })
    .eq("id", profileId)
    .select()
    .single();

  if (error) {
    console.error("Error updating profile:", error);
    throw error;
  }

  return data;
};

export async function loadProfile(
  userId: string,
  widgetType: WidgetType,
  profileId: string
) {
  const { data, error } = await supabase
    .from("Profiles")
    .select("*")
    .eq("user_id", userId)
    .eq("widget_type", widgetType)
    .eq("id", profileId)
    .single();

  if (error) {
    console.error("Error loading profile:", error);
    return null;
  }

  if (!data) {
    console.error("No profile found");
    return null;
  }

  return {
    id: data.id,
    name: data.name,
    widgetType: data.widget_type as WidgetType,
    settings:
      typeof data.settings === "string"
        ? JSON.parse(data.settings)
        : data.settings,
    color: data.color || "#000000",
    is_active: data.is_active,
    is_current: data.is_current,
  };
}
