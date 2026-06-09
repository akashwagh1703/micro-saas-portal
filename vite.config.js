import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  if (mode === 'production' && !env.VITE_API_URL) {
    throw new Error(
      'VITE_API_URL must be set for production builds (e.g. https://api.autowave.playltp.in/api)',
    )
  }

  return {
    // Path the app is served from. Defaults to the domain root (Render, etc.).
    // For the cidcomitra.com reverse proxy, build with VITE_BASE_PATH=/micro-saas/.
    base: env.VITE_BASE_PATH || '/',
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
  }
})
