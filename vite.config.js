import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: false
  },
  // define: {
  //   global: 'globalThis',
  // },
  // resolve: {
  //   alias: {
  //     process: "process/browser",
  //     stream: "stream-browserify",
  //     zlib: "browserify-zlib",
  //     util: 'util',
  //     'axios/lib/adapters/fetch.js': '/src/shims/axiosFetchAdapter.js'
  //   }
  // }
})