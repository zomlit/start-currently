import logger from "./logger";

export const LyricsErrors = {
  fetchError: (error: unknown) => {
    logger.error("Error fetching lyrics:", error);
    return {
      statusCode:
        error instanceof Error &&
        error.message.includes("authentication failed")
          ? 401
          : 500,
      message: "Failed to fetch lyrics",
      details: error instanceof Error ? error.message : String(error),
      isError: true,
    };
  },

  settingsError: (error: unknown) => {
    logger.error("Error managing lyrics settings:", error);
    return {
      statusCode: 500,
      message: "Failed to manage lyrics settings",
      details: error instanceof Error ? error.message : String(error),
      isError: true,
    };
  },

  notFound: () => ({
    statusCode: 404,
    message: "No lyrics available",
    isError: false,
  }),

  unauthorized: () => ({
    statusCode: 401,
    message: "Unauthorized",
    isError: true,
  }),
};
