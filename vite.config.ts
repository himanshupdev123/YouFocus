import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Enable minification with esbuild (faster and included by default)
    minify: 'esbuild',
    // Optimize chunk splitting
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate vendor chunks for better caching
          'react-vendor': ['react', 'react-dom'],
          'axios-vendor': ['axios'],
        },
      },
    },
    // Set chunk size warning limit
    chunkSizeWarningLimit: 1000,
    // Disable source maps in production for smaller bundle size
    sourcemap: false,
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'axios'],
  },
  // Enable esbuild optimizations
  esbuild: {
    drop: ['console', 'debugger'], // Remove console.log and debugger in production
  },
})
