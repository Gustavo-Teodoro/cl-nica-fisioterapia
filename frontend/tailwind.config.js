/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg:       '#f5f4f1',
        surface:  '#ffffff',
        sidebar:  '#1a2e28',
        accent:   '#3a6b5c',
        'accent-light': '#eaf2ef',
        'accent-hover': '#2e5549',
        indicator:'#5bb89a',
        border:   '#e8e6e1',
        text:     '#1a1a1a',
        'text-2': '#666666',
        'text-3': '#999999',
      },
      fontFamily: {
        sans:  ['DM Sans', 'sans-serif'],
        serif: ['DM Serif Display', 'serif'],
      },
      borderRadius: {
        DEFAULT: '12px',
      }
    },
  },
  plugins: [],
}
