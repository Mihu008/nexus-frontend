import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env variables based on mode, search in current directory
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    server: {
      // Use configured PORT or fallback to 3000
      port: parseInt(env.PORT) || 3000,
      // Proxy local /api calls directly to the Spring Boot backend to avoid CORS issues
      proxy: {
        '/api': {
          target: env.VITE_BACKEND_URL || 'http://localhost:8081',
          changeOrigin: true,
          secure: false
        }
      }
    }
  }
})
