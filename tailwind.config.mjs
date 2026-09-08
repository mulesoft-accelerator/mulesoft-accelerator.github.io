/** @type {import('tailwindcss').Config} */
export default {
  // Class-based dark mode: toggled by adding/removing `dark` on <html>.
  darkMode: 'class',
  content: [
    './src/**/*.{astro,html,js,jsx,ts,tsx,md,mdx}',
    // The claat Markdown sources live here and can contain HTML/utility classes.
    './jumpstarts/**/*.{md,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // MuleSoft-ish brand blue used across the legacy landing page.
        brand: {
          50: '#eef4fd',
          100: '#d9e6fb',
          200: '#b3ccf6',
          300: '#84aaef',
          400: '#5486e6',
          500: '#4F7DC9',
          600: '#3f63a3',
          700: '#334f82',
          800: '#2b4169',
          900: '#233451',
        },
      },
      typography: (theme) => ({
        // Tweaks so `prose` codelab content matches our shell in both themes.
        DEFAULT: {
          css: {
            maxWidth: 'none',
            a: {
              color: theme('colors.brand.600'),
              textDecoration: 'none',
              fontWeight: '500',
              '&:hover': { textDecoration: 'underline' },
            },
            'code::before': { content: '""' },
            'code::after': { content: '""' },
          },
        },
        invert: {
          css: {
            a: { color: theme('colors.brand.300') },
          },
        },
      }),
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
