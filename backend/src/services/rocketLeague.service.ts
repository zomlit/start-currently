import logger from "../utils/logger";

export async function fetchRocketLeagueData(
  platform: string,
  username: string
) {
  logger.info(`Fetching Rocket League data for ${username} on ${platform}`);

  try {
    const pageContent = await fetchPageContent(platform, username);
    const jsonData = extractJsonFromPage(pageContent);
    return processJsonData(jsonData);
  } catch (error) {
    logger.error(`Error fetching Rocket League data: ${error}`);
    throw error;
  }
}

export async function fetchPageContent(
  platform: string,
  username: string
): Promise<string> {
  try {
    const url = `https://api.tracker.gg/api/v2/rocket-league/standard/profile/${platform}/${encodeURIComponent(
      username
    )}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const content = await response.text();
    return content;
  } catch (error) {
    logger.error(`Error fetching page content: ${error}`);
    throw error;
  }
}

function extractJsonFromPage(pageContent: string): any {
  try {
    return JSON.parse(pageContent);
  } catch (error) {
    logger.error(`Error parsing JSON: ${error}`);
    throw new Error("Unable to parse JSON data from page");
  }
}

function processJsonData(jsonData: any) {
  const data = jsonData.data;

  if (!data) {
    throw new Error("Invalid JSON structure: 'data' property not found");
  }

  // Process segments
  const processedSegments = data.segments.map((segment: any) => ({
    type: segment.type,
    metadata: segment.metadata,
    stats: segment.stats,
  }));

  return {
    platformInfo: data.platformInfo,
    userInfo: data.userInfo,
    metadata: data.metadata,
    segments: processedSegments,
    availableSegments: data.availableSegments,
    expiryDate: data.expiryDate,
  };
}
