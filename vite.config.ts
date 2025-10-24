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
      'villanet-frontend.onrender.com'
    ]
  }
})