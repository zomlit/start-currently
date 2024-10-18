import { create } from "zustand";
import { persist } from "zustand/middleware";

type Theme = "dark" | "light" | "system";

interface ThemeColors {
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  background: string;
  foreground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  destructiveForeground: string;
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;
  border: string;
  input: string;
  ring: string;
  success: string;
  warning: string;
}

interface ThemeStore {
  theme: Theme;
  colors: ThemeColors;
  primaryColor: string;
  setTheme: (theme: Theme) => void;
  setPrimaryColor: (color: string) => void;
}

const lightColors: ThemeColors = {
  primary: "hsl(197, 70%, 49%)",
  primaryForeground: "hsl(0, 0%, 100%)",
  secondary: "hsl(197, 10%, 70%)",
  secondaryForeground: "hsl(197, 5%, 7%)",
  background: "hsl(197, 7%, 95%)",
  foreground: "hsl(197, 5%, 7%)",
  muted: "hsl(197, 20%, 90%)",
  mutedForeground: "hsl(197, 5%, 35%)",
  accent: "hsl(159, 10%, 80%)",
  accentForeground: "hsl(197, 5%, 7%)",
  destructive: "hsl(0, 50%, 30%)",
  destructiveForeground: "hsl(0, 0%, 100%)",
  card: "hsl(197, 7%, 95%)",
  cardForeground: "hsl(197, 5%, 7%)",
  popover: "hsl(197, 7%, 95%)",
  popoverForeground: "hsl(197, 5%, 7%)",
  border: "hsl(197, 20%, 50%)",
  input: "hsl(197, 20%, 18%)",
  ring: "hsl(197, 70%, 49%)",
  success: "hsl(142, 76%, 36%)",
  warning: "hsl(37, 91%, 55%)",
};

const darkColors: ThemeColors = {
  primary: "hsl(197, 70%, 49%)",
  primaryForeground: "hsl(0, 0%, 100%)",
  secondary: "hsl(197, 10%, 10%)",
  secondaryForeground: "hsl(0, 0%, 100%)",
  background: "hsl(197, 10%, 7%)",
  foreground: "hsl(197, 5%, 90%)",
  muted: "hsl(159, 10%, 15%)",
  mutedForeground: "hsl(197, 5%, 60%)",
  accent: "hsl(159, 10%, 15%)",
  accentForeground: "hsl(197, 5%, 90%)",
  destructive: "hsl(100, 50%, 30%)",
  destructiveForeground: "hsl(197, 5%, 90%)",
  card: "hsl(197, 7%, 7%)",
  cardForeground: "hsl(197, 5%, 90%)",
  popover: "hsl(197, 10%, 5%)",
  popoverForeground: "hsl(197, 5%, 90%)",
  border: "hsl(197, 20%, 18%)",
  input: "hsl(197, 20%, 18%)",
  ring: "hsl(197, 70%, 49%)",
  success: "hsl(142, 76%, 36%)",
  warning: "hsl(37, 91%, 55%)",
};

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: "system",
      colors: lightColors,
      primaryColor: "#6D28D9",
      setTheme: (theme) =>
        set((state) => ({
          theme,
          colors: theme === "dark" ? darkColors : lightColors,
        })),
      setPrimaryColor: (color) =>
        set((state) => ({
          primaryColor: color,
        })),
    }),
    {
      name: "theme-storage",
    }
  )
);
