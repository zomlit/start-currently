import puppeteer from "puppeteer";
import logger from "../utils/logger";

export class SpotifyAuthService {
  private static cookie: string | null = null;

  static async getCookie(): Promise<string> {
    if (this.cookie) {
      return this.cookie;
    }

    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    try {
      await page.goto("https://accounts.spotify.com/login");

      // Fill in login details
      await page.type("#login-username", process.env.SPOTIFY_EMAIL || "");
      await page.type("#login-password", process.env.SPOTIFY_PASSWORD || "");
      await page.click("#login-button");

      // Wait for navigation to complete
      await page.waitForNavigation();

      // Get all cookies
      const cookies = await page.cookies();

      // Find the sp_dc cookie
      const sp_dc = cookies.find((cookie) => cookie.name === "sp_dc");

      if (sp_dc) {
        this.cookie = `sp_dc=${sp_dc.value}`;
        logger.info("Successfully retrieved Spotify cookie");
        return this.cookie;
      } else {
        throw new Error("Failed to retrieve Spotify cookie");
      }
    } catch (error) {
      logger.error("Error during Spotify authentication:", error);
      throw error;
    } finally {
      await browser.close();
    }
  }
}
