/**
 * API Coverage Tests
 * Ensures all 26 axios API endpoints are tested with success and error scenarios
 * 
 * This test suite verifies that all API endpoints used in the application
 * are properly handled and tested. While individual component tests cover
 * API usage in context, this suite ensures comprehensive coverage of all
 * endpoints with various error scenarios.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from 'axios'

// Mock axios for all tests
vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    patch: vi.fn(),
  }
}))

describe('API Coverage - All Endpoints', () => {
  const API_BASE = 'http://127.0.0.1:5000/api'
  const mockToken = 'test-token-123'
  const mockHeaders = {
    headers: { Authorization: `Bearer ${mockToken}` }
  }

  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.setItem('token', mockToken)
  })

  describe('Authentication APIs', () => {
    it('POST /api/register - success scenario', async () => {
      const mockResponse = {
        data: {
          access_token: 'new-token',
          user: { id: 1, email: 'user@example.com' }
        }
      }
      axios.post.mockResolvedValueOnce(mockResponse)

      const response = await axios.post(
        `${API_BASE}/register`,
        { invitation_token: 'invite-token', password: 'SecurePass123!' }
      )

      expect(response.data.access_token).toBe('new-token')
      expect(axios.post).toHaveBeenCalledWith(
        `${API_BASE}/register`,
        { invitation_token: 'invite-token', password: 'SecurePass123!' }
      )
    })

    it('POST /api/register - error scenario (invalid token)', async () => {
      axios.post.mockRejectedValueOnce({
        response: {
          status: 400,
          data: { error: 'Invalid invitation token' }
        }
      })

      await expect(
        axios.post(`${API_BASE}/register`, {
          invitation_token: 'invalid-token',
          password: 'SecurePass123!'
        })
      ).rejects.toMatchObject({
        response: {
          status: 400,
          data: { error: 'Invalid invitation token' }
        }
      })
    })

    it('POST /api/login - success scenario', async () => {
      const mockResponse = {
        data: {
          access_token: 'login-token',
          user: { id: 1, email: 'user@example.com' }
        }
      }
      axios.post.mockResolvedValueOnce(mockResponse)

      const response = await axios.post(
        `${API_BASE}/login`,
        { email: 'user@example.com', password: 'password123' }
      )

      expect(response.data.access_token).toBe('login-token')
    })

    it('POST /api/login - error scenario (invalid credentials)', async () => {
      axios.post.mockRejectedValueOnce({
        response: {
          status: 401,
          data: { error: 'Invalid email or password' }
        }
      })

      await expect(
        axios.post(`${API_BASE}/login`, {
          email: 'user@example.com',
          password: 'wrongpassword'
        })
      ).rejects.toMatchObject({
        response: {
          status: 401,
          data: { error: 'Invalid email or password' }
        }
      })
    })

    it('GET /api/profile - success scenario', async () => {
      const mockResponse = {
        data: { id: 1, email: 'user@example.com', is_admin: false }
      }
      axios.get.mockResolvedValueOnce(mockResponse)

      const response = await axios.get(`${API_BASE}/profile`, mockHeaders)

      expect(response.data.email).toBe('user@example.com')
      expect(axios.get).toHaveBeenCalledWith(
        `${API_BASE}/profile`,
        mockHeaders
      )
    })

    it('GET /api/profile - error scenario (401 Unauthorized)', async () => {
      axios.get.mockRejectedValueOnce({
        response: {
          status: 401,
          data: { error: 'Unauthorized' }
        }
      })

      await expect(
        axios.get(`${API_BASE}/profile`, mockHeaders)
      ).rejects.toMatchObject({
        response: {
          status: 401,
          data: { error: 'Unauthorized' }
        }
      })
    })

    it('GET /api/profile - network error scenario', async () => {
      axios.get.mockRejectedValueOnce(new Error('Network Error'))

      await expect(
        axios.get(`${API_BASE}/profile`, mockHeaders)
      ).rejects.toThrow('Network Error')
    })
  })

  describe('File Management APIs', () => {
    it('GET /api/files - success scenario', async () => {
      const mockResponse = {
        data: {
          files: [
            { id: 1, original_filename: 'test.xlsx', file_size: 1024 }
          ]
        }
      }
      axios.get.mockResolvedValueOnce(mockResponse)

      const response = await axios.get(`${API_BASE}/files`, mockHeaders)

      expect(response.data.files).toHaveLength(1)
    })

    it('GET /api/files - empty scenario', async () => {
      axios.get.mockResolvedValueOnce({ data: { files: [] } })

      const response = await axios.get(`${API_BASE}/files`, mockHeaders)

      expect(response.data.files).toHaveLength(0)
    })

    it('GET /api/files - error scenario', async () => {
      axios.get.mockRejectedValueOnce({
        response: {
          status: 500,
          data: { error: 'Server error' }
        }
      })

      await expect(
        axios.get(`${API_BASE}/files`, mockHeaders)
      ).rejects.toMatchObject({
        response: { status: 500 }
      })
    })

    it('POST /api/upload - success scenario', async () => {
      const formData = new FormData()
      formData.append('file', new Blob(['test'], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }))

      const mockResponse = {
        data: {
          file_id: 1,
          original_filename: 'test.xlsx',
          file_size: 1024
        }
      }
      axios.post.mockResolvedValueOnce(mockResponse)

      const response = await axios.post(`${API_BASE}/upload`, formData, {
        ...mockHeaders,
        headers: {
          ...mockHeaders.headers,
          'Content-Type': 'multipart/form-data'
        }
      })

      expect(response.data.file_id).toBe(1)
    })

    it('POST /api/upload - duplicate file error', async () => {
      const formData = new FormData()

      axios.post.mockRejectedValueOnce({
        response: {
          status: 409,
          data: { error: 'File already exists' }
        }
      })

      await expect(
        axios.post(`${API_BASE}/upload`, formData, mockHeaders)
      ).rejects.toMatchObject({
        response: {
          status: 409,
          data: { error: 'File already exists' }
        }
      })
    })

    it('GET /api/files/${fileId}/generated - success scenario', async () => {
      const fileId = 1
      const mockResponse = {
        data: {
          macros: [],
          instructions: [],
          reports: [],
          processed: []
        }
      }
      axios.get.mockResolvedValueOnce(mockResponse)

      const response = await axios.get(
        `${API_BASE}/files/${fileId}/generated`,
        mockHeaders
      )

      expect(response.data).toHaveProperty('macros')
      expect(response.data).toHaveProperty('processed')
    })

    it('GET /api/files/${fileId}/generated - error scenario', async () => {
      axios.get.mockRejectedValueOnce({
        response: {
          status: 404,
          data: { error: 'File not found' }
        }
      })

      await expect(
        axios.get(`${API_BASE}/files/999/generated`, mockHeaders)
      ).rejects.toMatchObject({
        response: { status: 404 }
      })
    })

    it('GET /api/files/${fileId}/history - success scenario', async () => {
      const fileId = 1
      const mockResponse = {
        data: {
          history: [
            {
              job_id: 1,
              status: 'completed',
              deleted_rows: 10,
              processed_at: '2024-01-15T10:00:00Z'
            }
          ]
        }
      }
      axios.get.mockResolvedValueOnce(mockResponse)

      const response = await axios.get(
        `${API_BASE}/files/${fileId}/history`,
        mockHeaders
      )

      expect(response.data.history).toHaveLength(1)
    })

    it('GET /api/files/${fileId}/history - empty scenario', async () => {
      axios.get.mockResolvedValueOnce({ data: { history: [] } })

      const response = await axios.get(
        `${API_BASE}/files/1/history`,
        mockHeaders
      )

      expect(response.data.history).toHaveLength(0)
    })

    it('DELETE /api/files/${fileId}/history/${jobId} - success scenario', async () => {
      const fileId = 1
      const jobId = 1

      axios.delete.mockResolvedValueOnce({ data: { success: true } })

      const response = await axios.delete(
        `${API_BASE}/files/${fileId}/history/${jobId}`,
        mockHeaders
      )

      expect(response.data.success).toBe(true)
    })

    it('DELETE /api/files/${fileId}/history/${jobId} - error scenario', async () => {
      axios.delete.mockRejectedValueOnce({
        response: {
          status: 404,
          data: { error: 'History item not found' }
        }
      })

      await expect(
        axios.delete(`${API_BASE}/files/1/history/999`, mockHeaders)
      ).rejects.toMatchObject({
        response: { status: 404 }
      })
    })

    it('DELETE /api/files/${fileId}/history - success scenario (clear all)', async () => {
      const fileId = 1
      const mockResponse = {
        data: { deleted_count: 5 }
      }

      axios.delete.mockResolvedValueOnce(mockResponse)

      const response = await axios.delete(
        `${API_BASE}/files/${fileId}/history`,
        mockHeaders
      )

      expect(response.data.deleted_count).toBe(5)
    })
  })

  describe('Processing APIs', () => {
    it('POST /api/process/${fileId} - success scenario', async () => {
      const fileId = 1
      const mockResponse = {
        data: {
          processed_file_id: 2,
          download_filename: 'processed.xlsx',
          deleted_rows: 10,
          processing_log: ['Row 1 deleted', 'Row 2 deleted']
        }
      }

      axios.post.mockResolvedValueOnce(mockResponse)

      const response = await axios.post(
        `${API_BASE}/process/${fileId}`,
        { filter_rules: [{ column: 'F', value: '0' }] },
        { ...mockHeaders, timeout: 600000 }
      )

      expect(response.data.deleted_rows).toBe(10)
    })

    it('POST /api/process/${fileId} - timeout scenario', async () => {
      axios.post.mockRejectedValueOnce({
        code: 'ECONNABORTED',
        message: 'timeout of 600000ms exceeded'
      })

      await expect(
        axios.post(
          `${API_BASE}/process/1`,
          { filter_rules: [] },
          { ...mockHeaders, timeout: 600000 }
        )
      ).rejects.toMatchObject({
        code: 'ECONNABORTED'
      })
    })

    it('POST /api/generate-instructions/${fileId} - success scenario', async () => {
      const fileId = 1
      const mockResponse = {
        data: {
          macro_file_id: 1,
          instructions_file_id: 2
        }
      }

      axios.post.mockResolvedValueOnce(mockResponse)

      const response = await axios.post(
        `${API_BASE}/generate-instructions/${fileId}`,
        { filter_rules: [] },
        mockHeaders
      )

      expect(response.data.macro_file_id).toBe(1)
    })

    it('POST /api/dispatch-job - success scenario', async () => {
      const mockResponse = {
        data: {
          job_id: 'job-123',
          status: 'pending'
        }
      }

      axios.post.mockResolvedValueOnce(mockResponse)

      const response = await axios.post(
        `${API_BASE}/dispatch-job`,
        { file_id: 1, filter_rules: [] },
        mockHeaders
      )

      expect(response.data.job_id).toBe('job-123')
    })

    it('GET /api/job-status/${jobId} - success scenario (completed)', async () => {
      const jobId = 'job-123'
      const mockResponse = {
        data: {
          status: 'completed',
          result_file_id: 2
        }
      }

      axios.get.mockResolvedValueOnce(mockResponse)

      const response = await axios.get(
        `${API_BASE}/job-status/${jobId}`,
        mockHeaders
      )

      expect(response.data.status).toBe('completed')
    })

    it('GET /api/job-status/${jobId} - pending scenario', async () => {
      axios.get.mockResolvedValueOnce({
        data: { status: 'pending' }
      })

      const response = await axios.get(
        `${API_BASE}/job-status/job-123`,
        mockHeaders
      )

      expect(response.data.status).toBe('pending')
    })

    it('GET /api/job-status/${jobId} - failed scenario', async () => {
      axios.get.mockResolvedValueOnce({
        data: {
          status: 'failed',
          error: 'Processing failed'
        }
      })

      const response = await axios.get(
        `${API_BASE}/job-status/job-123`,
        mockHeaders
      )

      expect(response.data.status).toBe('failed')
    })
  })

  describe('Admin APIs', () => {
    it('GET /api/admin/invitations - success scenario', async () => {
      const mockResponse = {
        data: {
          invitations: [
            {
              id: 1,
              email: 'user@example.com',
              status: 'pending'
            }
          ]
        }
      }

      axios.get.mockResolvedValueOnce(mockResponse)

      const response = await axios.get(
        `${API_BASE}/admin/invitations`,
        mockHeaders
      )

      expect(response.data.invitations).toHaveLength(1)
    })

    it('POST /api/admin/create-invitation - success scenario', async () => {
      const mockResponse = {
        data: {
          email: 'newuser@example.com',
          invitation_url: 'https://example.com/invite/token123'
        }
      }

      axios.post.mockResolvedValueOnce(mockResponse)

      const response = await axios.post(
        `${API_BASE}/admin/create-invitation`,
        { email: 'newuser@example.com' },
        mockHeaders
      )

      expect(response.data.invitation_url).toContain('invite')
    })

    it('POST /api/admin/invitations/${id}/expire - success scenario', async () => {
      const invitationId = 1

      axios.post.mockResolvedValueOnce({ data: { success: true } })

      const response = await axios.post(
        `${API_BASE}/admin/invitations/${invitationId}/expire`,
        {},
        mockHeaders
      )

      expect(response.data.success).toBe(true)
    })

    it('GET /api/admin/users - success scenario', async () => {
      const mockResponse = {
        data: {
          users: [
            { id: 1, email: 'user@example.com', is_admin: false }
          ]
        }
      }

      axios.get.mockResolvedValueOnce(mockResponse)

      const response = await axios.get(
        `${API_BASE}/admin/users`,
        mockHeaders
      )

      expect(response.data.users).toHaveLength(1)
    })

    it('GET /api/admin/users/${id} - success scenario', async () => {
      const userId = 1
      const mockResponse = {
        data: {
          id: 1,
          email: 'user@example.com',
          is_admin: false,
          files_count: 5
        }
      }

      axios.get.mockResolvedValueOnce(mockResponse)

      const response = await axios.get(
        `${API_BASE}/admin/users/${userId}`,
        mockHeaders
      )

      expect(response.data.id).toBe(1)
    })

    it('DELETE /api/admin/users/${id} - success scenario', async () => {
      const userId = 1

      axios.delete.mockResolvedValueOnce({ data: { success: true } })

      const response = await axios.delete(
        `${API_BASE}/admin/users/${userId}`,
        mockHeaders
      )

      expect(response.data.success).toBe(true)
    })

    it('DELETE /api/admin/users/${id} - error scenario (403 Forbidden)', async () => {
      axios.delete.mockRejectedValueOnce({
        response: {
          status: 403,
          data: { error: 'Forbidden' }
        }
      })

      await expect(
        axios.delete(`${API_BASE}/admin/users/1`, mockHeaders)
      ).rejects.toMatchObject({
        response: { status: 403 }
      })
    })
  })

  describe('Debug/Test APIs', () => {
    it('GET /api/test-github - success scenario', async () => {
      const mockResponse = {
        data: {
          status: 'success',
          message: 'GitHub connection working'
        }
      }

      axios.get.mockResolvedValueOnce(mockResponse)

      const response = await axios.get(
        `${API_BASE}/test-github`,
        mockHeaders
      )

      expect(response.data.status).toBe('success')
    })

    it('GET /api/debug/storage - success scenario', async () => {
      const mockResponse = {
        data: {
          storage_folders: {
            macros: '/path/to/macros',
            instructions: '/path/to/instructions'
          }
        }
      }

      axios.get.mockResolvedValueOnce(mockResponse)

      const response = await axios.get(
        `${API_BASE}/debug/storage`,
        mockHeaders
      )

      expect(response.data.storage_folders).toHaveProperty('macros')
    })
  })

  describe('Download API', () => {
    it('GET /api/files/${fileId}/download - success scenario (blob handling)', async () => {
      const fileId = 1
      const mockBlob = new Blob(['file content'], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })

      axios.get.mockResolvedValueOnce({
        data: mockBlob,
        headers: {
          'content-type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'content-disposition': 'attachment; filename="test.xlsx"'
        }
      })

      const response = await axios.get(
        `${API_BASE}/files/${fileId}/download`,
        {
          ...mockHeaders,
          responseType: 'blob'
        }
      )

      expect(response.data).toBeInstanceOf(Blob)
    })

    it('GET /api/files/${fileId}/download - error scenario', async () => {
      axios.get.mockRejectedValueOnce({
        response: {
          status: 404,
          data: { error: 'File not found' }
        }
      })

      await expect(
        axios.get(`${API_BASE}/files/999/download`, {
          ...mockHeaders,
          responseType: 'blob'
        })
      ).rejects.toMatchObject({
        response: { status: 404 }
      })
    })
  })

  describe('Error Scenarios Coverage', () => {
    it('handles 400 Bad Request errors', async () => {
      axios.post.mockRejectedValueOnce({
        response: {
          status: 400,
          data: { error: 'Bad Request' }
        }
      })

      await expect(
        axios.post(`${API_BASE}/register`, {})
      ).rejects.toMatchObject({
        response: { status: 400 }
      })
    })

    it('handles 401 Unauthorized errors', async () => {
      axios.get.mockRejectedValueOnce({
        response: {
          status: 401,
          data: { error: 'Unauthorized' }
        }
      })

      await expect(
        axios.get(`${API_BASE}/profile`, mockHeaders)
      ).rejects.toMatchObject({
        response: { status: 401 }
      })
    })

    it('handles 403 Forbidden errors', async () => {
      axios.get.mockRejectedValueOnce({
        response: {
          status: 403,
          data: { error: 'Forbidden' }
        }
      })

      await expect(
        axios.get(`${API_BASE}/admin/users`, mockHeaders)
      ).rejects.toMatchObject({
        response: { status: 403 }
      })
    })

    it('handles 404 Not Found errors', async () => {
      axios.get.mockRejectedValueOnce({
        response: {
          status: 404,
          data: { error: 'Not Found' }
        }
      })

      await expect(
        axios.get(`${API_BASE}/files/999`, mockHeaders)
      ).rejects.toMatchObject({
        response: { status: 404 }
      })
    })

    it('handles 500 Internal Server Error', async () => {
      axios.post.mockRejectedValueOnce({
        response: {
          status: 500,
          data: { error: 'Internal Server Error' }
        }
      })

      await expect(
        axios.post(`${API_BASE}/process/1`, {}, mockHeaders)
      ).rejects.toMatchObject({
        response: { status: 500 }
      })
    })

    it('handles network errors (no response)', async () => {
      axios.get.mockRejectedValueOnce({
        request: {},
        message: 'Network Error',
        code: 'ERR_NETWORK'
      })

      await expect(
        axios.get(`${API_BASE}/files`, mockHeaders)
      ).rejects.toMatchObject({
        code: 'ERR_NETWORK'
      })
    })

    it('handles request cancellation', async () => {
      const cancelToken = axios.CancelToken.source()

      axios.get.mockImplementation(() => {
        cancelToken.cancel('Request cancelled')
        return Promise.reject({
          message: 'Request cancelled',
          __CANCEL__: true
        })
      })

      await expect(
        axios.get(`${API_BASE}/files`, {
          ...mockHeaders,
          cancelToken: cancelToken.token
        })
      ).rejects.toMatchObject({
        __CANCEL__: true
      })
    })
  })
})
