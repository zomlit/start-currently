import { edenTreaty } from "@elysiajs/eden";
import type { App } from "@backend/src/app";

export const api = edenTreaty<App>("http://localhost:9001");

// Add auth token to requests
api.api.headers = async () => {
  const token = await getAuthToken();
  return {
    Authorization: token ? `Bearer ${token}` : "",
  };
};
