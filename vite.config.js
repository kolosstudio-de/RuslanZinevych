import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  server: {
    host: true, // Listen on all addresses, including LAN and public addresses
    cors: true,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          if (id.includes('framer-motion') || id.includes('/motion')) return 'motion'
          if (id.includes('gsap')) return 'gsap'
          if (id.includes('i18next')) return 'i18n'
          if (id.includes('react') || id.includes('scheduler')) return 'react'
        },
      },
    },
  },
})
