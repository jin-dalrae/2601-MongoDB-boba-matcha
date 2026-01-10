/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'brand': '#9FE870', // Match our custom green
            },
            fontFamily: {
                'brand': ['Gluten', 'cursive'],
                'body': ['Inter', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
