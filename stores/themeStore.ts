import { create } from "zustand";
import { persist } from "zustand/middleware";

type Theme = "light" | "dark" | "system";

type ThemeStore = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  primaryColor: string;
  setPrimaryColor: (color: string) => void;
};

export const useThemeStore = create(
  persist<ThemeStore>(
    (set) => ({
      theme: "system",
      setTheme: (theme) => set({ theme }),
      primaryColor: "#007bff", // Default primary color
      setPrimaryColor: (color) => set({ primaryColor: color }),
    }),
    {
      name: "theme-storage",
    }
  )
);
