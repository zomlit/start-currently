import axios from "axios"; // or whatever HTTP client you're using
import { useAuth } from "@clerk/clerk-react";

const api = axios.create({
  baseURL: "http://localhost:9001", // adjust this to your API base URL
});

api.interceptors.request.use(async (config) => {
  const { getToken } = useAuth();
  const token = await getToken({ template: "lstio" });
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log("Token added to request:", token);
  } else {
    console.log("No token available");
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;
