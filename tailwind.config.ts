import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./layouts/**/*.{js,ts,jsx,tsx,mdx}",
    "./life-system-pages/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'temple-gold': '#D4AF37',
        'temple-gold-bright': '#F3E5AB',
        'temple-gold-dark': '#997D25',
        'temple-navy': '#002147',
        'temple-navy-dark': '#07090E',
        'temple-surface': '#0B0F19',
        'temple-card': '#0E1424',
        'temple-red': '#8B1E28',
        'temple-burdeos': '#8B1E28',
        'temple-terracota': '#C86D51',
        'temple-olive': '#5B7043',
        'temple-anthracite': '#1A202C',
        'temple-cream': '#F9F6F0',
        'metal-bronze': '#CD7F32',
        'metal-silver': '#C0C8D0',
        'metal-gold': '#D4AF37',
      },
      fontFamily: {
        sans: ['var(--font-outfit)', 'sans-serif'],
        serif: ['var(--font-playfair)', 'serif'],
      },
      borderRadius: {
        'card': '1.125rem', // 18px
        'control': '0.75rem', // 12px
      }
    },
  },
  plugins: [],
};
export default config;
