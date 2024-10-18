"use client";
import { Sun, Moon, Computer } from "lucide-react";
import { useState, useEffect } from "react";
import { useTheme } from "./ThemeProvider";

type Theme = "light" | "dark" | "system";

export function ModeToggle() {
  const { theme, setTheme } = useTheme();
  const [selectedTheme, setSelectedTheme] = useState<Theme>("system");

  useEffect(() => {
    setTheme(selectedTheme);
  }, [selectedTheme, setTheme]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedTheme(event.target.value as Theme);
  };

  return (
    <div className="relative flex cursor-default select-none justify-between items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors">
      <div className="flex items-center bg-gray-200 dark:bg-white/10 backdrop-blur-sm rounded-full p-1 relative">
        <div
          className="absolute w-6 h-6 bg-white rounded-full shadow transition-transform spring-bounce-40 spring-duration-300 duration-300 ease-in-out"
          style={{
            transform: `translateX(${
              selectedTheme === "light"
                ? "0"
                : selectedTheme === "dark"
                  ? "100%"
                  : "200%"
            })`,
          }}
        />
        {["light", "dark", "system"].map((value) => (
          <label
            key={value}
            htmlFor={value}
            className={`relative z-10 flex items-center justify-center w-6 h-6 rounded-full cursor-pointer transition-colors duration-300 ${
              selectedTheme === value ? "text-gray-800" : "text-gray-400"
            }`}
          >
            <input
              type="radio"
              id={value}
              name="theme"
              value={value}
              checked={selectedTheme === value}
              onChange={handleChange}
              className="sr-only"
            />
            {value === "light" && <Sun className="h-4 w-4" />}
            {value === "dark" && <Moon className="h-4 w-4" />}
            {value === "system" && <Computer className="h-4 w-4" />}
          </label>
        ))}
      </div>
    </div>
  );
}
