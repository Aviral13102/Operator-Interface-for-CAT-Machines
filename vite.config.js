import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// https://vitejs.dev/config/
//
// This config lives at the repo root (same level as package.json) so that
// `npm run dev` / `npm run build` work from the root without any extra flags.
//
// Root is set to member1-core-shell/ — that's where index.html and src/ live.
// The build output goes to member1-core-shell/dist/ so Member 3's Nginx config
// can be pointed there at deploy time.

export default defineConfig({
  plugins: [react()],

  // Tell Vite that the project root is the member1-core-shell folder
  root: fileURLToPath(new URL('./member1-core-shell', import.meta.url)),

  // Emit the production build here (relative to root)
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },

  // Dev server proxy — forwards /ws and /api to the local mock servers.
  //
  // How it works:
  //   browser → ws://localhost:5173/ws  (Vite dev server)
  //          → proxied to → ws://localhost:8001/ws  (mock_server.py)
  //
  // At integration time (Hour 10), set VITE_BACKEND_WS_URL in .env to the
  // real backend URL — the proxy is bypassed and no code changes are needed.
  server: {
    proxy: {
      '/ws': {
        target: 'ws://localhost:8001',
        ws: true,           // enable WebSocket proxying
        changeOrigin: true,
      },
      '/api': {
        target: 'http://localhost:8001',
        changeOrigin: true,
      },
    },
  },
});
