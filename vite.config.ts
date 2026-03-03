import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // Esto es para desarrollo local (npm run dev)
    port: 3000
  },
  preview: {
    host: '0.0.0.0',
    allowedHosts: [
      'thevillanet.com',
      'www.thevillanet.com',
      'villanet-frontend.onrender.com',
      'villanet-frontend-dev.onrender.com'
    ]
  }
})