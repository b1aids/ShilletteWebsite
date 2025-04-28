import { defineConfig } from 'vite';

export default defineConfig({
  base: '/',
  server: {
    port: 5173,
    host: true
  },
  build: {
    rollupOptions: {
      input: {
        main: '/index.html',
        products: '/products/index.html',
        tickets: '/tickets/index.html',
        dashboard: '/dashboard/index.html'
      }
    }
  }
});