import React, { Fragment, useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { supabase } from "@/utils/supabase/client";
import { Eye, EyeOff, X } from "lucide-react";
import { useUser } from "@clerk/tanstack-start";
import InputField from "@/components/InputField";
import { useCombinedStore } from "@/store";
import { Button } from "@/components/ui/button";
import { toast } from "@/utils/toast";

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

  const handleSpotifyAuth = () => {
    const client_id = spotifyClientId;
    const redirect_uri = `${window.location.origin}${window.location.pathname}`;
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
                  className="block text-sm font-medium"
                >
                  Spotify Client ID
                </label>
                <div className="relative">
                  <input
                    type={showClientId ? "text" : "password"}
                    name="spotifyClientId"
                    id="spotifyClientId"
                    value={spotifyClientId}
                    onChange={(e) => setSpotifyClientId(e.target.value)}
                    className="relative mt-2 block w-full rounded-lg px-4 py-3 text-lg !outline-none disabled:pointer-events-none disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-800/50"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2"
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
                  className="block text-sm font-medium"
                >
                  Spotify Client Secret
                </label>
                <div className="relative">
                  <input
                    type={showClientSecret ? "text" : "password"}
                    name="spotifyClientSecret"
                    id="spotifyClientSecret"
                    value={spotifyClientSecret}
                    onChange={(e) => setSpotifyClientSecret(e.target.value)}
                    className="relative mt-2 block w-full rounded-lg px-4 py-3 text-lg !outline-none disabled:pointer-events-none disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-800/50"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2"
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
                <input
                  type={showJwt ? "text" : "password"}
                  name="jwtKey"
                  id="jwtKey"
                  value={jwtKey}
                  onChange={(e) => setJwtKey(e.target.value)}
                  className="relative mt-2 block w-full rounded-lg px-4 py-3 text-lg !outline-none disabled:pointer-events-none disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-800/50"
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
            <Button
              onClick={() => setIsOpen(true)}
              className="w-full sm:w-auto"
              variant="success"
            >
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
          )}

          {buttonText && buttonUrl && (
            <div className="w-full flex-1">
              <div className="relative flex items-center">
                <Button variant="primary" className="rounded-r-none">
                  {buttonText}
                </Button>
                <input
                  type="text"
                  className="w-full rounded-r-lg border border-l-0 border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-500 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-zinc-800/50 dark:text-gray-400"
                  value={buttonUrl}
                  readOnly
                />
              </div>
            </div>
          )}
        </div>
      )}

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog onClose={() => setIsOpen(false)} className="relative z-50">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-zinc-900/95 p-6 text-left align-middle text-white shadow-xl transition-all">
                  <button
                    type="button"
                    className="absolute right-4 top-4 text-gray-400 hover:text-gray-500"
                    onClick={() => setIsOpen(false)}
                  >
                    <span className="sr-only">Close</span>
                    <X className="h-6 w-6" />
                  </button>

                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6"
                  >
                    {modalContent?.title}
                  </Dialog.Title>

                  <div className="mt-4">
                    {modalContent?.content}
                    {errorMessage && (
                      <div className="mt-2 text-red-500">{errorMessage}</div>
                    )}
                    <Button
                      onClick={handleSaveCommand}
                      className="float-right mt-4"
                      variant="primary"
                    >
                      Save and Authorize
                    </Button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </header>
  );
};

export default DashboardHeader;
