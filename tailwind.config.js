/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}", // Ajoutez cette ligne pour inclure tous les fichiers dans le dossier src
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}