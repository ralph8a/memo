import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/memo/',
  plugins: [react()],
  publicDir: 'assets', // Copia la carpeta 'assets' desde la raíz al build final
});