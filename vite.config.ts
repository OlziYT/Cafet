import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/school-meal-management/',
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});