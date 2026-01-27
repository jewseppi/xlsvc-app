import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/app/',
  // Exclude test files from being processed by Vite
  optimizeDeps: {
    exclude: ['vitest', '@vitest/expect', '@vitest/runner', '@vitest/ui', '@vitest/coverage-v8']
  },
  build: {
    rollupOptions: {
      external: ['vitest', '@vitest/expect', '@vitest/runner', '@vitest/ui', '@vitest/coverage-v8']
    }
  }
})
