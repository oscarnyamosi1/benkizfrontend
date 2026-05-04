import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  server: {
    host: '0.0.0.0',
    port: 5000,

    // safer than true (prevents random host issues)
    allowedHosts: true,

    // ONLY use proxy for LOCAL BACKEND DEV
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/static': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },

  // 🔥 IMPORTANT: prevents production confusion
  preview: {
    host: '0.0.0.0',
    port: 5000,
  },
})