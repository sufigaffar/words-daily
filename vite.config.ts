import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/words-daily/',
  plugins: [react()],
  server: {
    allowedHosts: ['0b0b-209-35-68-167.ngrok-free.app'],
  },
})
