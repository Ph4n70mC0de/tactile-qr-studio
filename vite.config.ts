/// <reference types="vitest/globals" />

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

// HMR is disabled in AI Studio via DISABLE_HMR env var.
// Do not modify — file watching is disabled to prevent flickering during agent edits.
const disableHMR = process.env.DISABLE_HMR === 'true';

export default defineConfig(() => ({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  server: {
    hmr: !disableHMR,
    watch: disableHMR ? null : {},
  },
  test: {
    environment: 'happy-dom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    globals: true,
    coverage: {
      provider: 'vitest',
      reporter: ['text', 'lcov'],
    },
  },
}));
