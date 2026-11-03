import { defineConfig } from 'vite'

export default defineConfig({
  // Relative base works for GitHub Pages project sites and local preview
  base: './',
  server: {
    port: 5173,
    open: false,
  },
})
