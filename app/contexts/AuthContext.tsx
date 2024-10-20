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
          // Prepare the data for Supabase
          const userProfileData = {
            user_id: user.id,
            displayName: user.fullName || user.username || user.id,
            avatarUrl: user.imageUrl,
            username: user.username,
            updated_at: new Date().toISOString(),
          };

          // Upsert the user data to Supabase
          const { error } = await supabase
            .from("UserProfile")
            .upsert(userProfileData, {
              onConflict: "user_id",
            });

          if (error) {
            console.error("Error upserting user profile:", error);
            throw error;
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
