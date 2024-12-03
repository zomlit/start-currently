// import { chromium } from "playwright";
// import { exec } from "child_process";
// import util from "util";
// import logger from "../utils/logger";

// const execPromise = util.promisify(exec);

// export async function fetchRocketLeagueDataServer(
//   platform: string,
//   username: string
// ) {
//   logger.info(`Fetching Rocket League data for ${username} on ${platform}`);

//   try {
//     const pageContent = await fetchPageContentServer(platform, username);
//     return pageContent;
//   } catch (error) {
//     logger.error(`Error fetching Rocket League data: ${error}`);
//     throw error;
//   }
// }

// async function fetchPageContentServer(
//   platform: string,
//   username: string
// ): Promise<string> {
//   try {
//     // Start Xvfb
//     await execPromise("Xvfb :99 -ac &");
//     process.env.DISPLAY = ":99";

//     const browser = await chromium.launch({ headless: false });
//     const page = await browser.newPage();
//     await page.goto(
//       `https://api.tracker.gg/api/v2/rocket-league/standard/profile/${platform}/${encodeURIComponent(
//         username
//       )}`
//     );

//     // Get the text content of the page, which should be the JSON
//     const content = await page.evaluate(() => document.body.textContent);

//     await browser.close();

//     // Stop Xvfb
//     await execPromise("pkill Xvfb");

//     return content || "";
//   } catch (error) {
//     logger.error(`Error fetching page content: ${error}`);
//     throw error;
//   }
// }
