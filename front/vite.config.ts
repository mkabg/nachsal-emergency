import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        sw: 'src/sw.ts',
      },
      output: {
        entryFileNames: assetInfo => {
          return assetInfo.name === 'sw' ? 'sw.js' : 'assets/[name]-[hash].js'
        }
      }
    }
  }
})
