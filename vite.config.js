import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // Electron (file://) necesita rutas relativas en producción
  base: './',
  plugins: [react()],
});

