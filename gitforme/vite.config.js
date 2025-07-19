import path from 'path'; 
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['react-hot-toast','@vercel/analytics', '@vercel/speed-insights']
  },
  build: {
    commonjsOptions: {
      include: [/react-hot-toast/, /node_modules/]
    }
  },
  resolve: {
    alias: {
      // Example of where 'path' would be used
      '@': path.resolve(__dirname, './src'),
    },
  },
});
