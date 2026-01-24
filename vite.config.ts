
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Tukar 'NAMA_REPO_ANDA' kepada nama repository GitHub anda nanti
export default defineConfig({
  plugins: [react()],
  base: './', // Menggunakan path relatif supaya berfungsi di GitHub Pages
  build: {
    outDir: 'dist',
  }
});
