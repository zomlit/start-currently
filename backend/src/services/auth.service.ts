import axios from "axios";
import logger from "../utils/logger";

export async function refreshAccessToken(
  refreshToken: string
): Promise<string> {
  try {
    const response = await axios.post(
      "https://accounts.spotify.com/api/token",
      new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        client_id: process.env.SPOTIFY_CLIENT_ID as string,
        client_secret: process.env.SPOTIFY_CLIENT_SECRET as string,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    if (response.status !== 200) {
      logger.error(
        `Failed to refresh token. Status: ${
          response.status
        }, Data: ${JSON.stringify(response.data)}`
      );
      throw new Error(`Failed to refresh token. Status: ${response.status}`);
    }

    return response.data.access_token;
  } catch (error) {
    if (axios.isAxiosError(error)) {
 Response: ${JSON.stringify(error.response?.data)}`
      );
      throw new Error(`Failed to refresh token: ${error.message}`);
    }
    logger.error(`Unknown error refreshing token: ${error}`);
    throw new Error("Unknown error refreshing token");
  }
}
