import tailwindcss from 'tailwindcss';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    colors: {
      // Base colors
      transparent: 'transparent',
      current: 'currentColor',
      white: '#ffffff',
      black: '#000000',
      
      // Custom color palette
      gunmetal: {
        DEFAULT: '#2f323a',
        100: '#0a0a0c',
        200: '#131418',
        300: '#1d1f23',
        400: '#27292f',
        500: '#2f323a',
        600: '#545967',
        700: '#7a8092',
        800: '#a6abb6',
        900: '#d3d5db'
      },
      chinese_violet: {
        DEFAULT: '#77567a',
        100: '#181118',
        200: '#302331',
        300: '#483449',
        400: '#5f4562',
        500: '#77567a',
        600: '#98729b',
        700: '#b295b4',
        800: '#cbb9cd',
        900: '#e5dce6'
      },
      french_mauve: {
        DEFAULT: '#c47ac0',
        100: '#2c132b',
        200: '#582755',
        300: '#843a80',
        400: '#b04dab',
        500: '#c47ac0',
        600: '#d093cd',
        700: '#dcaed9',
        800: '#e7c9e6',
        900: '#f3e4f2'
      },
      amaranth_pink: {
        DEFAULT: '#e39ec1',
        100: '#3b1126',
        200: '#77224d',
        300: '#b23473',
        400: '#d16199',
        500: '#e39ec1',
        600: '#e8b0cc',
        700: '#eec4d9',
        800: '#f4d7e6',
        900: '#f9ebf2'
      },
      
      // Standard colors for compatibility
      red: {
        50: '#fef2f2',
        500: '#ef4444',
        600: '#dc2626',
        700: '#b91c1c',
      },
      green: {
        50: '#f0fdf4',
        500: '#22c55e',
        600: '#16a34a',
        700: '#15803d',
      },
      
      // shadcn/ui color system
      border: "hsl(var(--border))",
      input: "hsl(var(--input))",
      ring: "hsl(var(--ring))",
      background: "hsl(var(--background))",
      foreground: "hsl(var(--foreground))",
      primary: {
        DEFAULT: "hsl(var(--primary))",
        foreground: "hsl(var(--primary-foreground))",
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
    },
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
} 