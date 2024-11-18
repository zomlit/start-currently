// @/store/globalStore.ts

import { StateCreator } from "zustand";
import { supabase } from "@/utils/supabase/client";
import { TwitchApi } from "ts-twitch-api";
import { SupabaseClient } from "@supabase/supabase-js";
import { useAuth } from "@clerk/tanstack-start";
import { useElysiaSession } from "@/hooks/useElysiaSession";
import type { Track } from "@/types/visualizer";

// Types
type OAuthTokens = {
  twitch?: TwitchTokenData[];
  google?: GoogleTokenData[];
  spotify?: {
    token: string;
    refreshToken: string;
    lastFetched: number;
  };
  streamelements?: string;
};

interface TwitchTokenData {
  avatar: string;
  label: string;
  value: string;
  providerUserId: string;
  externalId: string;
  token: string;
  refreshToken?: string;
  intents: string[];
}

interface GoogleTokenData {
  avatar: string;
  label: string;
  value: string;
  providerUserId: string;
  externalId: string;
  token: string;
}

interface GenericUser {
  [key: string]: any;
}

interface PublicUser {
  id: string;
  username: string;
  email: string;
  [key: string]: any;
}

export interface GlobalState {
  user: GenericUser | null;
  oauthTokens: OAuthTokens;
  hasFetchedInitialState: boolean;
  isInitialized: boolean;
  publicUser: PublicUser | null;
  isConnected: boolean;
  setIsConnected: (isConnected: boolean) => void;

  setUser: (user: GenericUser | null) => void;
  setUserId: (userId: string | null) => void;
  setOAuthTokens: (
    provider: keyof OAuthTokens,
    tokens:
      | TwitchTokenData[]
      | { token: string; refreshToken: string; lastFetched: number }
      | string
  ) => void;
  getOAuthToken: (
    provider: keyof OAuthTokens
  ) =>
    | TwitchTokenData[]
    | { token: string; refreshToken: string; lastFetched: number }
    | string
    | undefined;
  setHasFetchedInitialState: (hasFetched: boolean) => void;
  setInitialized: (isInitialized: boolean) => void;
  setPublicUser: (userData: PublicUser) => void;

  fetchSpotifyAccessTokenFromSupabase: (userId: string) => Promise<void>;
  refreshSpotifyAccessToken: (userId: string) => Promise<void>;
  fetchSpotifyCredentials: (
    userId: string
  ) => Promise<{ clientId: string; clientSecret: string }>;
  checkAndRefreshSpotifyToken: (userId: string) => Promise<void>;
  pushUserSessionToSupabase: (
    userData: any,
    supabase: SupabaseClient
  ) => Promise<void>;
  fetchAndSetUser: () => Promise<void>;
  fetchAndStoreTwitchTokens: () => Promise<void>;
  initializeTwitchAuth: () => Promise<TwitchApi | null>;
  fetchUserSessionFromSupabase: (username: string) => Promise<string | null>;
  fetchStreamElementsJWTFromSupabase: (userId: string) => Promise<void>;
  recentEvents: any[];
  addRecentEvent: (event: any) => void;
  switchSpotifyTokens: () => void;
  twitchApi: TwitchApi | null;
  refreshTwitchToken: () => Promise<void>;
  currentAlert: Alert | null;
}

export interface Alert {
  type: string;
  data: {
    displayName: string;
    amount?: string | number;
    gifted?: boolean;
  };
}

export const createGlobalSlice: StateCreator<GlobalState> = (set, get) => ({
  // Initial state
  user: null,
  oauthTokens: {},
  hasFetchedInitialState: false,
  isInitialized: false,
  publicUser: null,
  isConnected: false,
  setIsConnected: (isConnected) => set({ isConnected }),

  // Actions
  recentEvents: [],
  addRecentEvent: (event) =>
    set((state) => ({
      recentEvents: [event, ...state.recentEvents].slice(0, 10),
    })),
  setUser: (user) => set({ user }),
  setUserId: (userId) => {
    const currentUser = get().user;

    if (currentUser) {
      set({ user: { ...currentUser, id: userId } });
    } else {
      set({ user: { id: userId } });
    }
  },
  setOAuthTokens: (provider, tokens) =>
    set((state) => {
      if (provider === "spotify") {
        const currentSpotify = state.oauthTokens.spotify || {};
        const newSpotify = {
          ...currentSpotify,
          ...(typeof tokens === "object" ? tokens : {}),
          lastFetched: Date.now(),
        };

        return {
          oauthTokens: {
            ...state.oauthTokens,
            spotify: newSpotify,
          },
        };
      }
      return {
        oauthTokens: {
          ...state.oauthTokens,
          [provider]: tokens,
        },
      };
    }),

  getOAuthToken: (provider) => {
    const tokens = get().oauthTokens[provider];
    if (provider === "twitch" && Array.isArray(tokens)) {
      return tokens;
    }
    return tokens;
  },

  setHasFetchedInitialState: (hasFetched) =>
    set({ hasFetchedInitialState: hasFetched }),
  setInitialized: (isInitialized) => set({ isInitialized }),
  setPublicUser: (userData) => set({ publicUser: userData }),

  fetchSpotifyAccessTokenFromSupabase: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("UserProfile")
        .select("s_access_token, s_refresh_token")
        .eq("user_id", userId)
        .single();

      if (error) {
        console.error(
          "Error fetching Spotify tokens from Supabase:",
          error.message
        );
        return;
      }

      if (data && data.s_access_token) {
        set((state) => ({
          oauthTokens: {
            ...state.oauthTokens,
            spotify: {
              token: data.s_access_token,
              refreshToken: data.s_refresh_token,
              lastFetched: Date.now(),
            },
          },
        }));
      } else {
        console.warn("No Spotify access token found in Supabase data");
      }
    } catch (error) {
      console.error("Failed to fetch Spotify tokens from Supabase:", error);
    }
  },

  fetchSpotifyCredentials: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("UserProfile")
        .select("s_client_id, s_client_secret")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) {
        console.error(
          "Error fetching Spotify client credentials from Supabase:",
          error.message
        );
        throw error;
      }

      if (data && data.s_client_id && data.s_client_secret) {
        return {
          clientId: data.s_client_id,
          clientSecret: data.s_client_secret,
        };
      }

      throw new Error("Spotify client credentials not found");
    } catch (error) {
      console.error(
        "Failed to fetch Spotify client credentials from Supabase:",
        error
      );
      throw error;
    }
  },
  refreshSpotifyAccessToken: async (userId: string) => {
    const { oauthTokens, fetchSpotifyCredentials } = get();
    const spotify = oauthTokens.spotify as
      | {
          token: string;
          refreshToken: string;
          lastFetched: number;
        }
      | undefined;
    if (!spotify || !spotify.refreshToken) {
      console.error("No refresh tokens available for Spotify");
      return;
    }

    const refreshToken = spotify.refreshToken;

    try {
      const { clientId, clientSecret } = await fetchSpotifyCredentials(userId);

      const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
        },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: refreshToken,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to refresh Spotify access token");
      }

      const data = await response.json();

      set((state) => ({
        oauthTokens: {
          ...state.oauthTokens,
          spotify: {
            ...spotify,
            token: data.access_token,
            refreshToken: refreshToken,
            lastFetched: Date.now(),
          },
        },
      }));

      await supabase.from("UserProfile").upsert({
        user_id: userId,
        s_access_token: data.access_token,
        s_refresh_token: refreshToken,
      });
    } catch (error) {
      console.error("Error refreshing Spotify access token:", error);
    }
  },
  checkAndRefreshSpotifyToken: async (userId: string) => {
    const { oauthTokens, refreshSpotifyAccessToken } = get();
    console.log("isLoading", oauthTokens);

    const spotify = oauthTokens.spotify as
      | {
          token: string;
          refreshToken: string;
          lastFetched: number;
        }
      | undefined;

    if (spotify) {
      try {
        const response = await fetch("https://api.spotify.com/v1/me", {
          headers: {
            Authorization: `Bearer ${spotify.token}`,
          },
        });

        if (response.status === 401) {
          console.log("Spotify token expired, refreshing...");
          await refreshSpotifyAccessToken(userId, false);
        } else {
          console.log("Spotify token is valid.");
        }
      } catch (error) {
        console.error("Error checking Spotify token validity:", error);
      }
    }
  },

  fetchAndStoreTwitchTokens: async () => {
    const { user } = get();
    if (!user || !user.id) {
      console.error("User ID is missing");
      return;
    }

    try {
      const apiUrl = import.meta.env.VITE_ELYSIA_API_URL;
      if (!apiUrl) {
        throw new Error("VITE_ELYSIA_API_URL environment variable is not set");
      }

      // Fix: Ensure there's no trailing slash in the base URL
      const baseUrl = apiUrl.endsWith("/") ? apiUrl.slice(0, -1) : apiUrl;
      const fullUrl = `${baseUrl}/user-tokens/${user.id}`;

      const response = await fetch(fullUrl);

      if (!response.ok) {
        throw new Error(
          response.statusText || "Failed to fetch Twitch accounts"
        );
      }
      const data = await response.json();

      if (data.matchedTokens && data.matchedTokens.length > 0) {
        set((state) => ({
          oauthTokens: {
            ...state.oauthTokens,
            twitch: data.matchedTokens.map((account: any) => ({
              avatar: account.avatar,
              label: account.label,
              value: account.value,
              providerUserId: account.providerUserId,
              externalId: account.externalId,
              token: account.token,
              refreshToken: account.refreshToken,
              intents: ["chat"],
            })),
          },
        }));
        console.log("Twitch tokens stored in state:", get().oauthTokens);
      } else {
        console.error("No Twitch tokens found in the response");
      }
    } catch (error) {
      console.error("Error fetching and storing Twitch accounts:", error);
    }
  },

  twitchApi: null,

  refreshTwitchToken: async () => {
    const { oauthTokens } = get();
    const twitchTokens = oauthTokens.twitch;

    if (!twitchTokens || twitchTokens.length === 0) {
      console.error("No Twitch tokens available for refresh");
      return;
    }

    try {
      const response = await fetch("/api/twitch/refreshToken", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          refreshToken: twitchTokens[0].refreshToken,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to refresh Twitch token");
      }

      const newTokenData = await response.json();

      set((state) => ({
        oauthTokens: {
          ...state.oauthTokens,
          twitch: state.oauthTokens.twitch?.map((token, index) =>
            index === 0
              ? {
                  ...token,
                  token: newTokenData.accessToken,
                  refreshToken: newTokenData.refreshToken,
                }
              : token
          ),
        },
      }));

      console.log("Twitch token refreshed successfully");
      await get().initializeTwitchAuth();
    } catch (error) {
      console.error("Error refreshing Twitch token:", error);
    }
  },

  initializeTwitchAuth: async () => {
    const { oauthTokens, refreshTwitchToken } = get();
    let twitchTokens = oauthTokens.twitch;

    if (!twitchTokens || twitchTokens.length === 0) {
      console.error("No Twitch tokens available");
      return null;
    }

    try {
      const twitchApi = new TwitchApi({
        clientId: import.meta.env.VITE_PUBLIC_TWITCH_CLIENT_ID!,
        accessToken: twitchTokens[0].token,
        onTokenInvalid: async () => {
          console.log("Twitch token invalid, refreshing...");
          await refreshTwitchToken();
        },
      });

      set({ twitchApi });
      console.log("Successfully initialized Twitch API");
      return twitchApi;
    } catch (error) {
      console.error("Error in initializeTwitchAuth:", error);
      throw error;
    }
  },

  pushUserSessionToSupabase: async (
    userData: any,
    supabase: SupabaseClient
  ) => {
    try {
      console.log(
        "Pushing user data to Supabase:",
        JSON.stringify(userData, null, 2)
      );

      const {
        id: userId,
        username,
        email,
        firstName,
        lastName,
        imageUrl,
      } = userData;

      if (!userId) {
        console.error(
          "User ID is missing or invalid. userData:",
          JSON.stringify(userData, null, 2)
        );
        return;
      }

      const displayName =
        `${firstName || ""} ${lastName || ""}`.trim() ||
        username ||
        email ||
        userId;

      const userUpsertData = {
        id: userId,
        email: email,
        username: username,
        updated_at: new Date().toISOString(),
      };

      console.log(
        "Upserting User data:",
        JSON.stringify(userUpsertData, null, 2)
      );

      const { data: updatedUserData, error: userError } = await supabase
        .from("User")
        .upsert(userUpsertData, {
          onConflict: "id",
          ignoreDuplicates: false,
        })
        .select()
        .single();

      if (userError) {
        console.error("Supabase error details for User:", userError);
        return;
      }

      console.log(
        "Updated User data:",
        JSON.stringify(updatedUserData, null, 2)
      );

      const profileUpsertData = {
        user_id: userId,
        username: username,
        displayName: displayName,
        avatarUrl: imageUrl,
        email: email,
        firstName: firstName,
        lastName: lastName,
        updated_at: new Date().toISOString(), // Ensure this is always set
      };

      console.log(
        "Upserting UserProfile data:",
        JSON.stringify(profileUpsertData, null, 2)
      );

      // Check if a UserProfile already exists
      const { data: existingProfile, error: fetchError } = await supabase
        .from("UserProfile")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (fetchError && fetchError.code !== "PGRST116") {
        console.error("Error fetching existing profile:", fetchError);
        throw fetchError;
      }

      let profileData;
      if (existingProfile) {
        // Update existing profile
        const { data, error: updateError } = await supabase
          .from("UserProfile")
          .update(profileUpsertData)
          .eq("user_id", userId)
          .select()
          .single();

        if (updateError) throw updateError;
        profileData = data;
      } else {
        // Insert new profile
        const { data, error: insertError } = await supabase
          .from("UserProfile")
          .insert(profileUpsertData)
          .select()
          .single();

        if (insertError) throw insertError;
        profileData = data;
      }

      console.log(
        "Updated UserProfile data:",
        JSON.stringify(profileData, null, 2)
      );

      console.log("User and UserProfile data pushed to Supabase successfully", {
        updatedUserData,
        profileData,
      });

      // Update the local state with the new user data
      set((state) => ({
        ...state,
        user: {
          ...state.user,
          ...updatedUserData,
          profile: profileData,
        },
      }));
    } catch (error) {
      console.error("Failed to push user session data to Supabase:", error);
      if (error instanceof Error) {
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
      }
    }
  },

  fetchUserSessionFromSupabase: async (
    username: string
  ): Promise<string | null> => {
    try {
      const { data, error } = await supabase
        .from("UserProfile")
        .select("session")
        .eq("user_id", "user_2bwpcJA5JgJJpGVdcCk8pA2PyxS")
        .single();

      if (error) throw error;

      if (data && data.session) {
        const sessionData = JSON.parse(data.session);
        set({ user: sessionData });
        console.log("User session data fetched from Supabase successfully");
        return sessionData.id; // Return the userId
      }
    } catch (error) {
      console.error("Failed to fetch user session data from Supabase:", error);
    }
    return null;
  },
  fetchStreamElementsJWTFromSupabase: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("UserProfile")
        .select("streamelements_jwt")
        .eq("user_id", userId)
        .single();

      if (error) {
        console.error(
          "Error fetching StreamElements JWT from Supabase:",
          error.message
        );
        return;
      }

      if (data && data.streamelements_jwt) {
        set((state) => ({
          oauthTokens: {
            ...state.oauthTokens,
            streamelements: data.streamelements_jwt,
          },
        }));
      }
    } catch (error) {
      console.error("Failed to fetch StreamElements JWT from Supabase:", error);
    }
  },
  switchSpotifyTokens: () => {
    set((state) => {
      const spotify = state.oauthTokens.spotify as
        | {
            token: string;
            refreshToken: string;
            lastFetched: number;
          }
        | undefined;
      if (spotify) {
        return {
          oauthTokens: {
            ...state.oauthTokens,
            spotify: {
              ...spotify,
              token: spotify.token,
              refreshToken: spotify.refreshToken,
            },
          },
        };
      }
      return state;
    });
  },
  currentAlert: null,
});
