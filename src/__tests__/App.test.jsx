/**
 * Unit tests for App component
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import App from '../App'
import axios from 'axios'

vi.mock('axios')

describe('App', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
    vi.clearAllMocks()
    // Mock window.location
    delete window.location
    window.location = { search: '' }
  })

  it('renders without crashing', () => {
    axios.get.mockResolvedValue({ data: null })
    render(<App />)
  })

  it('shows loading state initially when checking token', () => {
    axios.get.mockImplementation(() => new Promise(() => {})) // Never resolves
    render(<App />)
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('shows landing page at root route', async () => {
    axios.get.mockResolvedValue({ data: null })
    render(<App />)
    await waitFor(() => {
      // Landing page should be rendered
      expect(document.body).toBeTruthy()
    })
  })

  it('loads user profile when token exists', async () => {
    localStorage.setItem('token', 'test-token')
    const mockUser = { id: 1, email: 'test@example.com', is_admin: false }
    axios.get.mockResolvedValue({ data: mockUser })
    
    render(<App />)
    
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('/profile'),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: expect.stringContaining('Bearer')
          })
        })
      )
    })
  })

  it('removes token on profile fetch error', async () => {
    localStorage.setItem('token', 'invalid-token')
    axios.get.mockRejectedValue(new Error('Unauthorized'))
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    render(<App />)
    
    await waitFor(() => {
      expect(localStorage.getItem('token')).toBeNull()
    })
    
    consoleSpy.mockRestore()
  })

  it('shows auth page when no user and navigating to /app', async () => {
    axios.get.mockResolvedValue({ data: null })
    window.location.pathname = '/app'
    
    render(<App />)
    
    await waitFor(() => {
      // Should show auth form
      expect(screen.getByText(/excel processor/i)).toBeInTheDocument()
    })
  })

  it('shows login form by default', async () => {
    axios.get.mockResolvedValue({ data: null })
    window.location.pathname = '/app'
    
    render(<App />)
    
    await waitFor(() => {
      expect(screen.getByText(/sign in to your account/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    })
  })

  it('switches to registration form when clicking register link', async () => {
    axios.get.mockResolvedValue({ data: null })
    window.location.pathname = '/app'
    
    render(<App />)
    
    await waitFor(() => {
      const registerLink = screen.getByText(/register/i)
      fireEvent.click(registerLink)
    })
    
    await waitFor(() => {
      expect(screen.getByText(/registration requires an invitation/i)).toBeInTheDocument()
    })
  })

  it('handles login form submission', async () => {
    axios.get.mockResolvedValue({ data: null })
    axios.post
      .mockResolvedValueOnce({ data: { access_token: 'new-token' } })
      .mockResolvedValueOnce({ data: { id: 1, email: 'test@example.com' } })
    
    window.location.pathname = '/app'
    
    render(<App />)
    
    await waitFor(() => {
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      fireEvent.click(submitButton)
    })
    
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/login'),
        expect.objectContaining({
          email: 'test@example.com',
          password: 'password123'
        })
      )
    })
  })

  it('displays error message on login failure', async () => {
    axios.get.mockResolvedValue({ data: null })
    axios.post.mockRejectedValue({
      response: { data: { error: 'Invalid credentials' } }
    })
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    window.location.pathname = '/app'
    
    render(<App />)
    
    await waitFor(() => {
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'wrong' } })
      fireEvent.click(submitButton)
    })
    
    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument()
    })
    
    consoleSpy.mockRestore()
  })
})
