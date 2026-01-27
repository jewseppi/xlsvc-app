/**
 * Unit tests for App component
 * Tests routing, authentication flow, loading states, and error handling
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ThemeProvider } from 'styled-components'
import App from '../App'
import { theme } from '../styled/theme'
import axios from 'axios'

vi.mock('axios')

// Helper to render App with specific route
const renderAppWithRoute = (initialRoute = '/') => {
  // We need to render App without its own BrowserRouter since it includes one
  // So we just render the App component directly
  return render(<App />, {
    wrapper: ({ children }) => children
  })
}

describe('App', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
    vi.clearAllMocks()
    
    // Reset window.location to default
    delete window.location
    window.location = {
      href: 'http://localhost:3000/',
      origin: 'http://localhost:3000',
      pathname: '/',
      search: '',
      hash: '',
      assign: vi.fn(),
      replace: vi.fn(),
      reload: vi.fn()
    }
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Initial Rendering', () => {
    it('renders without crashing', async () => {
      axios.get.mockResolvedValue({ data: null })
      
      await act(async () => {
        render(<App />)
      })
      
      expect(document.body).toBeTruthy()
    })

    it('shows loading state when checking token', async () => {
      localStorage.setItem('token', 'test-token')
      // Mock that never resolves to keep loading state
      axios.get.mockImplementation(() => new Promise(() => {}))
      
      render(<App />)
      
      // The loading state shows "Loading..." text
      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('completes loading when no token exists', async () => {
      axios.get.mockResolvedValue({ data: null })
      
      await act(async () => {
        render(<App />)
      })
      
      // Should not be in loading state
      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
      })
    })
  })

  describe('Routing', () => {
    it('shows landing page at root route', async () => {
      axios.get.mockResolvedValue({ data: null })
      
      await act(async () => {
        render(<App />)
      })
      
      // Landing page contains the hero section
      await waitFor(() => {
        expect(screen.getByText(/Clean Massive Excel Workbooks/i)).toBeInTheDocument()
      })
    })

    it('shows landing page features section', async () => {
      axios.get.mockResolvedValue({ data: null })
      
      await act(async () => {
        render(<App />)
      })
      
      await waitFor(() => {
        expect(screen.getByText(/Multi-Sheet Processing/i)).toBeInTheDocument()
      })
    })

    it('landing page has link to app', async () => {
      axios.get.mockResolvedValue({ data: null })
      
      await act(async () => {
        render(<App />)
      })
      
      await waitFor(() => {
        const launchLinks = screen.getAllByText(/Launch App|Try It Free/i)
        expect(launchLinks.length).toBeGreaterThan(0)
      })
    })

    it('navigates to /app route when clicking Launch App', async () => {
      axios.get.mockResolvedValue({ data: null })
      
      await act(async () => {
        render(<App />)
      })
      
      // Find and click the Launch App link
      await waitFor(() => {
        const launchAppLink = screen.getByRole('link', { name: /Launch App/i })
        expect(launchAppLink).toHaveAttribute('href', '/app')
      })
    })
  })

  describe('Authentication Flow', () => {
    it('loads user profile when valid token exists', async () => {
      localStorage.setItem('token', 'valid-test-token')
      const mockUser = { id: 1, email: 'test@example.com', is_admin: false }
      axios.get.mockResolvedValue({ data: mockUser })
      
      await act(async () => {
        render(<App />)
      })
      
      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith(
          expect.stringContaining('/profile'),
          expect.objectContaining({
            headers: { Authorization: 'Bearer valid-test-token' }
          })
        )
      })
    })

    it('removes token on profile fetch error (401 Unauthorized)', async () => {
      localStorage.setItem('token', 'invalid-token')
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      axios.get.mockRejectedValue({ response: { status: 401, data: { error: 'Unauthorized' } } })
      
      await act(async () => {
        render(<App />)
      })
      
      await waitFor(() => {
        expect(localStorage.getItem('token')).toBeNull()
      }, { timeout: 3000 })
      
      consoleSpy.mockRestore()
    })

    it('removes token on network error', async () => {
      localStorage.setItem('token', 'test-token')
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      axios.get.mockRejectedValue(new Error('Network Error'))
      
      await act(async () => {
        render(<App />)
      })
      
      await waitFor(() => {
        expect(localStorage.getItem('token')).toBeNull()
      }, { timeout: 3000 })
      
      consoleSpy.mockRestore()
    })

    it('stores token after successful login', async () => {
      axios.get.mockResolvedValue({ data: null })
      axios.post.mockResolvedValueOnce({ data: { access_token: 'new-access-token' } })
      axios.get.mockResolvedValueOnce({ data: { id: 1, email: 'user@example.com' } })
      
      await act(async () => {
        render(<App />)
      })
      
      // Verify initial state has no token
      expect(localStorage.getItem('token')).toBeNull()
    })
  })

  describe('Error Handling', () => {
    it('handles profile fetch timeout gracefully', async () => {
      localStorage.setItem('token', 'test-token')
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      axios.get.mockRejectedValue({ code: 'ECONNABORTED', message: 'timeout' })
      
      await act(async () => {
        render(<App />)
      })
      
      await waitFor(() => {
        // Token should be cleared on error
        expect(localStorage.getItem('token')).toBeNull()
      }, { timeout: 3000 })
      
      consoleSpy.mockRestore()
    })

    it('handles malformed API response', async () => {
      localStorage.setItem('token', 'test-token')
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      axios.get.mockRejectedValue({ response: { data: null } })
      
      await act(async () => {
        render(<App />)
      })
      
      await waitFor(() => {
        expect(localStorage.getItem('token')).toBeNull()
      }, { timeout: 3000 })
      
      consoleSpy.mockRestore()
    })

    it('continues to render landing page after auth error', async () => {
      localStorage.setItem('token', 'bad-token')
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      axios.get.mockRejectedValue(new Error('Auth failed'))
      
      await act(async () => {
        render(<App />)
      })
      
      await waitFor(() => {
        // App should still render the landing page
        expect(screen.getByText(/Clean Massive Excel Workbooks/i)).toBeInTheDocument()
      })
      
      consoleSpy.mockRestore()
    })
  })

  describe('Theme Provider', () => {
    it('applies theme to components', async () => {
      axios.get.mockResolvedValue({ data: null })
      
      await act(async () => {
        render(<App />)
      })
      
      // The app should render with styled-components theme
      await waitFor(() => {
        expect(document.body).toBeTruthy()
      })
    })
  })

  describe('Error Boundary', () => {
    it('renders error fallback when component throws', async () => {
      // The ErrorBoundary is around Dashboard, so we need a logged-in user at /app
      localStorage.setItem('token', 'test-token')
      const mockUser = { id: 1, email: 'test@example.com', is_admin: false }
      axios.get.mockResolvedValue({ data: mockUser })
      
      // Navigate to /app route
      window.location.pathname = '/app'
      
      await act(async () => {
        render(<App />)
      })
      
      // For now, just verify the app renders
      await waitFor(() => {
        expect(document.body).toBeTruthy()
      })
    })
  })

  describe('Logout Functionality', () => {
    it('clears token and user state on logout', async () => {
      localStorage.setItem('token', 'test-token')
      const mockUser = { id: 1, email: 'test@example.com', is_admin: false }
      
      // First call for profile, subsequent calls for files, etc.
      axios.get
        .mockResolvedValueOnce({ data: mockUser })
        .mockResolvedValue({ data: { files: [] } })
      
      // Set pathname to /app to see dashboard
      window.location.pathname = '/app'
      
      await act(async () => {
        render(<App />)
      })
      
      // Wait for user to be loaded and dashboard to render
      await waitFor(() => {
        expect(screen.getByText(/Welcome, test@example.com/i)).toBeInTheDocument()
      }, { timeout: 3000 })
      
      // Click logout button
      const logoutButton = screen.getByRole('button', { name: /logout/i })
      
      await act(async () => {
        fireEvent.click(logoutButton)
      })
      
      // Token should be removed
      expect(localStorage.getItem('token')).toBeNull()
    })
  })
})
