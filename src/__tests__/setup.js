/**
 * Test setup file for Vitest
 * This file runs before all tests
 * Only loads Vitest-specific code when running Vitest (not Playwright)
 */

// Use actual localStorage but clear it before each test
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

// Mock window.location for React Router (needed for both Vitest and Playwright)
// Only set up if window exists and location isn't already properly configured
if (typeof window !== 'undefined' && (!window.location || !window.location.origin)) {
  const noop = () => {}
  
  Object.defineProperty(window, 'location', {
    writable: true,
    value: {
      href: 'http://localhost:3000',
      origin: 'http://localhost:3000',
      pathname: '/',
      search: '',
      hash: '',
      assign: noop,
      replace: noop,
      reload: noop
    }
  })

  // Mock window.history for React Router
  Object.defineProperty(window, 'history', {
    writable: true,
    value: {
      length: 1,
      state: null,
      pushState: noop,
      replaceState: noop,
      go: noop,
      back: noop,
      forward: noop
    }
  })
}

// Only load Vitest-specific code if we're actually in Vitest
// Check by seeing if vitest globals are available
if (typeof globalThis !== 'undefined' && (globalThis.__vitest_worker__ || process.env.VITEST)) {
  // Dynamic import to avoid loading in Playwright
  import('vitest').then(({ expect, afterEach, vi }) => {
    import('@testing-library/react').then(({ cleanup }) => {
      import('@testing-library/jest-dom/matchers').then((matchers) => {
        // Extend Vitest's expect with jest-dom matchers
        expect.extend(matchers.default || matchers)
        
        // Cleanup after each test
        afterEach(() => {
          cleanup()
          // Clear localStorage after each test
          if (global.localStorage && global.localStorage.clear) {
            global.localStorage.clear()
          }
        })

        // Mock window.matchMedia
        Object.defineProperty(window, 'matchMedia', {
          writable: true,
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

        // Mock fetch if needed
        global.fetch = vi.fn()
      })
    })
  }).catch(() => {
    // Not in Vitest environment, silently skip
  })
}
