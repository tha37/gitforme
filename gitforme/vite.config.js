import path from 'path'; // <--- ADD THIS LINE
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['react-hot-toast']
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