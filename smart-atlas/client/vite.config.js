import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// /api ile başlayan istekleri sunucuya (5000) yönlendirir.
// Böylece React kodunda tam adres yazmaya ve CORS ile uğraşmaya gerek kalmaz.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:5000'
    }
  }
});
