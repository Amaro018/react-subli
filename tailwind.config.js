/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,js,ts,tsx}",
    "./src/app/*.{html,js,ts,tsx}",
    "./src/app/components/*.{html,js,ts,tsx}",
    "./src/app/components/**/*.{html,js,ts,tsx}",
    "./src/app/(auth)/*.{html,js,ts,tsx}",
    "./src/app/(auth)/components/*.{html,js,ts,tsx}",
    "./src/app/(auth)/components/**/*.{html,js,ts,tsx}",
    "./src/app/(auth)/login/*.{html,js,ts,tsx}",
    "./src/app/(auth)/signup/*.{html,js,ts,tsx}",
    "./src/app/(auth)/reset-password/*.{html,js,ts,tsx}",
    "./src/app/(auth)/forgot-password/*.{html,js,ts,tsx}",
  ],

  theme: {
    extend: {},
  },
  plugins: [],
}
