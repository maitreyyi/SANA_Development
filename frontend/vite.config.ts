import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';


// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/',
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    origin: 'http://hayeslab.ics.uci.edu',
    hmr: {
      protocol: 'ws',
      host: 'hayeslab.ics.uci.edu',
      port: 5173
    }
  }
});
