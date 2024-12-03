import api from "./api";

export const useProfile = () => {
  const fetchVisualizerProfiles = async () => {
    try {
      const response = await api.get("/profiles/visualizer");

      if (response.data.success) {
        return response.data.data; // This will be an empty array if no profiles are found
      } else {
        throw new Error(response.data.error || "Failed to fetch profiles");
      }
    } catch (error) {
      console.error("Error fetching visualizer profiles:", error);
      throw error; // Re-throw the error to be handled by the caller
    }
  };

  // ... rest of your code

  return { fetchVisualizerProfiles };
};

// ... rest of your code
