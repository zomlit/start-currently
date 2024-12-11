import React, { createContext, useContext, useEffect, useState } from "react";
import { useUser } from "@clerk/tanstack-start";
import { useCombinedStore } from "@/store";
import { supabase } from "@/utils/supabase/client";
import { toast } from "sonner";

interface AuthContextType {
  isLoading: boolean;
  isInitialized: boolean;
  user: ReturnType<typeof useUser>["user"];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, isLoaded } = useUser();
  const {
    setUserId,
    checkAndRefreshSpotifyToken,
    fetchAndStoreTwitchTokens,
    fetchStreamElementsJWTFromSupabase,
    setInitialized,
    isInitialized,
  } = useCombinedStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function initializeAuth() {
      if (user && !isInitialized) {
        setUserId(user.id);
        try {
          const now = new Date().toISOString();

          // First, fetch existing user profile data
          const { data: existingProfile } = await supabase
            .from("UserProfile")
            .select("*")
            .eq("user_id", user.id)
            .single();

          // Create/update the base user record
          const { error: userError } = await supabase.from("User").upsert(
            {
              id: user.id,
              user_id: user.id,
              email: user.emailAddresses[0]?.emailAddress,
              updated_at: now,
              // Only set created_at if it's a new user
              ...(existingProfile ? {} : { created_at: now }),
            },
            {
              onConflict: "id",
            }
          );

          if (userError) {
            console.error("Error upserting user:", userError);
            throw userError;
          }

          // Prepare user profile data, preserving existing values
          const userProfileData = {
            user_id: user.id,
            username: user.username || existingProfile?.username,
            displayName:
              user.fullName ||
              user.username ||
              existingProfile?.displayName ||
              user.id,
            avatarUrl: user.imageUrl || existingProfile?.avatarUrl,
            updated_at: now,
            is_active: true,
            last_activity: now,
            // Preserve existing values for optional fields
            bio: existingProfile?.bio,
            socialLinks: existingProfile?.socialLinks,
            s_access_token: existingProfile?.s_access_token,
            s_refresh_token: existingProfile?.s_refresh_token,
            s_client_id: existingProfile?.s_client_id,
            s_client_secret: existingProfile?.s_client_secret,
            streamelements_jwt: existingProfile?.streamelements_jwt,
            twitch_tokens: existingProfile?.twitch_tokens,
            google_tokens: existingProfile?.google_tokens,
            session: existingProfile?.session,
            selectedUsername: existingProfile?.selectedUsername,
            selectedUsernameToken: existingProfile?.selectedUsernameToken,
            broadcastChannel: existingProfile?.broadcastChannel,
            refreshToken: existingProfile?.refreshToken,
            s_expires_at: existingProfile?.s_expires_at,
            s_sp_dc: existingProfile?.s_sp_dc,
            // Only set created_at if it's a new profile
            ...(existingProfile ? {} : { created_at: now }),
          };

          // Upsert the user profile data
          const { error: profileError } = await supabase
            .from("UserProfile")
            .upsert(userProfileData, {
              onConflict: "user_id",
            });

          if (profileError) {
            console.error("Error upserting user profile:", profileError);
            throw profileError;
          }

          // Perform other initialization tasks
          await checkAndRefreshSpotifyToken(user.id);
          await fetchAndStoreTwitchTokens();
          await fetchStreamElementsJWTFromSupabase(user.id);

          console.log("Auth initialization complete");
          setInitialized(true);
        } catch (error) {
          console.error("Error during auth initialization:", error);
          toast.error(
            "Error initializing auth. Please try refreshing the page."
          );
        } finally {
          setIsLoading(false);
        }
      } else if (isLoaded) {
        setIsLoading(false);
      }
    }

    initializeAuth();
  }, [user, isLoaded, isInitialized]);

  const value = {
    isLoading,
    isInitialized,
    user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
