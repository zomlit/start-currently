import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/tanstack-start";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import { supabase } from "@/utils/supabase/client";
import { toast } from "@/utils/toast";
import { useElysiaSessionContext } from "@/contexts/ElysiaSessionContext";
import { redirect, useRouter } from "@tanstack/react-router";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";

export function SpotifyKeysDialog() {
  const { user } = useUser();
  const userId = user?.id;
  const { updateSpotifyToken } = useElysiaSessionContext();
  const [showClientId, setShowClientId] = useState(false);
  const [showClientSecret, setShowClientSecret] = useState(false);
  const [spotifyClientId, setSpotifyClientId] = useState("");
  const [spotifyClientSecret, setSpotifyClientSecret] = useState("");
  const [code, setCode] = useState("");
  const [authWindow, setAuthWindow] = useState<Window | null>(null);

  const router = useRouter();

  useEffect(() => {
    const fetchSpotifyCredentials = async () => {
      if (!userId) return;

      const { data, error } = await supabase
        .from("UserProfile")
        .select("s_client_id, s_client_secret")
        .eq("user_id", userId)
        .single();

      if (error) {
        console.error("Error fetching Spotify credentials:", error);
        return;
      }

      setSpotifyClientId(data.s_client_id || "");
      setSpotifyClientSecret(data.s_client_secret || "");
    };

    fetchSpotifyCredentials();
  }, [userId]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const authCode = urlParams.get("code");
    if (authCode) {
      setCode(authCode);
    }
  }, []);

  useEffect(() => {
    if (spotifyClientId && spotifyClientSecret && code) {
      handleTokenExchange();
    }
  }, [spotifyClientId, spotifyClientSecret, code]);

  const handleSaveSpotifyCommand = async () => {
    if (!userId) return;

    try {
      const { error } = await supabase.from("UserProfile").upsert(
        {
          user_id: userId,
          s_client_id: spotifyClientId,
          s_client_secret: spotifyClientSecret,
        },
        {
          onConflict: "user_id",
        }
      );

      if (error) throw error;

      handleSpotifyAuth();
      toast.success({
        title: "Spotify credentials saved successfully!",
      });
    } catch (error) {
      console.error("Error saving Spotify credentials:", error);
      toast.error({
        title: "Failed to save credentials",
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSaveSpotifyCommand();
  };

  const handleSpotifyAuth = () => {
    const client_id = spotifyClientId;
    const redirect_uri = `${window.location.origin}/dashboard/widgets/visualizer`;
    const scope =
      "user-read-currently-playing user-read-playback-state user-modify-playback-state";

    const authUrl = `https://accounts.spotify.com/authorize?response_type=code&client_id=${client_id}&scope=${encodeURIComponent(
      scope
    )}&redirect_uri=${encodeURIComponent(redirect_uri)}`;

    const width = 500;
    const height = 700;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const popup = window.open(
      "about:blank",
      "Spotify Auth",
      `width=${width},height=${height},left=${left},top=${top}`
    );

    if (popup) {
      setAuthWindow(popup);
      popup.location.href = authUrl;

      const pollTimer = setInterval(() => {
        try {
          if (popup.location.hostname === window.location.hostname) {
            clearInterval(pollTimer);
            const params = new URLSearchParams(popup.location.search);
            const authCode = params.get("code");
            if (authCode) {
              handleTokenExchange(authCode, redirect_uri);
            }
            popup.close();
            setAuthWindow(null);
          }
        } catch (e) {
          if (!popup || popup.closed) {
            clearInterval(pollTimer);
            setAuthWindow(null);
          }
        }
      }, 500);
    } else {
      toast.error({
        title: "Popup Blocked",
        description: "Please allow popups for this site and try again.",
      });
    }
  };

  const handleTokenExchange = async (
    authCode: string,
    redirect_uri: string
  ) => {
    const client_id = spotifyClientId;
    const client_secret = spotifyClientSecret;

    console.log("Starting token exchange with:", {
      authCode,
      redirect_uri,
      client_id,
    });

    const auth_str = `${client_id}:${client_secret}`;
    const b64_auth_str = btoa(auth_str);

    const headers = {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${b64_auth_str}`,
    };

    const data = new URLSearchParams({
      grant_type: "authorization_code",
      code: authCode,
      redirect_uri: redirect_uri,
    });

    try {
      const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: headers,
        body: data.toString(),
      });

      const responseData = await response.json();

      if (!response.ok) {
        // If we get an invalid_grant error but have a refresh token in the DB,
        // we can consider this a success but without showing a toast
        const { data: userData } = await supabase
          .from("UserProfile")
          .select("s_refresh_token")
          .eq("user_id", userId)
          .single();

        if (
          responseData.error === "invalid_grant" &&
          userData?.s_refresh_token
        ) {
          console.log("Using existing refresh token");
          updateSpotifyToken(userData.s_refresh_token);

          // Close dialog and redirect without showing a toast
          const closeButton = document.querySelector(
            "[data-dialog-close]"
          ) as HTMLButtonElement;
          if (closeButton) closeButton.click();

          router.navigate({ to: "/dashboard" });
          return;
        }

        throw new Error(
          responseData.error_description || "Failed to exchange token"
        );
      }

      // Only show the success toast when we actually get new tokens
      if (responseData.access_token && responseData.refresh_token) {
        toast.success({
          title: "Spotify Connected!",
          description: "Your Spotify account has been successfully linked.",
          duration: 5000,
        });
      }

      // Save the new tokens
      const { error: userDataError } = await supabase
        .from("UserProfile")
        .upsert(
          {
            user_id: userId,
            s_access_token: responseData.access_token,
            s_refresh_token: responseData.refresh_token,
            s_expires_at: new Date(
              Date.now() + responseData.expires_in * 1000
            ).toISOString(),
          },
          { onConflict: "user_id" }
        );

      if (userDataError) throw userDataError;

      updateSpotifyToken(responseData.refresh_token);

      // Close dialog using the DialogClose component
      const closeButton = document.querySelector(
        '[data-dialog-close="true"]'
      ) as HTMLButtonElement;
      if (closeButton) {
        closeButton.click();
      } else {
        // Fallback close method
        const dialog = document.querySelector('[role="dialog"]');
        if (dialog) {
          const closeEvent = new Event("close");
          dialog.dispatchEvent(closeEvent);
        }
      }

      router.navigate({ to: "/dashboard" });
    } catch (error) {
      console.error("Error during token exchange:", error);
      toast.error({
        title: "Failed to authenticate with Spotify",
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  useEffect(() => {
    return () => {
      if (authWindow && !authWindow.closed) {
        authWindow.close();
      }
    };
  }, [authWindow]);

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>
          {spotifyClientId ? "Edit Spotify Keys" : "Add Spotify Keys"}
        </DialogTitle>
        <DialogDescription>
          Enter your Spotify API credentials to enable music integration. You
          can find these in your Spotify Developer Dashboard.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="mt-4">
        <div className="space-y-4">
          <div className="relative">
            <label
              htmlFor="spotifyClientId"
              className="block text-sm font-medium text-gray-900 dark:text-white"
            >
              Spotify Client ID
            </label>
            <div className="relative">
              <Input
                type={showClientId ? "text" : "password"}
                name="spotifyClientId"
                id="spotifyClientId"
                value={spotifyClientId}
                onChange={(e) => setSpotifyClientId(e.target.value)}
                className="mt-2"
                required
                autoComplete="off"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                onClick={() => setShowClientId(!showClientId)}
              >
                {showClientId ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <div className="relative">
            <label
              htmlFor="spotifyClientSecret"
              className="block text-sm font-medium text-gray-900 dark:text-white"
            >
              Spotify Client Secret
            </label>
            <div className="relative">
              <Input
                type={showClientSecret ? "text" : "password"}
                name="spotifyClientSecret"
                id="spotifyClientSecret"
                value={spotifyClientSecret}
                onChange={(e) => setSpotifyClientSecret(e.target.value)}
                className="mt-2"
                required
                autoComplete="off"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                onClick={() => setShowClientSecret(!showClientSecret)}
              >
                {showClientSecret ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-end space-x-2">
          <DialogClose asChild data-dialog-close="true">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button type="submit" variant="default">
            Save and Authorize
          </Button>
        </div>
      </form>
    </DialogContent>
  );
}
