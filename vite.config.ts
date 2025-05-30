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
    target: 'es2020',
    chunkSizeWarningLimit: 1000,
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
        manualChunks(id) {
          // Create vendor chunks for node_modules
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'react-vendor';
            }
            if (id.includes('@mui') || id.includes('@emotion')) {
              return 'mui-vendor';
            }
            if (id.includes('cytoscape')) {
              return 'graph-vendor';
            }
            if (id.includes('axios') || id.includes('date-fns') || id.includes('react-hook-form')) {
              return 'utils-vendor';
            }
            // All other vendor deps
            return 'vendor';
          }
        }
      }
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
    include: [
      'react',
      'react-dom',
      'react/jsx-runtime',
      '@mui/material',
      '@mui/icons-material',
      '@mui/system',
      '@emotion/react',
      '@emotion/styled'
    ],
    esbuildOptions: {
      target: 'es2020'
    }
  }
})
