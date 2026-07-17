import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/',
  plugins: [react()],
  server: {
    open: true,
    port: 4202
  },
  resolve: {
    alias: {
      xmlbuilder2: 'xmlbuilder2/lib/xmlbuilder2.min.js'
    }
  }
})
