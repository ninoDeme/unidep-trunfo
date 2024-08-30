import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    }
  },
  server: {
    proxy: {
      '/api': 'http://localhost:3000',
      '/api/jogo/ws': {
        target: 'ws://localhost:3000',
        ws: true
      },
      '/uploads': 'http://localhost:3000'
    }
  }
})
