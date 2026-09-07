import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // Served from https://bancsdan.github.io/mathvis/
  base: '/mathvis/',
  plugins: [react()],
})
