// tailwind.config.js
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  // ✅ FIX: Add safelist to ensure dynamic classes are generated
  safelist: [
    'dark:shadow-blue-500/20',
    'dark:shadow-green-500/20',
    'dark:shadow-purple-500/20',
    'dark:shadow-orange-500/20',
    'dark:shadow-yellow-500/20',
     'dark:shadow-indigo-500/20', 
  'dark:shadow-pink-500/20', 
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0D1B2A",  
        secondary: "#1B263B",
        third: "#14B8A6",
        accent: "#FACC15",
        neutral: "#111827",
        dark: {
          primary: "#0D1B2A",
          secondary: "#1B263B",
          text: "#F1F5F9",
          surface: "#1E293B",
          background: "#0A1128",
        },
      },
      backgroundImage: {
        'hero-light': "linear-gradient(90deg, #1E2A48 0%, #6A5ACD 50%, #5FB9D5 100%)",
        'hero-dark': "linear-gradient(to right, #334155, #111827)",
        'footer-dark-subtle': "linear-gradient(to top, #0D0F1C 0%, #1A1E2B 100%)",
        'footer-deep-blue-black': "linear-gradient(to top, #05050C 0%, #0F121F 100%)",
        'footer-textured-purple': "linear-gradient(to top, #1A1A2E 0%, #2C2B3F 100%)",
        'header-gradient-dynamic': "linear-gradient(90deg, #1A1E2F 0%, #3B3C6B 40%, #584CAF 70%, #4D3F8D 100%)",
      },
    },
  },
  plugins: [],
}