import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      animation: {
        'soft-glow': 'softGlow 4s ease-in-out infinite',
        'fade-in-slow': 'fadeInSlow 1.2s ease-in-out',
        'pop-in-slow': 'popInSlow 1.5s ease-out',
        'breathe': 'breathe 8s ease-in-out infinite',
      },
      keyframes: {
        softGlow: {
          '0%, 100%': {
            opacity: '1',
            transform: 'scale(1)',
            boxShadow: '0 8px 30px rgba(255,143,163,0.3)',
          },
          '50%': {
            opacity: '0.92',
            transform: 'scale(1.01)',
            boxShadow: '0 8px 40px rgba(255,143,163,0.5)',
          },
        },
        fadeInSlow: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        popInSlow: {
          '0%': { opacity: '0', transform: 'scale(0.8)' },
          '60%': { opacity: '1', transform: 'scale(1.05)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        breathe: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.06)' },
        },
      },
    },
  },
  plugins: [],
};
export default config;