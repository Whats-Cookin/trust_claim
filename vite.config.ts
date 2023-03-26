import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import vitePlugin from 'vite-plugin-test'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test :{
    global:true,
    environment:"jsdom",
    setupFiles:"./setupTests.ts"
  },
  

  
  build: {
    sourcemap: true,
  },
  server: {
    sourcemap: true,
  },
});
