import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // EVENTFLOW Dark Enterprise SaaS Palette
        main: "#090D14",
        secondary: "#101722",
        card: "#131C29",
        elevated: "#192435",
        brand: {
          DEFAULT: "#3987F5",
          hover: "#2563EB",
          50: "#f0f7ff",
          100: "#e0effe",
          200: "#bae0fd",
          300: "#7cc5fb",
          400: "#3987F5",
          500: "#2563EB",
          600: "#1d4ed8",
          700: "#1e40af",
          800: "#1e3a8a",
          900: "#172554",
        },
        accent: {
          blue: "#3987F5",
          blueDark: "#2563EB",
        },
        text: {
          main: "#EAF0F8",
          secondary: "#91A0B5",
          muted: "#6B7A90",
        },
        border: {
          main: "#263345",
          subtle: "#1C2736",
          active: "#3987F5",
        },
        status: {
          success: "#35B982",
          warning: "#E8B45E",
          error: "#E36C75",
          info: "#3987F5",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          "sans-serif",
        ],
      },
      boxShadow: {
        card: "0 4px 20px -2px rgba(0, 0, 0, 0.4)",
        elevated: "0 10px 30px -4px rgba(0, 0, 0, 0.6)",
        glow: "0 0 20px -5px rgba(57, 135, 245, 0.3)",
      },
    },
  },
  plugins: [],
};

export default config;
