import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://127.0.0.1:8000',
      '/predict': 'http://127.0.0.1:8000',
      '/orchestrate': 'http://127.0.0.1:8000',
      '/auto_route': 'http://127.0.0.1:8000',
      '/overfishing_monitor': 'http://127.0.0.1:8000',
    }
  }
})
