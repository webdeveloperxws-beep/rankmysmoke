
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],

  build: {
    manifest: true,
    assetsInlineLimit: 0,
  },

  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    watch: {
      ignored: ['**/backend/**'],
    },
    proxy: {
      '/api/blog-views': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
      },
      '/api/blog-trending': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
      },
    },
  },
})
