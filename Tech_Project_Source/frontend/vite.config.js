import { defineConfig } from 'vite'
// Triggering fresh deployment for routing fix
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
})
