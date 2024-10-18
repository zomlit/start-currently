import React, { createContext, useContext, useEffect } from "react";
import { useThemeStore } from "@/store/themeStore";

type Theme = "dark" | "light" | "system";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  primaryColor: string;
  setPrimaryColor: (color: string) => void;
};

const ThemeProviderContext = createContext<ThemeProviderState | undefined>(
  undefined
);

export function ThemeProvider({
  children,
  defaultTheme = "system",
  ...props
}: ThemeProviderProps) {
  const { theme, setTheme, primaryColor, setPrimaryColor } = useThemeStore();

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

    // Apply the primary color directly as a hex value
    root.style.setProperty("--primary", primaryColor);
    root.style.setProperty(
      "--primary-foreground",
      getContrastColor(primaryColor)
    );
  }, [theme, primaryColor]);

  useEffect(() => {
    if (defaultTheme && theme === "system") {
      setTheme(defaultTheme);
    }
  }, [defaultTheme, theme, setTheme]);

  const value = {
    theme,
    setTheme,
    primaryColor,
    setPrimaryColor,
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
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

// ColorPicker component
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

// Helper function to get contrast color
function getContrastColor(hexColor: string) {
  // Convert hex to RGB
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);

  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // Return black for light colors, white for dark colors
  return luminance > 0.5 ? "#000000" : "#ffffff";
}
