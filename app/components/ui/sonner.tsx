import { Toaster as Sonner } from "sonner";
import type { ComponentProps } from "react";

import { useThemeStore } from "@/store/themeStore";

function Toaster(props: ComponentProps<typeof Sonner>) {
  const { theme } = useThemeStore();

  // Get the actual theme based on system preference
  const resolvedTheme =
    theme === "system"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      : theme;

  return (
    <Sonner
      theme={resolvedTheme as "light" | "dark"}
      style={{ zIndex: 999 }}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border group-[.toaster]:border-border group-[.toaster]:shadow-lg font-sans",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  );
}

export { Toaster };
