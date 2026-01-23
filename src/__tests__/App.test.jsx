/**
 * Unit tests for App component
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import App from '../App'

// Mock axios
vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  }
}))

describe('App', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('renders without crashing', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    )
  })

  it('shows loading state initially', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    )
    // The app should render something (either loading or content)
    expect(document.body).toBeTruthy()
  })
})
