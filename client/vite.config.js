import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  // Load all environment variables for the current mode.
  const env = loadEnv(mode, process.cwd(), '')
  
  // Use the VITE_API_URL environment variable if available,
  // otherwise default to your AWS EB URL.
  const apiTarget = env.VITE_API_URL || 'http://uniflow.ap-southeast-2.elasticbeanstalk.com'

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
    }
  }
})