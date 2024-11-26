/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./popup.html",
    "./popup.js",
    // Include all possible source files
    "./**/*.{html,js}",
    "!./dist/**", // Exclude dist directory
    "!./node_modules/**", // Exclude node_modules
  ],
  darkMode: "media",
  theme: {
    extend: {
      fontFamily: {
        sofia: [
          "Sofia Sans Condensed",
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
      },
    },
  },
  corePlugins: {
    preflight: true,
  },
  // Add safelist for dynamically created classes
  safelist: [
    "bg-purple-600",
    "text-white",
    "scale-95",
    "bg-white/10",
    "text-white/60",
    "opacity-50",
    "pointer-events-none",
    "bg-red-500/20",
    "text-red-500",
    "bg-green-500/20",
    "text-green-500",
    {
      pattern: /bg-(red|green|purple|white)-(400|500|600)/,
      variants: ["hover", "dark"],
    },
    {
      pattern: /text-(red|green|purple|white)/,
      variants: ["dark"],
    },
    {
      pattern: /opacity-/,
    },
  ],
  important: true,
};
