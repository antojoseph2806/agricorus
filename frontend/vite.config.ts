import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path'; // ✅ Import Node path module

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // ✅ Alias setup for "@/"
    },
  },
  server: {
    proxy: {
      '/api': 'http://localhost:5000', // forward API requests to backend
    },
  },
});
