/**
 * Test setup file for Vitest ONLY
 * This file should ONLY be loaded by Vitest, never by Playwright or Vite build
 * 
 * IMPORTANT: This file is referenced ONLY in vitest.config.js setupFiles
 * It should NOT be in the src/ directory to avoid Vite processing it
 */

import { expect, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers)

// Setup localStorage mock
if (!global.localStorage) {
  const localStorageMock = {
    store: {},
    getItem: function(key) {
      return this.store[key] || null
    },
    setItem: function(key, value) {
      this.store[key] = value.toString()
    },
    removeItem: function(key) {
      delete this.store[key]
    },
    clear: function() {
      this.store = {}
    }
  }
  global.localStorage = localStorageMock
}

// Mock window.location for React Router
if (typeof window !== 'undefined') {
  const noop = () => {}
  
  // Only mock if not already properly configured
  if (!window.location || !window.location.origin) {
    const locationMock = {
      href: 'http://localhost:3000',
      origin: 'http://localhost:3000',
      protocol: 'http:',
      host: 'localhost:3000',
      hostname: 'localhost',
      port: '3000',
      pathname: '/',
      search: '',
      hash: '',
      assign: noop,
      replace: noop,
      reload: noop,
      toString: function() { return this.href }
    }

    try {
      Object.defineProperty(window, 'location', {
        writable: true,
        configurable: true,
        value: locationMock
      })
    } catch (e) {
      // Ignore if already defined and not configurable
    }
  }

  // Mock window.history for React Router
  if (!window.history) {
    const historyMock = {
      length: 1,
      state: null,
      pushState: noop,
      replaceState: noop,
      go: noop,
      back: noop,
      forward: noop
    }
    
    try {
      Object.defineProperty(window, 'history', {
        writable: true,
        configurable: true,
        value: historyMock
      })
    } catch (e) {
      // Ignore
    }
  }

  // Mock window.matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: vi.fn((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
}

// Mock fetch
global.fetch = vi.fn()

// Cleanup after each test
afterEach(() => {
  cleanup()
  // Clear localStorage after each test
  if (global.localStorage && global.localStorage.clear) {
    global.localStorage.clear()
  }
})
