import React, { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase/client";
import { Eye, EyeOff, X } from "lucide-react";
import { useUser } from "@clerk/tanstack-start";
import { Input } from "@/components/ui/input";
import { useCombinedStore } from "@/store";
import { Button } from "@/components/ui/button";
import { toast } from "@/utils/toast";
import { useElysiaSessionContext } from "@/contexts/ElysiaSessionContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface DashboardHeaderProps {
  category: string;
  title: string;
  description: string;
  keyModalText: string;
  buttonUrl: string;
  buttonText: string;
  backText: string;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  category,
  title,
  description,
  keyModalText,
  buttonUrl,
  buttonText,
  backText,
}) => {
  const { user } = useUser();
  const userId = user?.id;

  const [isOpen, setIsOpen] = useState(false);
  const [showClientId, setShowClientId] = useState(false);
  const [showClientSecret, setShowClientSecret] = useState(false);
  const [showJwt, setShowJwt] = useState(false);
  const [jwtKey, setJwtKey] = useState("");
  const { getOAuthToken, setOAuthTokens } = useCombinedStore();
  const [spotifyClientId, setSpotifyClientId] = useState("");
  const [spotifyClientSecret, setSpotifyClientSecret] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { updateSpotifyToken } = useElysiaSessionContext();
  const [code, setCode] = useState("");

  const handleSaveCommand = async () => {
    try {
      if (keyModalText === "Streamelements JWT Token") {
        await handleSaveJwtCommand();
      } else if (keyModalText === "Add Spotify Keys") {
        await handleSaveSpotifyCommand();
      }
      setIsOpen(false);
      setErrorMessage(null);
    } catch (error) {
      console.error("Error during save:", error);
      setErrorMessage(
        `An error occurred while saving: ${error.message}. Please try again.`
      );
    }
  };

  useEffect(() => {
    const fetchSpotifyCredentials = async () => {
      if (!userId) return;

      const { data, error } = await supabase
        .from("UserProfile")
        .select("s_client_id, s_client_secret, s_access_token, s_refresh_token")
        .eq("user_id", userId)
        .single();

      if (error) {
        console.error("Error fetching Spotify credentials:", error.message);
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

  const handleTokenExchange = async () => {
    const client_id = spotifyClientId;
    const client_secret = spotifyClientSecret;
    const redirect_uri = `${window.location.origin}/dashboard/widgets/visualizer`;

    // Use btoa instead of Buffer for base64 encoding in browser
    const auth_str = `${client_id}:${client_secret}`;
    const b64_auth_str = btoa(auth_str);

    const headers = {
      "content-type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${b64_auth_str}`,
    };

    const data = new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri,
    });

    try {
      const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: headers,
        body: data.toString(),
      });

      if (response.ok) {
        const responseData = await response.json();
        console.log("Spotify token exchange response:", responseData);

        // Check if the access token has changed or is about to expire
        const currentProfile = await supabase
          .from("UserProfile")
          .select("s_expires_at")
          .eq("user_id", userId)
          .single();

        const isTokenExpired =
          new Date(currentProfile.data?.s_expires_at) <= new Date();
        const isTokenChanged =
          currentProfile.data?.s_access_token !== responseData.access_token;

        if (isTokenExpired || isTokenChanged) {
          // Update both Supabase and Elysia session
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

          if (userDataError) {
            console.error("Error saving tokens to Supabase:", userDataError);
            throw userDataError;
          }

          // Update Elysia session state
          updateSpotifyToken(responseData.refresh_token);
          console.log(
            "Spotify refresh token stored:",
            responseData.refresh_token
          );
        } else {
          console.log("No update needed for Supabase.");
        }

        toast.success({
          title: "Spotify authentication successful!",
          description: "Your Spotify account has been connected.",
        });

        // Clear the code from the URL
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );

        // Redirect to dashboard after successful auth
        window.location.href = "/dashboard";
      } else {
        throw new Error("Failed to exchange token");
      }
    } catch (error) {
      console.error("Error during token exchange:", error);
      toast.error({
        title: "Failed to authenticate with Spotify",
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  const handleSpotifyAuth = () => {
    const client_id = spotifyClientId;
    const redirect_uri = `${window.location.origin}/dashboard/widgets/visualizer`;
    const scope =
      "user-read-currently-playing user-read-playback-state user-modify-playback-state";

    const authUrl = `https://accounts.spotify.com/authorize?response_type=code&client_id=${client_id}&scope=${encodeURIComponent(
      scope
    )}&redirect_uri=${encodeURIComponent(redirect_uri)}`;

    window.location.href = authUrl;
  };

  const handleSaveJwtCommand = async () => {
    if (!userId) return;

    try {
      const { error } = await supabase
        .from("UserProfile")
        .upsert({ user_id: userId, streamelements_jwt: jwtKey })
        .eq("user_id", userId);

      if (error) throw error;

      toast.success({
        title: "StreamElements JWT token saved successfully!",
      });
    } catch (error) {
      console.error("Error saving StreamElements JWT token:", error);
      toast.error({
        title: "Failed to save JWT token",
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  const renderModalContent = () => {
    switch (keyModalText) {
      case "Add Spotify Keys":
        return {
          title: "Add Spotify Keys",
          content: (
            <>
              <div className="relative mt-4">
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

              <div className="relative mt-4">
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
            </>
          ),
        };

      case "Streamelements JWT Token":
        return {
          title: "Streamelements JWT Token",
          content: (
            <div className="relative mt-4">
              <label htmlFor="jwtKey" className="block text-sm font-medium">
                JWT Key
              </label>
              <div className="relative">
                <Input
                  type={showJwt ? "text" : "password"}
                  name="jwtKey"
                  id="jwtKey"
                  value={jwtKey}
                  onChange={(e) => setJwtKey(e.target.value)}
                  className="mt-2"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  onClick={() => setShowJwt(!showJwt)}
                >
                  {showJwt ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          ),
        };
      default:
        return null;
    }
  };

  const modalContent = renderModalContent();

  return (
    <header className="relative z-10 md:mt-20 mb-10">
      <p className="mb-2 text-sm font-semibold text-blue-600">{category}</p>
      <h1 className="block text-4xl font-black capitalize dark:text-white md:text-6xl">
        {title}
      </h1>
      <p className="mt-2 text-lg dark:text-gray-400">{description}</p>

      {(keyModalText || buttonText) && (
        <div className="my-5 flex flex-col items-center gap-2 sm:flex-row sm:justify-end sm:gap-3">
          {keyModalText && (
            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto" variant="default">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    className="bi bi-key mr-2"
                    viewBox="0 0 16 16"
                  >
                    <path d="M0 8a4 4 0 0 1 7.465-2H14a.5.5 0 0 1 .354.146l1.5 1.5a.5.5 0 0 1 0 .708l-1.5 1.5a.5.5 0 0 1-.708 0L13 9.207l-.646.647a.5.5 0 0 1-.708 0L11 9.207l-.646.647A.5.5 0 0 1 8 10h-.535A4 4 0 0 1 0 8m4-3a3 3 0 1 0 2.712 4.285A.5.5 0 0 1 7.163 9h.63l.853-.854a.5.5 0 0 1 .708 0l.646.647.646-.647a.5.5 0 0 1 .708 0L11 9.207l-.646.647a.5.5 0 0 1-.708 0L9 9.207l-.646.647A.5.5 0 0 1 8 10h-.535A4 4 0 0 1 0 8m4-3a1 1 0 1 1-2 0 1 1 0 0 1 2 0" />
                    <path d="M4 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0" />
                  </svg>
                  {keyModalText}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>{modalContent?.title}</DialogTitle>
                </DialogHeader>
                <div className="mt-4">
                  {modalContent?.content}
                  {errorMessage && (
                    <div className="mt-2 text-red-500">{errorMessage}</div>
                  )}
                  <Button
                    onClick={handleSaveCommand}
                    className="float-right mt-4"
                    variant="default"
                  >
                    Save and Authorize
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}

          {buttonText && buttonUrl && (
            <div className="w-full flex-1">
              <div className="relative flex items-center">
                <Button variant="default" className="rounded-r-none">
                  {buttonText}
                </Button>
                <Input
                  type="text"
                  className="rounded-l-none"
                  value={buttonUrl}
                  readOnly
                />
              </div>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default DashboardHeader;
