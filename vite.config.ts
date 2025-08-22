import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Robust server/HMR defaults for local devcontainers or Codespaces.
const isCodespaces = !!process.env.CODESPACE_NAME;
const isDevContainer = process.env.DEVCONTAINER === 'true';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,          // = 0.0.0.0
    port: 5173,
    strictPort: true,
    watch: { usePolling: true, interval: 100 },
    // HMR settings:
    hmr: isCodespaces
      ? {
          protocol: 'wss',
          host: `${process.env.CODESPACE_NAME}-5173.app.github.dev`,
          port: 443
        }
      : {
          protocol: 'ws',
          host: 'localhost', // VS Code forwards to your host
          port: 5173
        }
  },
  preview: {
    host: true,
    port: 5173,
    strictPort: true
  }
});
