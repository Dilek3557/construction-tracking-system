/* eslint-env node */
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

const apiProxyPaths = [
  '/auth',
  '/dashboard',
  '/projects',
  '/stages',
  '/users',
  '/announcements',
  '/general-notes',
]

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  /** Dev proxy target: doğrudan VITE kullanmak istemezsen localhost:8080 */
  const proxyTarget =
    (env.VITE_DEV_PROXY_TARGET && env.VITE_DEV_PROXY_TARGET.trim().replace(/\/$/, '')) ||
    'http://localhost:8080'

  const proxy = {}
  for (const p of apiProxyPaths) {
    proxy[p] = { target: proxyTarget, changeOrigin: true }
  }

  return {
    plugins: [react()],
    server: {
      proxy,
    },
  }
})
