import { useSpotifyStore } from "@/store/spotifyStore";
import { StatusIndicator } from "./StatusIndicator";

export const SpotifyStatus = () => {
  const { spotifyRefreshToken } = useSpotifyStore();

  console.log("Spotify status:", {
    hasToken: !!spotifyRefreshToken,
    token: spotifyRefreshToken,
  });

  return (
    <StatusIndicator
      isPresent={!!spotifyRefreshToken}
      label={spotifyRefreshToken ? "Connected" : "Not Connected"}
    />
  );
};
