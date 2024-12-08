import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@clerk/tanstack-start";
import { useCombinedStore } from "@/store";
import { toast } from "@/utils/toast";
import debounce from "lodash/debounce";
import { useDatabaseStore } from "@/store/supabaseCacheStore";
import { useSessionStore } from "@/store/sessionStore";
import { useOAuthStore } from "@/store/oauthStore";
import { useSpotifyStore } from "@/store/spotifyStore";

export const useElysiaSession = (broadcastChannel: string) => {
  const { getToken, userId, sessionId } = useAuth();
  const {
    isSessionActive,
    setIsSessionActive,
    isServerAvailable,
    setIsServerAvailable,
  } = useSessionStore();
  const { spotifyRefreshToken } = useSpotifyStore();
  const { twitchToken } = useOAuthStore();
  const { oauthTokens, fetchSpotifyAccessTokenFromSupabase } =
    useCombinedStore();
  const lastSessionStartAttempt = useRef(0);
  const sessionStartCooldown = 5000; // 5 seconds cooldown
  const setCurrentUserId = useDatabaseStore((state) => state.setCurrentUserId);
  const lastServerCheckAttempt = useRef(0);
  const serverCheckCooldown = 60000; // 1 minute cooldown
  const [manuallyStoppedSession, setManuallyStoppedSession] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const isValid = useSessionStore.getState().isSessionValid();
    if (isValid) {
      setIsSessionActive(true);
    } else {
      useSessionStore.getState().clearSession();
    }
  }, [userId]);

  useEffect(() => {
    if (isSessionActive && userId) {
      sessionStorage.setItem(
        "elysia_session",
        JSON.stringify({
          isActive: true,
          userId,
          timestamp: Date.now(),
        })
      );
    } else {
      sessionStorage.removeItem("elysia_session");
    }
  }, [isSessionActive, userId]);

  const checkServerAvailability = useCallback(async () => {
    const now = Date.now();
    if (now - lastServerCheckAttempt.current < serverCheckCooldown) {
      return isServerAvailable;
    }
    lastServerCheckAttempt.current = now;

    try {
      const apiUrl = import.meta.env.VITE_ELYSIA_API_URL;
      if (!apiUrl) {
        console.warn("VITE_ELYSIA_API_URL environment variable is not set");
        setIsServerAvailable(false);
        return false;
      }
      const response = await fetch(`${apiUrl}/health-check`, {
        method: "GET",
        mode: "cors",
        headers: {
          Accept: "application/json",
        },
      });
      const available = response.ok;
      setIsServerAvailable(available);
      if (!available) {
        console.warn("Elysia server is not available");
      }
      return available;
    } catch (error) {
      console.warn("Server availability check failed:", error);
      setIsServerAvailable(false);
      return false;
    }
  }, [isServerAvailable]);

  const getValidClerkToken = useCallback(async () => {
    try {
      const token = await getToken({ template: "lstio" });
      if (!token) {
        throw new Error("Failed to get valid Clerk token");
      }
      return token;
    } catch (error) {
      console.error("Failed to get valid Clerk token:", error);
      throw error;
    }
  }, [getToken]);

  const startSession = useCallback(async () => {
    const now = Date.now();
    if (now - lastSessionStartAttempt.current < sessionStartCooldown) {
      console.log("Session start attempt too soon, skipping");
      return;
    }

    if (useSessionStore.getState().isSessionValid()) {
      console.log("Valid session exists, skipping start");
      setIsSessionActive(true);
      return;
    }

    lastSessionStartAttempt.current = now;

    const twitchToken = oauthTokens.twitch?.[0]?.token;
    const spotifyRefreshToken = oauthTokens.spotify?.refreshToken;

    if (!twitchToken || !spotifyRefreshToken) {
      console.log("Missing tokens:", { twitchToken, spotifyRefreshToken });
      return;
    }

    if (!userId || !sessionId) {
      console.error("Missing user data:", { userId, sessionId });
      return;
    }

    if (isSessionActive) {
      console.log("Session already active, skipping start attempt");
      return;
    }

    const serverAvailable = await checkServerAvailability();
    if (!serverAvailable) {
      console.warn("Server is unavailable, cannot start session");
      return;
    }

    try {
      const clerkToken = await getValidClerkToken();
      const apiUrl = import.meta.env.VITE_ELYSIA_API_URL;

      if (!apiUrl) {
        throw new Error("VITE_ELYSIA_API_URL environment variable is not set");
      }

      const fullUrl = new URL("api/session/start-session", apiUrl);
      fullUrl.searchParams.append("broadcastChannel", broadcastChannel);
      fullUrl.searchParams.append("spotifyRefreshToken", spotifyRefreshToken);
      fullUrl.searchParams.append("twitchAccessToken", twitchToken);
      fullUrl.searchParams.append("clerkSessionId", sessionId);

      const response = await fetch(fullUrl.toString(), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${clerkToken}`,
          "X-User-Id": userId,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server response:", response.status, errorText);
        throw new Error(
          `Failed to start session: ${response.status} - ${errorText}`
        );
      }

      const responseData = await response.json();
      console.log("Session start response:", responseData);

      setIsSessionActive(true);
      toast.success({
        title: "Session started successfully",
      });

      useSessionStore.getState().initializeSession(userId);
    } catch (error) {
      console.error("Failed to start session:", error);
      toast.error({
        title: "Failed to start session",
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
    }
  }, [
    getValidClerkToken,
    oauthTokens,
    userId,
    sessionId,
    isSessionActive,
    broadcastChannel,
    checkServerAvailability,
  ]);

  const debouncedStartSession = useCallback(
    debounce(() => {
      startSession();
    }, 1000),
    [startSession]
  );

  const stopSession = useCallback(async () => {
    try {
      setManuallyStoppedSession(true);
      useSessionStore.getState().clearSession();
      sessionStorage.removeItem("elysia_session");
      const clerkToken = await getValidClerkToken();
      const apiUrl = import.meta.env.VITE_ELYSIA_API_URL;
      if (!apiUrl) {
        throw new Error("VITE_ELYSIA_API_URL environment variable is not set");
      }
      const fullUrl = new URL("api/session/stop-session", apiUrl).toString();

      const response = await fetch(fullUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${clerkToken}`,
          "X-User-Id": userId || "",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `Failed to stop session: ${response.status}`
        );
      }

      setIsSessionActive(false);
      toast.success({
        title: "Session stopped successfully",
      });
    } catch (error) {
      console.error("Failed to stop session:", error);
      toast.error({
        title: "Failed to stop session",
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
    }
  }, [getValidClerkToken, userId]);

  const checkAndFetchSpotifyToken = useCallback(async () => {
    if (!oauthTokens.spotify?.refreshToken && userId) {
      console.log("Fetching Spotify token from Supabase");
      await fetchSpotifyAccessTokenFromSupabase(userId);
    }
  }, [oauthTokens.spotify, userId, fetchSpotifyAccessTokenFromSupabase]);

  useEffect(() => {
    checkAndFetchSpotifyToken();
  }, [checkAndFetchSpotifyToken]);

  useEffect(() => {
    const twitchToken = oauthTokens.twitch?.[0]?.token;
    const spotifyRefreshToken = oauthTokens.spotify?.refreshToken;

    if (
      twitchToken &&
      spotifyRefreshToken &&
      userId &&
      sessionId &&
      !isSessionActive &&
      !manuallyStoppedSession
    ) {
      console.log("All conditions met, attempting to start session");
      debouncedStartSession();
    } else if (
      (!twitchToken || !spotifyRefreshToken || !userId || !sessionId) &&
      isSessionActive
    ) {
      console.log("Conditions not met, stopping session");
      stopSession();
    }
  }, [
    oauthTokens,
    userId,
    sessionId,
    isSessionActive,
    debouncedStartSession,
    stopSession,
    manuallyStoppedSession,
  ]);

  useEffect(() => {
    if (userId) {
      setCurrentUserId(userId);
    }
  }, [userId, setCurrentUserId]);

  useEffect(() => {
    checkServerAvailability();
  }, [checkServerAvailability]);

  useEffect(() => {
    const checkAvailability = async () => {
      const available = await checkServerAvailability();
      if (!available) {
        console.warn(
          "The Elysia server is currently unavailable. Some features may not work."
        );
      }
    };
    checkAvailability();
    const interval = setInterval(checkAvailability, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [checkServerAvailability]);

  useEffect(() => {
    if (!twitchToken || !spotifyRefreshToken || !userId || !sessionId) {
      setManuallyStoppedSession(false);
    }
  }, [twitchToken, spotifyRefreshToken, userId, sessionId]);

  useEffect(() => {
    if (!isSessionActive || !userId) return;

    const pingSession = async () => {
      try {
        const clerkToken = await getValidClerkToken();
        const apiUrl = import.meta.env.VITE_ELYSIA_API_URL;
        if (!apiUrl) return;

        // const response = await fetch(`${apiUrl}/api/session/ping`, {
        //   method: "POST",
        //   headers: {
        //     Authorization: `Bearer ${clerkToken}`,
        //     "X-User-Id": userId,
        //   },
        // });

        // if (!response.ok) {
        //   console.warn("Session ping failed, attempting to restore session");
        //   await startSession();
        // }
      } catch (error) {
        console.error("Error pinging session:", error);
      }
    };

    // Ping every 30 seconds to keep session alive
    const interval = setInterval(pingSession, 30000);
    return () => clearInterval(interval);
  }, [isSessionActive, userId, getValidClerkToken]);

  useEffect(() => {
    if (!userId) return;

    const restoreSession = async () => {
      const isValid = useSessionStore.getState().isSessionValid();
      if (isValid) {
        try {
          const clerkToken = await getValidClerkToken();
          const apiUrl = import.meta.env.VITE_ELYSIA_API_URL;

          // First verify the session
          const verifyResponse = await fetch(`${apiUrl}/api/session/verify`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${clerkToken}`,
              "X-User-Id": userId,
            },
          });

          const verifyData = await verifyResponse.json();

          if (verifyResponse.ok && verifyData.isActive) {
            setIsSessionActive(true);
          } else if (verifyResponse.ok && !verifyData.isActive) {
            // If verification shows inactive, attempt to restore
            const restoreResponse = await fetch(
              `${apiUrl}/api/session/restore`,
              {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${clerkToken}`,
                  "X-User-Id": userId,
                },
              }
            );

            if (restoreResponse.ok) {
              setIsSessionActive(true);
            } else {
              useSessionStore.getState().clearSession();
            }
          }
        } catch (error) {
          console.error("Error restoring session:", error);
          useSessionStore.getState().clearSession();
        }
      }
    };

    restoreSession();
  }, [userId]);

  return {
    isSessionActive,
    isServerAvailable,
    startSession: debouncedStartSession,
    stopSession,
  };
};