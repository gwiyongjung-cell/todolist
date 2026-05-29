import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#03C75A',
          dark: '#02A84A',
          light: '#E8F9EE',
        },
        gray: {
          900: '#191F28',
          700: '#4E5968',
          500: '#8B95A1',
          300: '#C4C9D4',
          100: '#F2F4F6',
          50: '#F9FAFB',
        },
        info: '#3182F6',
        warning: '#F59E0B',
        danger: '#F03E3E',
      },
      fontFamily: {
        sans: ['Pretendard', 'Noto Sans KR', 'Apple SD Gothic Neo', 'sans-serif'],
      },
      borderRadius: {
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        pill: '9999px',
      },
      boxShadow: {
        sm: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        md: '0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)',
        lg: '0 8px 24px rgba(0,0,0,0.10), 0 4px 8px rgba(0,0,0,0.05)',
      },
      screens: {
        mobile: { max: '639px' },
        tablet: { min: '640px', max: '1023px' },
        desktop: '1024px',
      },
    },
  },
  plugins: [],
} satisfies Config;
