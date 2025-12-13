import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  // Load all environment variables for the current mode.
  const env = loadEnv(mode, process.cwd(), '')
  
  // Use the VITE_API_URL environment variable if available,
  // otherwise default to your Render.com backend URL.
  const apiTarget = env.VITE_API_URL || 'https://atlas-server-3ewq.onrender.com'

  return {
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true,
          secure: false
        }
      }
    },
    preview: {
      host: true,
      port: 4173,
      strictPort: false,
      allowedHosts: [
        'atlas-gl63.onrender.com',
        '.onrender.com',
        'localhost'
      ],
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true,
          secure: false
        }
      }
    }
  }
})