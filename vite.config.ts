
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Menggunakan base: '' atau './' memastikan fail JS/CSS ditarik secara relatif
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // Memastikan tiada masalah hash yang mengelirukan di GitHub Pages
    sourcemap: false
  }
});
