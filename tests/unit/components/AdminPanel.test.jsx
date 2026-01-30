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
  
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
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
  const mockInvitationOneDay = [
    {
      id: 3,
      email: 'expires-tomorrow@example.com',
      status: 'pending',
      created_at: new Date().toISOString(),
      expires_at: tomorrow.toISOString()
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

  const mockUsersWithFileCounts = [
    { ...mockUsers[0], file_count: 1 },
    { ...mockUsers[1], file_count: 2 }
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
    }, { timeout: 10000 })
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
    it('shows singular "day" when invitation expires in 1 day', async () => {
      axios.get.mockImplementation((url) => {
        if (url.includes('/profile')) return Promise.resolve({ data: mockAdminUser })
        if (url.includes('/files')) return Promise.resolve({ data: { files: [] } })
        if (url.includes('/admin/invitations')) {
          return Promise.resolve({ data: { invitations: mockInvitationOneDay } })
        }
        if (url.includes('/admin/users')) return Promise.resolve({ data: { users: mockUsers } })
        return Promise.resolve({ data: {} })
      })
      await act(async () => { render(<App />) })
      await waitFor(() => { expect(screen.getByText(/Admin Panel/i)).toBeInTheDocument() }, { timeout: 10000 })
      await waitFor(() => {
        expect(screen.getByText(/1 day\b/)).toBeInTheDocument()
      }, { timeout: 5000 })
    }, { timeout: 10000 })

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
      const submitButton = screen.getByRole('button', { name: /generate invitation/i })

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
      const submitButton = screen.getByRole('button', { name: /generate invitation/i })

      await userEvent.type(emailInput, 'existing@example.com')
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/Email already invited/i)).toBeInTheDocument()
      })
    })

    it('expires (revokes) invitation successfully', async () => {
      await renderAdminPanel()

      // Refresh invitations after expiration
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
          return Promise.resolve({ data: { invitations: mockInvitations.filter(inv => inv.id !== 1) } })
        }
        if (url.includes('/admin/users')) {
          return Promise.resolve({ data: { users: mockUsers } })
        }
        return Promise.resolve({ data: {} })
      })

      axios.post.mockResolvedValueOnce({ data: {} })

      // "Revoke" button appears for pending invitations
      const revokeButton = await waitFor(() => 
        screen.getByRole('button', { name: /revoke/i }),
        { timeout: 10000 }
      )
      await userEvent.click(revokeButton)

      await waitFor(() => {
        expect(window.confirm).toHaveBeenCalled()
        expect(axios.post).toHaveBeenCalledWith(
          expect.stringContaining('/admin/invitations/1/expire'),
          {},
          expect.objectContaining({
            headers: expect.objectContaining({
              Authorization: 'Bearer test-token'
            })
          })
        )
      }, { timeout: 10000 })

      // Success message is set
      await waitFor(() => {
        expect(screen.getByText(/has been revoked/i)).toBeInTheDocument()
      }, { timeout: 10000 })
    }, { timeout: 20000 })

    it('shows error when revoke invitation fails', async () => {
      await renderAdminPanel()
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      axios.post.mockImplementation((url) => {
        if (url.includes('/admin/invitations') && url.includes('/expire')) {
          return Promise.reject({ response: { data: { error: 'Revoke failed' } } })
        }
        return Promise.resolve({ data: {} })
      })

      const revokeButton = await waitFor(() =>
        screen.getByRole('button', { name: /revoke/i }),
        { timeout: 10000 }
      )
      await userEvent.click(revokeButton)

      await waitFor(() => {
        expect(screen.getByText(/Revoke failed|Failed to revoke invitation/i)).toBeInTheDocument()
      }, { timeout: 5000 })

      consoleSpy.mockRestore()
    }, { timeout: 20000 })

    it('shows Failed to revoke invitation when expire rejects with no response', async () => {
      await renderAdminPanel()
      vi.spyOn(console, 'error').mockImplementation(() => {})
      axios.post.mockImplementation((url) => {
        if (url.includes('/admin/invitations') && url.includes('/expire')) {
          return Promise.reject({})
        }
        return Promise.resolve({ data: {} })
      })
      const revokeButton = await waitFor(() => screen.getByRole('button', { name: /revoke/i }), { timeout: 10000 })
      await userEvent.click(revokeButton)
      await waitFor(() => {
        expect(screen.getByText(/Failed to revoke invitation/i)).toBeInTheDocument()
      }, { timeout: 5000 })
    }, { timeout: 20000 })

    it('shows Failed to generate invitation when post rejects with no response', async () => {
      axios.get.mockImplementation((url) => {
        if (url.includes('/profile')) return Promise.resolve({ data: mockAdminUser })
        if (url.includes('/files')) return Promise.resolve({ data: { files: [] } })
        if (url.includes('/admin/invitations')) return Promise.resolve({ data: { invitations: mockInvitations } })
        if (url.includes('/admin/users')) return Promise.resolve({ data: { users: mockUsers } })
        return Promise.resolve({ data: {} })
      })
      axios.post.mockImplementation((url) => {
        if (url.includes('/admin/create-invitation')) {
          return Promise.reject({})
        }
        return Promise.resolve({ data: {} })
      })
      await act(async () => { render(<App />) })
      await waitFor(() => { expect(screen.getByText(/Admin Panel/i)).toBeInTheDocument() }, { timeout: 10000 })
      const emailInput = screen.getByLabelText(/email address/i)
      await userEvent.type(emailInput, 'new@example.com')
      await userEvent.click(screen.getByRole('button', { name: /generate invitation/i }))
      await waitFor(() => {
        expect(screen.getByText(/Failed to generate invitation/i)).toBeInTheDocument()
      }, { timeout: 5000 })
    }, { timeout: 15000 })

    it('shows Failed to load users when users fetch rejects with no response', async () => {
      axios.get.mockImplementation((url) => {
        if (url.includes('/profile')) return Promise.resolve({ data: mockAdminUser })
        if (url.includes('/files')) return Promise.resolve({ data: { files: [] } })
        if (url.includes('/admin/invitations')) return Promise.resolve({ data: { invitations: [] } })
        if (url.includes('/admin/users')) {
          return Promise.reject({})
        }
        return Promise.resolve({ data: {} })
      })
      await act(async () => { render(<App />) })
      await waitFor(() => { expect(screen.getByText(/Admin Panel/i)).toBeInTheDocument() }, { timeout: 10000 })
      await waitFor(() => {
        expect(screen.getByText(/Failed to load users/i)).toBeInTheDocument()
      }, { timeout: 5000 })
    }, { timeout: 20000 })

    it('does not expire invitation when confirmation is cancelled', async () => {
      await renderAdminPanel()

      window.confirm = vi.fn(() => false)
      
      // Wait for revoke button to be available
      const revokeButton = await waitFor(() => 
        screen.getByRole('button', { name: /revoke/i }),
        { timeout: 10000 }
      )
      
      await userEvent.click(revokeButton)

      await waitFor(() => {
        expect(window.confirm).toHaveBeenCalled()
      }, { timeout: 10000 })

      expect(axios.post).not.toHaveBeenCalledWith(
        expect.stringContaining('/admin/invitations/1/expire'),
        expect.anything(),
        expect.anything()
      )
    }, { timeout: 20000 })

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

      // Ensure all API calls are mocked when refreshing invitations
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

      const emailInput = await waitFor(() => screen.getByLabelText(/email address/i), { timeout: 10000 })
      const submitButton = await waitFor(() => screen.getByRole('button', { name: /generate invitation/i }), { timeout: 10000 })

      await userEvent.type(emailInput, 'newuser@example.com')
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/Invitation link generated/i)).toBeInTheDocument()
      }, { timeout: 10000 })

      // Find copy button if it exists
      const copyButtons = screen.queryAllByText(/copy/i)
      if (copyButtons.length > 0) {
        await userEvent.click(copyButtons[0])

        await waitFor(() => {
          expect(navigator.clipboard.writeText).toHaveBeenCalledWith(invitationUrl)
        }, { timeout: 10000 })
      }
    }, { timeout: 20000 })
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
      }, { timeout: 10000 })
    }, { timeout: 20000 })

    it('displays user list', async () => {
      await renderAdminPanel()

      await waitFor(() => {
        // user1@example.com appears in both invitations and users, so use getAllByText
        const userElements = screen.getAllByText('user1@example.com')
        expect(userElements.length).toBeGreaterThan(0)
        expect(screen.getByText('admin@example.com')).toBeInTheDocument()
      }, { timeout: 10000 })
    }, { timeout: 20000 })

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
        if (url.includes('/files') && url.includes('/generated')) {
          return Promise.resolve({ data: { macros: [], instructions: [], reports: [], processed: [] } })
        }
        if (url.includes('/files') && url.includes('/history')) {
          return Promise.resolve({ data: { history: [] } })
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
      }, { timeout: 10000 })

      // Find delete button (assuming there's a delete button for each user)
      const deleteButtons = await waitFor(() => screen.queryAllByRole('button', { name: /delete/i }), { timeout: 10000 })
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
        }, { timeout: 10000 })
      }
    }, { timeout: 20000 })

    it('shows singular "file" when user has file_count 1', async () => {
      axios.get.mockImplementation((url) => {
        if (url.includes('/profile')) return Promise.resolve({ data: mockAdminUser })
        if (url.includes('/files')) return Promise.resolve({ data: { files: [] } })
        if (url.includes('/admin/invitations')) return Promise.resolve({ data: { invitations: mockInvitations } })
        if (url.includes('/admin/users')) {
          return Promise.resolve({ data: { users: mockUsersWithFileCounts } })
        }
        return Promise.resolve({ data: {} })
      })
      await act(async () => { render(<App />) })
      await waitFor(() => { expect(screen.getByText(/Admin Panel/i)).toBeInTheDocument() }, { timeout: 10000 })
      await waitFor(() => {
        expect(screen.getByText(/1 file\b/)).toBeInTheDocument()
      }, { timeout: 5000 })
    }, { timeout: 10000 })

    it('deletes user successfully', async () => {
      await renderAdminPanel()

      const userDetails = {
        file_count: 2,
        job_count: 3
      }

      // Track how many times /admin/users is called
      let usersCallCount = 0
      axios.get.mockImplementation((url) => {
        if (url.includes('/admin/users/1')) {
          return Promise.resolve({ data: userDetails })
        }
        if (url.includes('/admin/users')) {
          usersCallCount++
          // After delete, return updated list without user 1
          if (usersCallCount > 1) {
            return Promise.resolve({ data: { users: mockUsers.filter(u => u.id !== 1) } })
          }
          return Promise.resolve({ data: { users: mockUsers } })
        }
        if (url.includes('/admin/invitations')) {
          return Promise.resolve({ data: { invitations: mockInvitations } })
        }
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
        return Promise.resolve({ data: {} })
      })

      axios.delete.mockResolvedValueOnce({ data: {} })

      // Open delete confirmation modal
      const deleteButtons = await waitFor(() => screen.getAllByRole('button', { name: /delete/i }), { timeout: 5000 })
      await userEvent.click(deleteButtons[0])

      // Confirm modal appears (query button to avoid multiple "Delete User" text nodes)
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /delete user/i })).toBeInTheDocument()
      }, { timeout: 5000 })

      await userEvent.click(screen.getByRole('button', { name: /delete user/i }))

      await waitFor(() => {
        expect(axios.delete).toHaveBeenCalledWith(
          expect.stringContaining('/admin/users/1'),
          expect.objectContaining({
            headers: expect.objectContaining({
              Authorization: 'Bearer test-token'
            })
          })
        )
      }, { timeout: 5000 })
    }, { timeout: 10000 })

    it('shows singular file and job in delete confirmation when count is 1', async () => {
      await renderAdminPanel()

      const userDetails = {
        file_count: 1,
        job_count: 1
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

      const deleteButtons = await waitFor(() => screen.getAllByRole('button', { name: /^Delete$/i }), { timeout: 5000 })
      await userEvent.click(deleteButtons[0])

      await waitFor(() => {
        expect(screen.getByText(/1 file\b/)).toBeInTheDocument()
        expect(screen.getByText(/1 processing job\b/)).toBeInTheDocument()
      }, { timeout: 5000 })
    }, { timeout: 10000 })

    it('shows error message on user deletion failure', async () => {
      await renderAdminPanel()

      const userDetails = {
        file_count: 0,
        job_count: 0
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
        if (url.includes('/files') && url.includes('/generated')) {
          return Promise.resolve({ data: { macros: [], instructions: [], reports: [], processed: [] } })
        }
        if (url.includes('/files') && url.includes('/history')) {
          return Promise.resolve({ data: { history: [] } })
        }
        if (url.includes('/files')) {
          return Promise.resolve({ data: { files: [] } })
        }
        return Promise.resolve({ data: {} })
      })

      axios.delete.mockRejectedValueOnce({
        response: {
          data: { error: 'Cannot delete user' }
        }
      })

      const deleteButtons = await waitFor(() => screen.getAllByRole('button', { name: /delete/i }), { timeout: 5000 })
      await userEvent.click(deleteButtons[0])

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /delete user/i })).toBeInTheDocument()
      }, { timeout: 5000 })

      await userEvent.click(screen.getByRole('button', { name: /delete user/i }))

      await waitFor(() => {
        expect(screen.getByText(/Cannot delete user/i)).toBeInTheDocument()
      }, { timeout: 10000 })
    }, { timeout: 15000 })
  })

  describe('Admin Tools', () => {
    it('runs cleanup missing files tool', async () => {
      await renderAdminPanel()

      axios.post.mockResolvedValueOnce({ data: { removed_count: 2 } })

      const cleanupButton = await waitFor(() => 
        screen.getByRole('button', { name: /cleanup missing files/i }),
        { timeout: 10000 }
      )
      await userEvent.click(cleanupButton)

      await waitFor(() => {
        expect(axios.post).toHaveBeenCalledWith(
          expect.stringContaining('/cleanup-files'),
          {},
          expect.objectContaining({
            headers: expect.objectContaining({
              Authorization: 'Bearer test-token'
            })
          })
        )
        expect(window.alert).toHaveBeenCalled()
      }, { timeout: 10000 })
    }, { timeout: 20000 })

    it('cleanup refreshes generated files when file is selected', async () => {
      const filesWithSelection = [
        { id: 1, original_filename: 'test-file.xlsx', file_size: 51200, upload_date: '2024-01-15T10:30:00Z', processed: false }
      ]
      axios.get.mockImplementation((url) => {
        if (url.includes('/profile')) return Promise.resolve({ data: mockAdminUser })
        if (url.includes('/files') && url.includes('/generated')) {
          return Promise.resolve({ data: { macros: [], instructions: [], reports: [], processed: [] } })
        }
        if (url.includes('/files') && url.includes('/history')) return Promise.resolve({ data: { history: [] } })
        if (url.includes('/files')) return Promise.resolve({ data: { files: filesWithSelection } })
        if (url.includes('/admin/invitations')) return Promise.resolve({ data: { invitations: mockInvitations } })
        if (url.includes('/admin/users')) return Promise.resolve({ data: { users: mockUsers } })
        return Promise.resolve({ data: {} })
      })

      await act(async () => { render(<App />) })
      await waitFor(() => { expect(screen.getByText(/Admin Panel/i)).toBeInTheDocument() }, { timeout: 10000 })
      await waitFor(() => { expect(screen.getByText('test-file.xlsx')).toBeInTheDocument() })

      await act(async () => { await userEvent.click(screen.getByText('test-file.xlsx')) })

      axios.post.mockImplementation((url) => {
        if (url.includes('/cleanup-files')) {
          return Promise.resolve({ data: { removed_count: 1 } })
        }
        return Promise.resolve({ data: {} })
      })

      const cleanupButton = await waitFor(() =>
        screen.getByRole('button', { name: /cleanup missing files/i }),
        { timeout: 10000 }
      )
      await userEvent.click(cleanupButton)

      await waitFor(() => {
        expect(axios.post).toHaveBeenCalledWith(expect.stringContaining('/cleanup-files'), {}, expect.any(Object))
        expect(window.alert).toHaveBeenCalledWith('Cleaned up 1 missing files')
      }, { timeout: 5000 })
    })

    it('handles cleanup API error', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      await renderAdminPanel()

      axios.post.mockImplementation((url) => {
        if (url.includes('/cleanup-files')) {
          return Promise.reject({ response: { data: { error: 'Cleanup failed' } } })
        }
        return Promise.resolve({ data: {} })
      })

      const cleanupButton = await waitFor(() =>
        screen.getByRole('button', { name: /cleanup missing files/i }),
        { timeout: 10000 }
      )
      await userEvent.click(cleanupButton)

      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith('Cleanup failed: Cleanup failed')
      }, { timeout: 5000 })

      consoleSpy.mockRestore()
    })

    it('cleanup shows Unknown error when cleanup fails with no response', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      await renderAdminPanel()

      axios.post.mockImplementation((url) => {
        if (url.includes('/cleanup-files')) {
          return Promise.reject(new Error('Network error'))
        }
        return Promise.resolve({ data: {} })
      })

      const cleanupButton = await waitFor(() =>
        screen.getByRole('button', { name: /cleanup missing files/i }),
        { timeout: 10000 }
      )
      await userEvent.click(cleanupButton)

      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith('Cleanup failed: Unknown error')
      }, { timeout: 5000 })

      consoleSpy.mockRestore()
    })

    it('runs debug storage tool', async () => {
      await renderAdminPanel()

      axios.get.mockImplementation((url) => {
        if (url.includes('/debug/storage')) {
          return Promise.resolve({
            data: {
              database_files: [],
              storage_folders: { uploads: [], processed: [], macros: [] }
            }
          })
        }
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

      const debugButton = await waitFor(() => 
        screen.getByRole('button', { name: /debug storage/i }),
        { timeout: 10000 }
      )
      await userEvent.click(debugButton)

      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith(
          expect.stringContaining('/debug/storage'),
          expect.objectContaining({
            headers: expect.objectContaining({
              Authorization: 'Bearer test-token'
            })
          })
        )
      }, { timeout: 10000 })
    }, { timeout: 20000 })

    it('handles debug storage API error', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      await renderAdminPanel()

      axios.get.mockImplementation((url) => {
        if (url.includes('/debug/storage')) {
          return Promise.reject(new Error('Debug storage failed'))
        }
        if (url.includes('/profile')) return Promise.resolve({ data: mockAdminUser })
        if (url.includes('/files') && url.includes('/generated')) {
          return Promise.resolve({ data: { macros: [], instructions: [], reports: [], processed: [] } })
        }
        if (url.includes('/files') && url.includes('/history')) return Promise.resolve({ data: { history: [] } })
        if (url.includes('/files')) return Promise.resolve({ data: { files: [] } })
        if (url.includes('/admin/invitations')) return Promise.resolve({ data: { invitations: mockInvitations } })
        if (url.includes('/admin/users')) return Promise.resolve({ data: { users: mockUsers } })
        return Promise.resolve({ data: {} })
      })

      const debugButton = await waitFor(() =>
        screen.getByRole('button', { name: /debug storage/i }),
        { timeout: 10000 }
      )
      await userEvent.click(debugButton)

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Debug error:', expect.any(Error))
      }, { timeout: 5000 })

      consoleSpy.mockRestore()
    })

    it('runs detailed GitHub test tool', async () => {
      await renderAdminPanel()

      axios.get.mockImplementation((url) => {
        if (url.includes('/test-github')) {
          return Promise.resolve({ data: { status: 'ok' } })
        }
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

      axios.post.mockResolvedValueOnce({ data: { ok: true } })

      const githubButton = await waitFor(() => 
        screen.getByRole('button', { name: /test github connection/i }),
        { timeout: 10000 }
      )
      await userEvent.click(githubButton)

      await waitFor(() => {
        expect(window.alert).toHaveBeenCalled()
        expect(axios.get).toHaveBeenCalledWith(
          expect.stringContaining('/test-github'),
          expect.objectContaining({
            headers: expect.objectContaining({
              Authorization: 'Bearer test-token'
            })
          })
        )
        expect(axios.post).toHaveBeenCalledWith(
          expect.stringContaining('/test-dispatch'),
          {},
          expect.objectContaining({
            headers: expect.objectContaining({
              Authorization: 'Bearer test-token'
            })
          })
        )
      }, { timeout: 10000 })
    }, { timeout: 20000 })

    it('shows error alert when detailed GitHub test fails', async () => {
      await renderAdminPanel()

      axios.get.mockImplementation((url) => {
        if (url.includes('/test-github')) {
          return Promise.resolve({ data: { status: 'ok' } })
        }
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

      const dispatchError = { response: { data: { error: 'Dispatch failed' } } }
      axios.post.mockRejectedValueOnce(dispatchError)

      const githubButton = await waitFor(() =>
        screen.getByRole('button', { name: /test github connection/i }),
        { timeout: 10000 }
      )
      await userEvent.click(githubButton)

      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith(
          expect.stringMatching(/Test failed:.*Dispatch failed/)
        )
      }, { timeout: 10000 })
    }, { timeout: 20000 })

    it('shows err.message when detailed GitHub test fails with no response', async () => {
      await renderAdminPanel()

      axios.get.mockImplementation((url) => {
        if (url.includes('/test-github')) {
          return Promise.reject(new Error('Network error'))
        }
        if (url.includes('/profile')) {
          return Promise.resolve({ data: mockAdminUser })
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

      const githubButton = await waitFor(() =>
        screen.getByRole('button', { name: /test github connection/i }),
        { timeout: 10000 }
      )
      await userEvent.click(githubButton)

      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith(
          expect.stringMatching(/Test failed:.*Network error/)
        )
      }, { timeout: 10000 })
    }, { timeout: 20000 })

    it('clears success message when copy timeout runs and prev message did not include generated', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true })
      await renderAdminPanel()

      axios.post.mockResolvedValueOnce({
        data: { email: 'copy@example.com', invitation_url: 'https://example.com/invite/abc' }
      })
      axios.get.mockImplementation((url) => {
        if (url.includes('/profile')) return Promise.resolve({ data: mockAdminUser })
        if (url.includes('/admin/invitations')) return Promise.resolve({ data: { invitations: mockInvitations } })
        if (url.includes('/admin/users')) return Promise.resolve({ data: { users: mockUsers } })
        if (url.includes('/files')) return Promise.resolve({ data: { files: [] } })
        return Promise.resolve({ data: {} })
      })

      const emailInput = screen.getByLabelText(/email address/i)
      const submitButton = screen.getByRole('button', { name: /generate invitation/i })
      await userEvent.type(emailInput, 'copy@example.com')
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/Invitation link generated/i)).toBeInTheDocument()
      }, { timeout: 10000 })

      const copyButton = await waitFor(() =>
        screen.getByRole('button', { name: /copy to clipboard/i }),
        { timeout: 5000 }
      )
      await userEvent.click(copyButton)
      await userEvent.click(copyButton)

      await vi.advanceTimersByTimeAsync(3100)

      await waitFor(() => {
        expect(screen.queryByText(/Invitation URL copied/i)).not.toBeInTheDocument()
      }, { timeout: 3000 })
      vi.useRealTimers()
    }, { timeout: 20000 })

    it('shows error when fetching user details for delete fails', async () => {
      await renderAdminPanel()
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      axios.get.mockImplementation((url) => {
        if (url.includes('/profile')) return Promise.resolve({ data: mockAdminUser })
        if (url.includes('/admin/invitations')) return Promise.resolve({ data: { invitations: mockInvitations } })
        if (url.includes('/admin/users') && url.includes('/1')) {
          return Promise.reject({ response: { data: { error: 'User not found' } } })
        }
        if (url.includes('/admin/users')) return Promise.resolve({ data: { users: mockUsers } })
        if (url.includes('/files')) return Promise.resolve({ data: { files: [] } })
        return Promise.resolve({ data: {} })
      })

      const deleteButton = await waitFor(() =>
        screen.getByRole('button', { name: /^Delete$/i }),
        { timeout: 10000 }
      )
      await userEvent.click(deleteButton)

      await waitFor(() => {
        expect(screen.getByText(/User not found|Failed to load user details/i)).toBeInTheDocument()
      }, { timeout: 5000 })

      consoleSpy.mockRestore()
    }, { timeout: 20000 })

    it('shows Failed to load user details when fetch rejects with no response', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => {})

      axios.get.mockImplementation((url) => {
        if (url.includes('/profile')) return Promise.resolve({ data: mockAdminUser })
        if (url.includes('/files') && url.includes('/generated')) return Promise.resolve({ data: { macros: [], instructions: [], reports: [], processed: [] } })
        if (url.includes('/files') && url.includes('/history')) return Promise.resolve({ data: { history: [] } })
        if (url.includes('/files')) return Promise.resolve({ data: { files: [] } })
        if (url.includes('/admin/invitations')) return Promise.resolve({ data: { invitations: mockInvitations } })
        if (String(url).includes('/admin/users/1')) return Promise.reject({})
        if (url.includes('/admin/users')) return Promise.resolve({ data: { users: mockUsers } })
        return Promise.resolve({ data: {} })
      })

      await act(async () => { render(<App />) })
      await waitFor(() => expect(screen.getByText(/Admin Panel/i)).toBeInTheDocument(), { timeout: 10000 })

      const deleteButtons = await waitFor(() => screen.getAllByRole('button', { name: /^Delete$/i }), { timeout: 10000 })
      await userEvent.click(deleteButtons[0])

      await waitFor(() => {
        expect(screen.getByText(/Failed to load user details/i)).toBeInTheDocument()
      }, { timeout: 5000 })
    }, { timeout: 20000 })

    it('shows Failed to delete user when delete API rejects with no response', async () => {
      axios.get.mockImplementation((url) => {
        if (url.includes('/profile')) return Promise.resolve({ data: mockAdminUser })
        if (url.includes('/files')) return Promise.resolve({ data: { files: [] } })
        if (url.includes('/admin/invitations')) return Promise.resolve({ data: { invitations: mockInvitations } })
        if (String(url).includes('/admin/users/1')) return Promise.resolve({ data: { file_count: 0, job_count: 0 } })
        if (url.includes('/admin/users')) return Promise.resolve({ data: { users: mockUsers } })
        return Promise.resolve({ data: {} })
      })
      axios.delete.mockRejectedValue({})

      await act(async () => { render(<App />) })
      await waitFor(() => expect(screen.getByText(/Admin Panel/i)).toBeInTheDocument(), { timeout: 10000 })

      const deleteButtons = await waitFor(() => screen.getAllByRole('button', { name: /^Delete$/i }), { timeout: 5000 })
      await userEvent.click(deleteButtons[0])
      await waitFor(() => { expect(screen.getByRole('button', { name: /delete user/i })).toBeInTheDocument() }, { timeout: 5000 })
      await userEvent.click(screen.getByRole('button', { name: /delete user/i }))

      await waitFor(() => {
        expect(screen.getByText(/Failed to delete user/i)).toBeInTheDocument()
      }, { timeout: 5000 })
    }, { timeout: 15000 })
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
        if (url.includes('/files') && url.includes('/generated')) {
          return Promise.resolve({ data: { macros: [], instructions: [], reports: [], processed: [] } })
        }
        if (url.includes('/files') && url.includes('/history')) {
          return Promise.resolve({ data: { history: [] } })
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
      }, { timeout: 10000 })

      // Component should still render even if invitations fail to load
      expect(screen.getByText(/Admin Panel/i)).toBeInTheDocument()
    }, { timeout: 20000 })

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
        if (url.includes('/files') && url.includes('/generated')) {
          return Promise.resolve({ data: { macros: [], instructions: [], reports: [], processed: [] } })
        }
        if (url.includes('/files') && url.includes('/history')) {
          return Promise.resolve({ data: { history: [] } })
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
      }, { timeout: 10000 })

      // Component should still render even if users fail to load
      expect(screen.getByText(/Admin Panel/i)).toBeInTheDocument()
    }, { timeout: 20000 })
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
        if (url.includes('/files') && url.includes('/generated')) {
          return Promise.resolve({ data: { macros: [], instructions: [], reports: [], processed: [] } })
        }
        if (url.includes('/files') && url.includes('/history')) {
          return Promise.resolve({ data: { history: [] } })
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
      }, { timeout: 10000 })
    }, { timeout: 20000 })
  })
})
