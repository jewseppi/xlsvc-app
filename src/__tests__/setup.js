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
  
  // Use a more robust mock that allows modification
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
  };

  try {
    Object.defineProperty(window, 'location', {
      writable: true,
      configurable: true,
      value: locationMock
    });
  } catch (e) {
    // Ignore if already defined and not configurable
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
    };
    
    try {
      Object.defineProperty(window, 'history', {
        writable: true,
        configurable: true,
        value: historyMock
      });
    } catch (e) {
      // Ignore
    }
  }
}

// Only load Vitest-specific code if we're actually in Vitest
// Strictly check for VITEST env var or global
const isVitest = (typeof process !== 'undefined' && process.env.VITEST === 'true') || 
                 (typeof globalThis !== 'undefined' && globalThis.__vitest_worker__);

if (isVitest) {
  (async () => {
    try {
      const vitestModule = await import('vitest')
      const { expect, afterEach, vi } = vitestModule
      
      const rtlModule = await import('@testing-library/react')
      const { cleanup } = rtlModule
      
      const matchersModule = await import('@testing-library/jest-dom/matchers')
      const matchers = matchersModule.default || matchersModule

      // Extend Vitest's expect with jest-dom matchers
      expect.extend(matchers)
      
      // Cleanup after each test
      afterEach(() => {
        cleanup()
        // Clear localStorage after each test
        if (global.localStorage && global.localStorage.clear) {
          global.localStorage.clear()
        }
      })

      // Mock window.matchMedia
      if (typeof window !== 'undefined') {
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

      // Mock fetch if needed
      global.fetch = vi.fn()
    } catch (e) {
      console.error('Failed to setup Vitest environment:', e)
    }
  })()
}
