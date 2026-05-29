import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  // Path the app is served from. Defaults to the reverse-proxy path used on
  // cidcomitra.com; set VITE_BASE_PATH=/ when hosting at a domain root (e.g. Render).
  base: process.env.VITE_BASE_PATH || '/micro-saas/',
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
      },
    },
  },
})
