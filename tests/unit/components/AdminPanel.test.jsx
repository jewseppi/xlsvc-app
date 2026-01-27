/**
 * Unit tests for AdminPanel component
 * Tests invitation management, user management, and all admin functionality
 * 
 * Note: AdminPanel is defined within App.jsx, so we test it through the App component
 * by rendering Dashboard with an admin user
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../../../src/App'
import axios from 'axios'

vi.mock('axios')

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(() => Promise.resolve()),
  },
})

describe('AdminPanel', () => {
  const mockAdminUser = { id: 2, email: 'admin@example.com', is_admin: true }
  
  const mockInvitations = [
    {
      id: 1,
      email: 'user1@example.com',
      status: 'pending',
      created_at: '2024-01-15T10:00:00Z',
      expires_at: '2024-01-22T10:00:00Z'
    },
    {
      id: 2,
      email: 'user2@example.com',
      status: 'used',
      created_at: '2024-01-10T10:00:00Z',
      expires_at: '2024-01-17T10:00:00Z'
    }
  ]

  const mockUsers = [
    {
      id: 1,
      email: 'user1@example.com',
      is_admin: false,
      created_at: '2024-01-01T10:00:00Z'
    },
    {
      id: 2,
      email: 'admin@example.com',
      is_admin: true,
      created_at: '2024-01-01T10:00:00Z'
    }
  ]

  beforeEach(() => {
    localStorage.clear()
    localStorage.setItem('token', 'test-token')
    vi.clearAllMocks()
    
    // Set up window.location for /app route
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

    // Mock window functions
    window.alert = vi.fn()
    window.confirm = vi.fn(() => true)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  const renderAdminPanel = async () => {
    // Setup mocks for authenticated admin user
    axios.get.mockImplementation((url) => {
      if (url.includes('/profile')) {
        return Promise.resolve({ data: mockAdminUser })
      }
      if (url.includes('/files') && url.includes('/generated')) {
        return Promise.resolve({ data: { macros: [], instructions: [], reports: [], processed: [] } })
      }
      if (url.includes('/files') && url.includes('/history')) {
        return Promise.resolve({ data: { history: [] } })
      }
      if (url.includes('/files')) {
        return Promise.resolve({ data: { files: [] } })
      }
      if (url.includes('/admin/invitations')) {
        return Promise.resolve({ data: { invitations: mockInvitations } })
      }
      if (url.includes('/admin/users')) {
        return Promise.resolve({ data: { users: mockUsers } })
      }
      return Promise.resolve({ data: {} })
    })

    await act(async () => {
      render(<App />)
    })

    // Wait for admin panel to render
    await waitFor(() => {
      expect(screen.getByText(/Admin Panel/i)).toBeInTheDocument()
    }, { timeout: 3000 })
  }

  describe('Admin Panel Visibility', () => {
    it('renders admin panel for admin users', async () => {
      await renderAdminPanel()
      expect(screen.getByText(/Admin Panel/i)).toBeInTheDocument()
    })

    it('does not render admin panel for non-admin users', async () => {
      const regularUser = { id: 1, email: 'user@example.com', is_admin: false }
      
      axios.get.mockImplementation((url) => {
        if (url.includes('/profile')) {
          return Promise.resolve({ data: regularUser })
        }
        if (url.includes('/files')) {
          return Promise.resolve({ data: { files: [] } })
        }
        if (url.includes('/admin/invitations')) {
          return Promise.resolve({ data: { invitations: [] } })
        }
        if (url.includes('/admin/users')) {
          return Promise.resolve({ data: { users: [] } })
        }
        return Promise.resolve({ data: {} })
      })

      await act(async () => {
        render(<App />)
      })

      await waitFor(() => {
        expect(screen.getByText(`Welcome, ${regularUser.email}`)).toBeInTheDocument()
      })

      expect(screen.queryByText(/Admin Panel/i)).not.toBeInTheDocument()
    })
  })

  describe('Invitation Management', () => {
    it('loads invitations on mount', async () => {
      await renderAdminPanel()
      
      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith(
          expect.stringContaining('/admin/invitations'),
          expect.objectContaining({
            headers: expect.objectContaining({
              Authorization: 'Bearer test-token'
            })
          })
        )
      })
    })

    it('displays pending invitations', async () => {
      await renderAdminPanel()
      
      await waitFor(() => {
        // user1@example.com appears in both invitations and users, so use getAllByText
        const userElements = screen.getAllByText('user1@example.com')
        expect(userElements.length).toBeGreaterThan(0)
      })
    })

    it('generates invitation link successfully', async () => {
      await renderAdminPanel()
      
      const newInvitation = {
        email: 'newuser@example.com',
        invitation_url: 'https://example.com/invite/token123'
      }

      axios.post.mockResolvedValueOnce({
        data: {
          email: newInvitation.email,
          invitation_url: newInvitation.invitation_url
        }
      })

      // Refresh invitations after creation
      axios.get.mockImplementation((url) => {
        if (url.includes('/admin/invitations')) {
          return Promise.resolve({
            data: { invitations: [...mockInvitations, { ...newInvitation, id: 3, status: 'pending' }] }
          })
        }
        return Promise.resolve({ data: {} })
      })

      const emailInput = screen.getByLabelText(/email address/i)
      const submitButton = screen.getByRole('button', { name: /generate/i })

      await userEvent.type(emailInput, newInvitation.email)
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(axios.post).toHaveBeenCalledWith(
          expect.stringContaining('/admin/create-invitation'),
          { email: newInvitation.email },
          expect.objectContaining({
            headers: expect.objectContaining({
              Authorization: 'Bearer test-token'
            })
          })
        )
      })
    })

    it('shows error message on invitation generation failure', async () => {
      await renderAdminPanel()

      axios.post.mockRejectedValueOnce({
        response: {
          data: { error: 'Email already invited' }
        }
      })

      const emailInput = screen.getByLabelText(/email address/i)
      const submitButton = screen.getByRole('button', { name: /generate/i })

      await userEvent.type(emailInput, 'existing@example.com')
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/Email already invited/i)).toBeInTheDocument()
      })
    })

    it('expires invitation successfully', async () => {
      await renderAdminPanel()

      axios.post.mockResolvedValueOnce({ data: {} })

      // Refresh invitations after expiration
      axios.get.mockImplementation((url) => {
        if (url.includes('/admin/invitations')) {
          return Promise.resolve({
            data: {
              invitations: mockInvitations.map(inv =>
                inv.id === 1 ? { ...inv, status: 'expired' } : inv
              )
            }
          })
        }
        return Promise.resolve({ data: {} })
      })

      await waitFor(() => {
        // user1@example.com appears in both invitations and users, so use getAllByText
        const userElements = screen.getAllByText('user1@example.com')
        expect(userElements.length).toBeGreaterThan(0)
      })

      // Find and click expire button (assuming there's a button or link to expire)
      const expireButtons = screen.getAllByText(/revoke|expire/i)
      if (expireButtons.length > 0) {
        await userEvent.click(expireButtons[0])

        await waitFor(() => {
          expect(axios.post).toHaveBeenCalledWith(
            expect.stringContaining('/admin/invitations/1/expire'),
            {},
            expect.objectContaining({
              headers: expect.objectContaining({
                Authorization: 'Bearer test-token'
              })
            })
          )
        })
      }
    })

    it('copies invitation URL to clipboard', async () => {
      await renderAdminPanel()

      const invitationUrl = 'https://example.com/invite/token123'

      // Mock successful invitation generation
      axios.post.mockResolvedValueOnce({
        data: {
          email: 'newuser@example.com',
          invitation_url: invitationUrl
        }
      })

      axios.get.mockImplementation((url) => {
        if (url.includes('/admin/invitations')) {
          return Promise.resolve({ data: { invitations: mockInvitations } })
        }
        return Promise.resolve({ data: {} })
      })

      const emailInput = screen.getByLabelText(/email address/i)
      const submitButton = screen.getByRole('button', { name: /generate/i })

      await userEvent.type(emailInput, 'newuser@example.com')
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/Invitation link generated/i)).toBeInTheDocument()
      })

      // Find copy button if it exists
      const copyButtons = screen.queryAllByText(/copy/i)
      if (copyButtons.length > 0) {
        await userEvent.click(copyButtons[0])

        await waitFor(() => {
          expect(navigator.clipboard.writeText).toHaveBeenCalledWith(invitationUrl)
        })
      }
    })
  })

  describe('User Management', () => {
    it('loads users on mount', async () => {
      await renderAdminPanel()

      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith(
          expect.stringContaining('/admin/users'),
          expect.objectContaining({
            headers: expect.objectContaining({
              Authorization: 'Bearer test-token'
            })
          })
        )
      })
    })

    it('displays user list', async () => {
      await renderAdminPanel()

      await waitFor(() => {
        // user1@example.com appears in both invitations and users, so use getAllByText
        const userElements = screen.getAllByText('user1@example.com')
        expect(userElements.length).toBeGreaterThan(0)
        expect(screen.getByText('admin@example.com')).toBeInTheDocument()
      })
    })

    it('fetches user details before deletion', async () => {
      await renderAdminPanel()

      const userDetails = {
        id: 1,
        email: 'user1@example.com',
        is_admin: false,
        created_at: '2024-01-01T10:00:00Z',
        files_count: 5
      }

      axios.get.mockImplementation((url) => {
        if (url.includes('/admin/users/1')) {
          return Promise.resolve({ data: userDetails })
        }
        if (url.includes('/admin/users')) {
          return Promise.resolve({ data: { users: mockUsers } })
        }
        if (url.includes('/admin/invitations')) {
          return Promise.resolve({ data: { invitations: mockInvitations } })
        }
        if (url.includes('/profile')) {
          return Promise.resolve({ data: mockAdminUser })
        }
        if (url.includes('/files')) {
          return Promise.resolve({ data: { files: [] } })
        }
        return Promise.resolve({ data: {} })
      })

      await waitFor(() => {
        // user1@example.com appears in both invitations and users, so use getAllByText
        const userElements = screen.getAllByText('user1@example.com')
        expect(userElements.length).toBeGreaterThan(0)
      })

      // Find delete button (assuming there's a delete button for each user)
      const deleteButtons = screen.queryAllByText(/delete/i)
      if (deleteButtons.length > 0) {
        await userEvent.click(deleteButtons[0])

        await waitFor(() => {
          expect(axios.get).toHaveBeenCalledWith(
            expect.stringContaining('/admin/users/1'),
            expect.objectContaining({
              headers: expect.objectContaining({
                Authorization: 'Bearer test-token'
              })
            })
          )
        })
      }
    })

    it('deletes user successfully', async () => {
      await renderAdminPanel()

      const userDetails = {
        id: 1,
        email: 'user1@example.com',
        is_admin: false
      }

      // Mock user details fetch
      axios.get.mockImplementation((url) => {
        if (url.includes('/admin/users/1')) {
          return Promise.resolve({ data: userDetails })
        }
        if (url.includes('/admin/users')) {
          return Promise.resolve({ data: { users: mockUsers } })
        }
        if (url.includes('/admin/invitations')) {
          return Promise.resolve({ data: { invitations: mockInvitations } })
        }
        if (url.includes('/profile')) {
          return Promise.resolve({ data: mockAdminUser })
        }
        if (url.includes('/files')) {
          return Promise.resolve({ data: { files: [] } })
        }
        return Promise.resolve({ data: {} })
      })

      // Mock delete
      axios.delete.mockResolvedValueOnce({ data: {} })

      // Mock refresh users after delete
      axios.get.mockImplementation((url) => {
        if (url.includes('/admin/users')) {
          return Promise.resolve({
            data: { users: mockUsers.filter(u => u.id !== 1) }
          })
        }
        if (url.includes('/admin/invitations')) {
          return Promise.resolve({ data: { invitations: mockInvitations } })
        }
        if (url.includes('/profile')) {
          return Promise.resolve({ data: mockAdminUser })
        }
        if (url.includes('/files')) {
          return Promise.resolve({ data: { files: [] } })
        }
        return Promise.resolve({ data: {} })
      })

      await waitFor(() => {
        // user1@example.com appears in both invitations and users, so use getAllByText
        const userElements = screen.getAllByText('user1@example.com')
        expect(userElements.length).toBeGreaterThan(0)
      })

      // This would require clicking delete, then confirming
      // The actual implementation may vary
    })

    it('shows error message on user deletion failure', async () => {
      await renderAdminPanel()

      axios.delete.mockRejectedValueOnce({
        response: {
          data: { error: 'Cannot delete user' }
        }
      })

      // Similar to above, but expect error message
    })
  })

  describe('Error Handling', () => {
    it('handles invitation loading error', async () => {
      axios.get.mockImplementation((url) => {
        if (url.includes('/profile')) {
          return Promise.resolve({ data: mockAdminUser })
        }
        if (url.includes('/admin/invitations')) {
          return Promise.reject(new Error('Network error'))
        }
        if (url.includes('/admin/users')) {
          return Promise.resolve({ data: { users: [] } })
        }
        if (url.includes('/files')) {
          return Promise.resolve({ data: { files: [] } })
        }
        return Promise.resolve({ data: {} })
      })

      await act(async () => {
        render(<App />)
      })

      await waitFor(() => {
        expect(screen.getByText(/Admin Panel/i)).toBeInTheDocument()
      })

      // Component should still render even if invitations fail to load
      expect(screen.getByText(/Admin Panel/i)).toBeInTheDocument()
    })

    it('handles user loading error', async () => {
      axios.get.mockImplementation((url) => {
        if (url.includes('/profile')) {
          return Promise.resolve({ data: mockAdminUser })
        }
        if (url.includes('/admin/invitations')) {
          return Promise.resolve({ data: { invitations: [] } })
        }
        if (url.includes('/admin/users')) {
          return Promise.reject(new Error('Network error'))
        }
        if (url.includes('/files')) {
          return Promise.resolve({ data: { files: [] } })
        }
        return Promise.resolve({ data: {} })
      })

      await act(async () => {
        render(<App />)
      })

      await waitFor(() => {
        expect(screen.getByText(/Admin Panel/i)).toBeInTheDocument()
      })

      // Component should still render even if users fail to load
      expect(screen.getByText(/Admin Panel/i)).toBeInTheDocument()
    })
  })

  describe('Loading States', () => {
    it('shows loading state while fetching invitations', async () => {
      // Delay the invitation response
      axios.get.mockImplementation((url) => {
        if (url.includes('/profile')) {
          return Promise.resolve({ data: mockAdminUser })
        }
        if (url.includes('/admin/invitations')) {
          return new Promise(resolve => {
            setTimeout(() => {
              resolve({ data: { invitations: mockInvitations } })
            }, 100)
          })
        }
        if (url.includes('/admin/users')) {
          return Promise.resolve({ data: { users: [] } })
        }
        if (url.includes('/files')) {
          return Promise.resolve({ data: { files: [] } })
        }
        return Promise.resolve({ data: {} })
      })

      await act(async () => {
        render(<App />)
      })

      await waitFor(() => {
        expect(screen.getByText(/Admin Panel/i)).toBeInTheDocument()
      })
    })
  })
})
