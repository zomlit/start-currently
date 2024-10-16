import React, { createContext, useContext, useEffect, useState } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";

type Theme = "dark" | "light" | "system";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  primaryColor: string;
  setPrimaryColor: (color: string) => void;
};

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
  primaryColor: "#6D28D9", // Default purple color
  setPrimaryColor: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "app-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme);
  const [primaryColor, setPrimaryColor] = useLocalStorage(
    "app-primary-color",
    "#6D28D9"
  );
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }

    // Apply the primary color to CSS custom property
    root.style.setProperty("--primary-color", primaryColor);
  }, [theme, primaryColor]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme);
      setTheme(theme);
    },
    primaryColor,
    setPrimaryColor,
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {isMounted ? children : null}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

// New component for color picker
export const ColorPicker: React.FC = () => {
  const { primaryColor, setPrimaryColor } = useTheme();

  return (
    <div className="flex items-center space-x-2">
      <label htmlFor="primary-color" className="text-sm font-medium">
        Primary Color:
      </label>
      <input
        type="color"
        id="primary-color"
        value={primaryColor}
        onChange={(e) => setPrimaryColor(e.target.value)}
        className="h-8 w-8 rounded-full border-2 border-gray-300 cursor-pointer"
      />
    </div>
  );
};
