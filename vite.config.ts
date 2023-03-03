import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    target: 'es2020'
  },
  plugins: [react()],
  optimizeDeps: {
    esbuildOptions : {
      target: "es2020"
  },
    exclude: ['']
  },
  server: { 
    host: '0.0.0.0'
  },
  define: {
    'process.env': {}
  }
})

