import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/Meal_planner-Frontend/',
  plugins: [react()],
  resolve: {
    preserveSymlinks: true,
  },
  server: {
    port: 3000,
    host: true,
    fs: {
      strict: false,
    },
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
});
