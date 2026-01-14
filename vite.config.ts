import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // Esto es para desarrollo local (npm run dev)
    port: 3000
  },
  preview: {
    allowedHosts: [
      'thevillanet.com',
      'www.thevillanet.com',
      'villanet-frontend.onrender.com'
    ]
  }
})