import { fontFamily } from "tailwindcss/defaultTheme";
// @ts-expect-error This is how Tailwind CSS is imported
import flattenColorPalette from "tailwindcss/lib/util/flattenColorPalette";
import plugin from "tailwindcss/plugin";
import scrollbarPlugin from "tailwind-scrollbar";

module.exports = {
  darkMode: ["class"],
  content: ["./components/**/*.{ts,tsx}", "./app/**/*.{js,ts,jsx,tsx}"],

  prefix: "",
  theme: {
    container: {
      center: "true",
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      height: {
        footer: "var(--footer-height, 300px)",
      },
      fontFamily: {
        sofia: ["Sofia Sans Condensed Variable", "sans-serif"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
        boxShadow: {
          text: '5px 5px 10px rgba(139, 92, 246, 0.5)',
          'solid': '20px 20px 0 0 rgb(0 0 0)',
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        aurora: {
          from: {
            backgroundPosition: "50% 50%, 50% 50%",
          },
          to: {
            backgroundPosition: "350% 50%, 350% 50%",
          },
        },
        panVideo: {
          "0%, 100%": {
            transform: "translateY(0)",
          },
          "50%": {
            transform: "translateY(-10%)",
          },
        },
        shine: {
          "0%": {
            backgroundPosition: "-250% 0%",
          },
          "100%": {
            backgroundPosition: "250% 0%",
          },
        },
        gradient: {
          "0%, 100%": {
            "background-position": "0% 50%",
          },
          "50%": {
            "background-position": "100% 50%",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        aurora: "aurora 60s linear infinite",
        panVideo: "panVideo 60s ease-in-out infinite",
        shine: "shine 3s linear infinite",
        gradient: "gradient 3s ease infinite",
      },
      backgroundImage: {
        gradient: "linear-gradient(var(--gradient-from), var(--gradient-to))",
      },
      backgroundSize: {
        auto: "auto",
        cover: "cover",
        contain: "contain",
        "200%": "200%",
      },
    },
  },

  plugins: [
    require("tailwindcss-animate"),
    require("tailwind-scrollbar-hide"),
    require('tailwindcss-spring'),
    require("@tailwindcss/typography"),
    scrollbarPlugin({ nocompatible: true }),
    addVariablesForColors,
    plugin(function ({ addUtilities, theme }) {
      const opacityValues = theme("opacity");
      const gradientOpacityUtilities = Object.entries(opacityValues).reduce
      ((acc, [key, value]) => {
        acc[`.bg-gradient\\/${key}`] = {
          "background-image": `linear-gradient(rgba(var(--gradient-from), ${value}), rgba(var(--gradient-to), ${value}))`,
        };
        return acc;
      }, {});
      addUtilities(gradientOpacityUtilities);

      // Fixed arrow-hide utility
      addUtilities({
        ".arrow-hide": {
          "&::-webkit-inner-spin-button, &::-webkit-outer-spin-button": {
            "-webkit-appearance": "none",
            margin: "0",
          },
          "-moz-appearance": "textfield",
        },
      });
    }),
  ],
}

function addVariablesForColors({ addBase, theme }: any) {
  let allColors = flattenColorPalette(theme("colors"));
  let newVars = Object.fromEntries(
    Object.entries(allColors).map(([key, val]) => [`--${key}`, val])
  );

  addBase({
    ":root": newVars,
  });
}