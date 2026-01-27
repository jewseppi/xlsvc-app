import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Only use base path for production builds, not for dev/E2E tests
  // Check both NODE_ENV and VITE_E2E_TEST to ensure base is '/' during E2E
  base: (process.env.NODE_ENV === 'production' && !process.env.VITE_E2E_TEST) ? '/app/' : '/',
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
