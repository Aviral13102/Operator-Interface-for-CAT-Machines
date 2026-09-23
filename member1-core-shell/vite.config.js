import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  // Proxy table for development.
  // The frontend reads VITE_BACKEND_WS_URL from .env, but if that is not set
  // we fall back to the Vite dev-server proxy so you never need to touch CORS
  // config on the mock server while developing locally.
  //
  // How it works:
  //   browser → ws://localhost:5173/ws  (Vite dev server)
  //          → proxied to → ws://localhost:8001/ws  (mock_server.py)
  //
  // At integration time (Hour 10), set VITE_BACKEND_WS_URL to the real backend
  // URL and the proxy is bypassed entirely — no code changes needed.
  server: {
    proxy: {
      '/ws': {
        target: 'ws://localhost:8001',
        ws: true,           // enable WebSocket proxy
        changeOrigin: true,
      },
      '/api': {
        target: 'http://localhost:8001',
        changeOrigin: true,
      },
    },
  },
});
