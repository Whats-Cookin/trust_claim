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
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    commonjsOptions: {
      include: [/node_modules/]
    },
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
          if (id.includes('node_modules')) {
            if (id.includes('@mui/icons-material')) {
              const iconName = id.split('/').pop()?.replace('.js', '')
              return `icons/${iconName}`
            }
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'react-vendor'
            }
            if (id.includes('@mui/material') || id.includes('@mui/system')) {
              return 'mui-vendor'
            }
            if (id.includes('@emotion')) {
              return 'emotion-vendor'
            }
          }
        }
      },
      maxParallelFileOps: 2
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
      '@mui/system',
      '@emotion/react',
      '@emotion/styled'
    ],
    exclude: ['@mui/icons-material'],
    esbuildOptions: {
      target: 'es2020',
      keepNames: true
    }
  }
})
