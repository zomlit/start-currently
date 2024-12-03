import axios from "axios";

export class SpotifyLyricsService {
  private readonly spotifyCookie: string;

  constructor() {
    this.spotifyCookie = process.env.SPOTIFY_COOKIE || "";
    if (!this.spotifyCookie) {
      throw new Error("SPOTIFY_COOKIE environment variable is not set");
    }
  }

  async getLyrics(trackId: string) {
    try {
      const response = await axios.get(
        `https://spclient.wg.spotify.com/color-lyrics/v2/track/${trackId}`,
        {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.0.0 Safari/537.36",
            "App-Platform": "WebPlayer",
            Cookie: this.spotifyCookie,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Error fetching lyrics:", error);
      throw new Error("Failed to fetch lyrics");
    }
  }
}
