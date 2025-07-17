import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// vite.config.js
export default defineConfig({
  resolve: {
    extensions: ['.js', '.jsx', '.json', '.mjs'],
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})