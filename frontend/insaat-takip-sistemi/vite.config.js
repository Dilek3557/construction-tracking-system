import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/auth': { target: 'http://localhost:8080', changeOrigin: true },
      '/dashboard': { target: 'http://localhost:8080', changeOrigin: true },
      '/projects': { target: 'http://localhost:8080', changeOrigin: true },
      '/stages': { target: 'http://localhost:8080', changeOrigin: true },
      '/users': { target: 'http://localhost:8080', changeOrigin: true },
      '/announcements': { target: 'http://localhost:8080', changeOrigin: true },
      '/general-notes': { target: 'http://localhost:8080', changeOrigin: true },
    },
  },
})
