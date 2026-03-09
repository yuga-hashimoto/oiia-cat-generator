import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#6C5CE7",
        accent: "#FD79A8",
        dark: "#0D0D0D",
        "dark-card": "#1A1A2E",
        "dark-border": "#2D2D44",
      },
      animation: {
        "bounce-slow": "bounce 3s infinite",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        float: "float 6s ease-in-out infinite",
      },
      keyframes: {
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(108, 92, 231, 0.3)" },
          "50%": { boxShadow: "0 0 40px rgba(108, 92, 231, 0.6)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
