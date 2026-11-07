import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        tienda: resolve(__dirname, 'tienda.html'),
        producto: resolve(__dirname, 'producto.html'),
        servicios: resolve(__dirname, 'servicios.html'),
      },
      output: { manualChunks: { three: ['three'], gsap: ['gsap', 'lenis'] } },
    },
  },
});
