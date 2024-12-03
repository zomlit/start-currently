fetchAndStoreTwitchTokens: async () => {
  const { user } = get();
  if (!user || !user.id) {
    console.warn("User ID is missing, skipping Twitch token fetch");
    return;
  }

  try {
    const apiUrl = import.meta.env.VITE_ELYSIA_API_URL;
    if (!apiUrl) {
      console.warn("VITE_ELYSIA_API_URL environment variable is not set");
      return;
    }

    const baseUrl = apiUrl.endsWith("/") ? apiUrl.slice(0, -1) : apiUrl;
    const fullUrl = `${baseUrl}/api/user-tokens/${user.id}`;

    const response = await fetch(fullUrl);
    // ... rest of the function
  } catch (error) {
    console.error("Error fetching Twitch tokens:", error);
  }
};
