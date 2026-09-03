import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          gsap: ['gsap'],
          vendor: ['react', 'react-dom'],
        }
      }
    },
    chunkSizeWarningLimit: 1000,
  },
  assetsInclude: ['**/*.gif'],
})
