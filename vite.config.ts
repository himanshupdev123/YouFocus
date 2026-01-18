import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    // Explicitly define environment variables for Vite
    define: {
      'import.meta.env.VITE_YOUTUBE_API_KEY': JSON.stringify(env.VITE_YOUTUBE_API_KEY),
      'import.meta.env.VITE_YOUTUBE_API_KEY_2': JSON.stringify(env.VITE_YOUTUBE_API_KEY_2),
      'import.meta.env.VITE_YOUTUBE_API_KEY_3': JSON.stringify(env.VITE_YOUTUBE_API_KEY_3),
      'import.meta.env.VITE_YOUTUBE_API_KEY_4': JSON.stringify(env.VITE_YOUTUBE_API_KEY_4),
      'import.meta.env.VITE_YOUTUBE_API_KEY_5': JSON.stringify(env.VITE_YOUTUBE_API_KEY_5),
    },
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
      // Temporarily keep console.log for debugging environment variables
      // drop: ['console', 'debugger'], // Remove console.log and debugger in production
    },
  }
})
