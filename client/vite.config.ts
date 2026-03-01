import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import mkcert from 'vite-plugin-mkcert'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    port: 3000
  },
  plugins: [
    react(),
    tailwindcss(),
    ...(mode !== 'test' ? [mkcert()] : []),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: false,
  },
}))
