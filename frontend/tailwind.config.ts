import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb', // ShopFlow Sapphire Primary
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        meta: '#1877F2', // Facebook Ecosystem Blue
        mac: {
          close: '#FF5F56',
          minimize: '#FFBD2E',
          maximize: '#27C93F',
        },
      },
      fontFamily: {
        sans: ['Geist', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['Space Mono', 'JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'mac-window': '0 25px 60px -15px rgba(15, 23, 42, 0.18), 0 0 0 1px rgba(15, 23, 42, 0.08)',
        'mac-card': '0 12px 30px -8px rgba(15, 23, 42, 0.12), 0 0 0 1px #E2E8F0',
        'mac-popup': '0 4px 14px 0 rgba(15, 23, 42, 0.06), 0 0 0 1px #E2E8F0',
      },
      borderRadius: {
        'mac-window': '24px',
        'mac-card': '16px',
        'mac-input': '10px',
      },
    },
  },
  plugins: [],
};

export default config;
