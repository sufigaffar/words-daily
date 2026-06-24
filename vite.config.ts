import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

function stripAnalytics() {
  return {
    name: 'strip-analytics',
    transformIndexHtml(html: string) {
      return html
        .replace(/\s*<!-- Google tag[\s\S]*?<\/script>/g, '')
        .replace(/<script>\s*window\.dataLayer[\s\S]*?<\/script>/g, '');
    },
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  base: '/',
  plugins: [react(), ...(mode === 'development' ? [stripAnalytics()] : [])],
  server: {
    allowedHosts: ['0b0b-209-35-68-167.ngrok-free.app'],
  },
}))
