/**
 * Unit tests that trigger the App error boundary to cover ErrorFallback.
 * Uses a mock that makes a Dashboard child throw so ErrorBoundary renders ErrorFallback.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../../src/App'
import axios from 'axios'

vi.mock('axios')

vi.mock('../../src/components/FilterConfiguration', () => ({
  default: function MockFilterConfigurationThrows() {
    throw new Error('Test error for error boundary')
  }
}))

describe('App Error Boundary', () => {
  const mockUser = { id: 1, email: 'test@example.com', is_admin: false }
  const mockFiles = [{ id: 1, original_filename: 'test.xlsx', file_size: 1024, upload_date: '2024-01-01', processed: false }]

  beforeEach(() => {
    localStorage.clear()
    localStorage.setItem('token', 'test-token')
    vi.clearAllMocks()
    delete window.location
    window.location = {
      href: 'http://localhost:3000/app',
      origin: 'http://localhost:3000',
      pathname: '/app',
      search: '',
      hash: '',
      assign: vi.fn(),
      replace: vi.fn(),
      reload: vi.fn()
    }
    axios.get.mockImplementation((url) => {
      if (url.includes('/profile')) return Promise.resolve({ data: mockUser })
      if (url.includes('/files') && url.includes('/generated')) return Promise.resolve({ data: { macros: [], instructions: [], reports: [], processed: [] } })
      if (url.includes('/files') && url.includes('/history')) return Promise.resolve({ data: { history: [] } })
      if (url.includes('/files')) return Promise.resolve({ data: { files: mockFiles } })
      return Promise.resolve({ data: {} })
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders ErrorFallback when Dashboard child throws', async () => {
    const user = userEvent.setup()
    await act(async () => {
      render(<App />)
    })
    await waitFor(() => {
      expect(screen.getByText(/Welcome, test@example.com/i)).toBeInTheDocument()
    }, { timeout: 5000 })
    await waitFor(() => {
      expect(screen.getByText('test.xlsx')).toBeInTheDocument()
    }, { timeout: 5000 })
    await act(async () => {
      await user.click(screen.getByText('test.xlsx'))
    })
    await waitFor(() => {
      expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument()
      expect(screen.getByText(/Test error for error boundary/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Try again/i })).toBeInTheDocument()
    }, { timeout: 5000 })
  })

  it('ErrorFallback Try again button calls resetErrorBoundary and re-renders Dashboard', async () => {
    const user = userEvent.setup()
    await act(async () => {
      render(<App />)
    })
    await waitFor(() => {
      expect(screen.getByText(/Welcome, test@example.com/i)).toBeInTheDocument()
    }, { timeout: 5000 })
    await waitFor(() => {
      expect(screen.getByText('test.xlsx')).toBeInTheDocument()
    }, { timeout: 5000 })
    await act(async () => {
      await user.click(screen.getByText('test.xlsx'))
    })
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Try again/i })).toBeInTheDocument()
    }, { timeout: 5000 })
    await act(async () => {
      screen.getByRole('button', { name: /Try again/i }).click()
    })
    // After reset, ErrorBoundary re-mounts children; Dashboard shows without a file selected
    await waitFor(() => {
      expect(screen.getByText(/Welcome, test@example.com/i)).toBeInTheDocument()
      expect(screen.getByText(/Select a file from the left to start analysis/i)).toBeInTheDocument()
    }, { timeout: 3000 })
  })
})
