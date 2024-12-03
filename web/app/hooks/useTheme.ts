import { create } from "zustand";

type ThemeStore = {
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
};

export const useThemeStore = create<ThemeStore>((set) => ({
  theme: "dark",
  setTheme: (theme) => set({ theme }),
}));

export const useTheme = () => {
  return useThemeStore();
};
