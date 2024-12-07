import axios from "axios";
import logger from "../../utils/logger";
import { LyricsErrors } from "./index";

export class NoLyricsAvailableError extends Error {
  constructor(trackId: string, artist: string) {
    super(`No lyrics available for track: ${artist} - ${trackId}`);
    this.name = "NoLyricsAvailableError";
  }
}

export class SpotifyLyricsService {
  private readonly spotifyCookie: string;
  private readonly baseURL: string = "https://api.spotify.com/v1";
  private readonly headers: Record<string, string> = {
    Accept: "application/json",
    "App-Platform": "WebPlayer",
    "User-Agent":
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.0.0 Safari/537.36",
  };

  constructor() {
    const sp_dc = process.env.SPOTIFY_SP_DC;
    if (!sp_dc) {
      throw new Error("SPOTIFY_SP_DC environment variable is not set");
    }
    this.spotifyCookie = `sp_dc=${sp_dc}`;
  }

  private async getToken(): Promise<string> {
    try {
      const response = await axios.get(
        "https://open.spotify.com/get_access_token?reason=transport&productType=web_player",
        {
          headers: {
            ...this.headers,
            Cookie: this.spotifyCookie,
          },
        }
      );
      return response.data.accessToken;
    } catch (error) {
      logger.error("Failed to get Spotify token:", error);
      throw new Error("Failed to get Spotify token");
    }
  }

  async getLyrics(trackId: string) {
    const url = `https://spclient.wg.spotify.com/color-lyrics/v2/track/${trackId}`;
    try {
      const token = await this.getToken();
      logger.info(`Token: ${token}`);

      const response = await axios.get(url, {
        headers: {
          ...this.headers,
          Authorization: `Bearer ${token}`,
          Cookie: this.spotifyCookie,
        },
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        logger.error(`Axios error fetching lyrics: ${error.message}`);
        logger.error(`Request URL: ${url}`);
        logger.error(`Response status: ${error.response?.status}`);
        logger.error(
          `Response headers: ${JSON.stringify(error.response?.headers)}`
        );

        if (error.response?.status === 401) {
          throw new Error(
            "Spotify authentication failed. Please update your SPOTIFY_SP_DC in the .env file."
          );
        } else if (error.response?.status === 404) {
          return null;
        }
      }
      throw LyricsErrors.fetchError(error);
    }
  }
}
