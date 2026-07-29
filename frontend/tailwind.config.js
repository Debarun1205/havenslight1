/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#0B1E2D",
          soft: "#4E6773",
        },
        navy: {
          deep: "#0A1F30",
          DEFAULT: "#12324A",
          light: "#1B4A64",
        },
        teal: {
          DEFAULT: "#1F8A82",
          soft: "#DCEEEA",
          deep: "#136560",
        },
        sand: {
          DEFAULT: "#F4EFE6",
          dim: "#EAE3D5",
        },
        alert: {
          DEFAULT: "#D64550",
          soft: "#FBE4E5",
          deep: "#A6323B",
        },
        gold: {
          DEFAULT: "#E3A23C",
          soft: "#FBEDD8",
        },
      },
      fontFamily: {
        display: ["Fraunces", "serif"],
        body: ["'IBM Plex Sans'", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(11,30,45,0.06), 0 8px 24px rgba(11,30,45,0.05)",
      },
      keyframes: {
        signalRing: {
          "0%": { transform: "scale(0.9)", opacity: "0.65" },
          "100%": { transform: "scale(2.4)", opacity: "0" },
        },
        pulseDot: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.4" },
        },
      },
      animation: {
        "signal-ring": "signalRing 2.2s cubic-bezier(0.2,0.6,0.35,1) infinite",
        "pulse-dot": "pulseDot 1.6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
