// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ command }) => {
  // command === 'serve' → dev mode, command === 'build' → production
  if (command === 'serve') {
    return {
      plugins: [react()],
      server: {
        host: true,   // only for local dev
        port: 5173,   // only for local dev
      },
    };
  } else {
    // Production build config
    return {
      plugins: [react()],
      build: {
        outDir: 'dist',       // default, you can keep it
        sourcemap: false,     // optional
      },
    };
  }
});
