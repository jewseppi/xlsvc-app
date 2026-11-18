/**
 * Unit tests for the admin-issued password reset flow:
 * - AuthPage handling of ?reset=1&token=...
 * - AdminPanel "Reset password" button and link panel
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react'
import App from '../../../src/App'
import axios from 'axios'

vi.mock('axios')

vi.mock('../../../src/components/Toast', () => ({
  ToastProvider: ({ children }) => children,
  useToast: () => ({ toast: Object.assign(vi.fn(), { success: vi.fn(), error: vi.fn(), info: vi.fn() }) }),
}))

Object.assign(navigator, {
  clipboard: { writeText: vi.fn(() => Promise.resolve()) },
})

const STRONG = 'BrandNewPassw0rd!'

const setLocation = (search = '') => {
  delete window.location
  window.location = {
    href: `http://localhost:3000/app${search}`,
    origin: 'http://localhost:3000',
    pathname: '/app',
    search,
    hash: '',
    assign: vi.fn(),
    replace: vi.fn(),
    reload: vi.fn(),
  }
}

const renderApp = async () => {
  await act(async () => {
    render(<App />)
  })
}

describe('Password reset – AuthPage', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
    setLocation('?token=reset-tok&reset=1')
    axios.get.mockResolvedValue({ data: null })
    vi.spyOn(window.history, 'replaceState').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('validates the token, pre-fills and locks the email', async () => {
    axios.post.mockResolvedValueOnce({ data: { valid: true, email: 'forgetful@example.com' } })
    await renderApp()

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/validate-reset-token'),
        { token: 'reset-tok' }
      )
    })
    const emailInput = await screen.findByLabelText(/email address/i)
    await waitFor(() => expect(emailInput).toHaveValue('forgetful@example.com'))
    expect(emailInput).toBeDisabled()
    expect(screen.getByText(/Choose a new password/i)).toBeInTheDocument()
    expect(screen.getByText(/Email from reset link/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/Enter a new password/i)).toBeInTheDocument()
    expect(screen.queryByText(/Registration is by invitation only/i)).not.toBeInTheDocument()
  })

  it('does not pre-fill email when the response is not valid', async () => {
    axios.post.mockResolvedValueOnce({ data: { valid: false } })
    await renderApp()
    const emailInput = await screen.findByLabelText(/email address/i)
    expect(emailInput).toHaveValue('')
  })

  it('shows the server error for a bad link', async () => {
    axios.post.mockRejectedValueOnce({ response: { data: { error: 'This reset link has already been used.' } } })
    await renderApp()
    expect(await screen.findByText(/already been used/i)).toBeInTheDocument()
  })

  it('falls back to a generic error message', async () => {
    axios.post.mockRejectedValueOnce(new Error('network'))
    await renderApp()
    expect(await screen.findByText(/Invalid password reset link/i)).toBeInTheDocument()
  })

  it('keeps submit disabled until the password is strong', async () => {
    axios.post.mockResolvedValueOnce({ data: { valid: true, email: 'f@example.com' } })
    await renderApp()
    const button = await screen.findByRole('button', { name: /Set new password/i })
    expect(button).toBeDisabled()
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: STRONG } })
    expect(button).not.toBeDisabled()
  })

  it('rejects a weak password on submit', async () => {
    axios.post.mockResolvedValueOnce({ data: { valid: true, email: 'f@example.com' } })
    await renderApp()
    fireEvent.change(await screen.findByLabelText(/^password$/i), { target: { value: 'weak' } })
    fireEvent.submit(screen.getByRole('button', { name: /Set new password/i }).closest('form'))
    expect(await screen.findByText(/Password does not meet all requirements/i)).toBeInTheDocument()
    expect(axios.post).toHaveBeenCalledTimes(1) // only the validate call
  })

  it('resets the password, stores the token, clears the URL and logs in', async () => {
    axios.post
      .mockResolvedValueOnce({ data: { valid: true, email: 'f@example.com' } })
      .mockResolvedValueOnce({ data: { access_token: 'new-access', email: 'f@example.com' } })
    axios.get.mockImplementation((url) => {
      if (url.includes('/profile')) {
        return Promise.resolve({ data: { email: 'f@example.com', is_admin: false } })
      }
      if (url.includes('/files')) return Promise.resolve({ data: { files: [] } })
      return Promise.resolve({ data: {} })
    })
    // No token in storage at first, so the initial profile check is skipped
    await renderApp()

    fireEvent.change(await screen.findByLabelText(/^password$/i), { target: { value: STRONG } })
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Set new password/i }))
    })

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/reset-password'),
        { token: 'reset-tok', password: STRONG }
      )
    })
    await waitFor(() => expect(localStorage.getItem('token')).toBe('new-access'))
    expect(window.history.replaceState).toHaveBeenCalledWith({}, '', '/app')
    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /Set new password/i })).not.toBeInTheDocument()
    })
  })

  it('shows the API error when reset fails', async () => {
    axios.post
      .mockResolvedValueOnce({ data: { valid: true, email: 'f@example.com' } })
      .mockRejectedValueOnce({ response: { data: { error: 'This reset link is invalid or has expired.' } } })
    await renderApp()
    fireEvent.change(await screen.findByLabelText(/^password$/i), { target: { value: STRONG } })
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Set new password/i }))
    })
    expect(await screen.findByText(/invalid or has expired/i)).toBeInTheDocument()
  })
})

describe('Password reset – login hint', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
    setLocation('')
    axios.get.mockResolvedValue({ data: null })
  })

  it('tells users to ask an admin for a reset link', async () => {
    await renderApp()
    expect(await screen.findByText(/Ask your administrator for a reset link/i)).toBeInTheDocument()
  })
})

describe('Password reset – AdminPanel', () => {
  const admin = { id: 2, email: 'admin@example.com', is_admin: true }
  const users = [
    { id: 1, email: 'forgetful@example.com', is_admin: false, created_at: '2024-01-01T10:00:00Z', file_count: 0 },
    { id: 2, email: 'admin@example.com', is_admin: true, created_at: '2024-01-01T10:00:00Z', file_count: 0 },
  ]

  beforeEach(() => {
    localStorage.clear()
    localStorage.setItem('token', 'admin-token')
    vi.clearAllMocks()
    setLocation('')
    window.confirm = vi.fn(() => true)
    axios.get.mockImplementation((url) => {
      if (url.includes('/profile')) return Promise.resolve({ data: admin })
      if (url.includes('/files')) return Promise.resolve({ data: { files: [] } })
      if (url.includes('/admin/invitations')) return Promise.resolve({ data: { invitations: [] } })
      if (url.includes('/admin/users')) return Promise.resolve({ data: { users } })
      return Promise.resolve({ data: {} })
    })
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  const resetButton = () => screen.findByRole('button', { name: /^Reset password$/i }, { timeout: 10000 })

  it('shows a Reset password button only for other users', async () => {
    await renderApp()
    await resetButton()
    expect(screen.getAllByRole('button', { name: /^Reset password$/i })).toHaveLength(1)
  })

  it('does nothing when the admin cancels the confirm', async () => {
    window.confirm = vi.fn(() => false)
    await renderApp()
    fireEvent.click(await resetButton())
    expect(axios.post).not.toHaveBeenCalled()
  })

  it('generates, shows, copies and dismisses the link', async () => {
    axios.post.mockResolvedValueOnce({
      data: { email: 'forgetful@example.com', reset_url: 'http://localhost:5173/app?reset=1&token=abc' },
    })
    await renderApp()
    fireEvent.click(await resetButton())

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/admin/users/1/reset-link'),
        {},
        { headers: { Authorization: 'Bearer admin-token' } }
      )
    })
    const textarea = await screen.findByLabelText(/Password reset link/i)
    expect(textarea).toHaveValue('http://localhost:5173/app?reset=1&token=abc')
    expect(screen.getByText(/Password reset link for forgetful@example.com/i)).toBeInTheDocument()
    fireEvent.click(textarea)

    vi.useFakeTimers({ shouldAdvanceTime: true })
    const panel = screen.getByTestId('reset-link-panel')
    const copyButton = Array.from(panel.querySelectorAll('button')).find((b) => /Copy to Clipboard/.test(b.textContent))
    await act(async () => {
      fireEvent.click(copyButton)
    })
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('http://localhost:5173/app?reset=1&token=abc')
    expect(await screen.findByText(/✓ Copied/)).toBeInTheDocument()
    await act(async () => {
      vi.advanceTimersByTime(3100)
    })
    expect(screen.queryByText(/✓ Copied/)).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /^Done$/i }))
    expect(screen.queryByTestId('reset-link-panel')).not.toBeInTheDocument()
  })

  it('shows an error when generating the link fails', async () => {
    axios.post.mockRejectedValueOnce({ response: { data: { error: 'Admin access required' } } })
    await renderApp()
    fireEvent.click(await resetButton())
    expect(await screen.findByText(/Admin access required/i)).toBeInTheDocument()
  })
})
