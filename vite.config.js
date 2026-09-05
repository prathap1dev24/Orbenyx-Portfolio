import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 5180,
    open: false,
    host: true
  },
  build: {
    target: 'esnext'
  }
});
