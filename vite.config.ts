/// <reference types="vitest" />
/// <reference types="vite/client" />

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    open: true
  },
  build: {
    sourcemap: false,
    target: 'es2015',
    chunkSizeWarningLimit: 2000,
    minify: 'esbuild',
    rollupOptions: {
      onwarn(warning, warn) {
        // Ignore "use client" warnings
        if (warning.code === 'MODULE_LEVEL_DIRECTIVE' && 
            warning.message.includes('"use client"')) {
          return
        }
        warn(warning)
      },
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom']
        }
      },
      maxParallelFileOps: 1
    }
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
  },
  test: {
    coverage: {
      provider: 'c8',
      reporter: ['text', 'json', 'html']
    },
    globals: true,
    environment: 'jsdom',
    css: true,
    setupFiles: './src/test/setup.ts'
  },
  optimizeDeps: {
    exclude: ['@mui/icons-material']
  }
})
