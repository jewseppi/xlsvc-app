/**
 * Unit tests for GeneratedFiles component
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, act, fireEvent } from '@testing-library/react'
import { ThemeProvider } from 'styled-components'
import GeneratedFiles from '../../../src/components/GeneratedFiles'
import { theme } from '../../../src/styled/theme'
import axios from 'axios'

vi.mock('axios')

describe('GeneratedFiles', () => {
  const mockOnDownload = vi.fn()
  const apiBase = 'http://localhost:5000/api'

  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.setItem('token', 'test-token')
  })

  it('shows loading state initially', async () => {
    // Use a promise that we control to keep component in loading state
    let resolvePromise
    const pendingPromise = new Promise((resolve) => {
      resolvePromise = resolve
    })
    axios.get.mockReturnValue(pendingPromise)
    
    render(
      <ThemeProvider theme={theme}>
        <GeneratedFiles fileId={1} apiBase={apiBase} onDownload={mockOnDownload} />
      </ThemeProvider>
    )

    // Assert loading state while promise is pending
    expect(screen.getByText(/loading generated files/i)).toBeInTheDocument()
    
    // Resolve the promise and wait for state updates to complete
    await act(async () => {
      resolvePromise({ data: { macros: [], instructions: [], reports: [], processed: [] } })
    })
    
    await waitFor(() => {
      expect(screen.getByText(/no generated files yet/i)).toBeInTheDocument()
    })
  })

  it('shows empty state when no files are available', async () => {
    axios.get.mockResolvedValue({ data: { macros: [], instructions: [], reports: [], processed: [] } })
    
    render(
      <ThemeProvider theme={theme}>
        <GeneratedFiles fileId={1} apiBase={apiBase} onDownload={mockOnDownload} />
      </ThemeProvider>
    )

    await waitFor(() => {
      expect(screen.getByText(/no generated files yet/i)).toBeInTheDocument()
    })
  })

  it('loads and displays macro files', async () => {
    const mockFiles = {
      macros: [
        { id: 1, original_filename: 'macro1.bas' },
        { id: 2, original_filename: 'macro2.bas' }
      ],
      instructions: [],
      reports: [],
      processed: []
    }
    axios.get.mockResolvedValue({ data: mockFiles })
    
    render(
      <ThemeProvider theme={theme}>
        <GeneratedFiles fileId={1} apiBase={apiBase} onDownload={mockOnDownload} />
      </ThemeProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('macro1.bas')).toBeInTheDocument()
    })

    expect(screen.getByText('macro2.bas')).toBeInTheDocument()
    expect(screen.getAllByText(/macros/i).length).toBeGreaterThan(0)

    expect(axios.get).toHaveBeenCalled()
    const callArgs = axios.get.mock.calls[0]
    expect(callArgs[0]).toBe(`${apiBase}/files/1/generated`)
    expect(callArgs[1].headers.Authorization).toContain('Bearer')
  })

  it('loads and displays instruction files', async () => {
    const mockFiles = {
      macros: [],
      instructions: [
        { id: 3, original_filename: 'instructions1.txt' },
        { id: 4, original_filename: 'instructions2.txt' }
      ],
      reports: [],
      processed: []
    }
    axios.get.mockResolvedValue({ data: mockFiles })
    
    render(
      <ThemeProvider theme={theme}>
        <GeneratedFiles fileId={1} apiBase={apiBase} onDownload={mockOnDownload} />
      </ThemeProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('instructions1.txt')).toBeInTheDocument()
    })

    expect(screen.getByText('instructions2.txt')).toBeInTheDocument()
    expect(screen.getAllByText(/instructions/i).length).toBeGreaterThan(0)
  })

  it('loads and displays report files', async () => {
    const mockFiles = {
      macros: [],
      instructions: [],
      reports: [
        { id: 5, original_filename: 'report1.json' }
      ],
      processed: []
    }
    axios.get.mockResolvedValue({ data: mockFiles })
    
    render(
      <ThemeProvider theme={theme}>
        <GeneratedFiles fileId={1} apiBase={apiBase} onDownload={mockOnDownload} />
      </ThemeProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('report1.json')).toBeInTheDocument()
    })

    expect(screen.getAllByText(/deletion reports/i).length).toBeGreaterThan(0)
  })

  it('loads and displays processed files', async () => {
    const mockFiles = {
      macros: [],
      instructions: [],
      reports: [],
      processed: [
        { id: 6, original_filename: 'processed1.xlsx' }
      ]
    }
    axios.get.mockResolvedValue({ data: mockFiles })
    
    render(
      <ThemeProvider theme={theme}>
        <GeneratedFiles fileId={1} apiBase={apiBase} onDownload={mockOnDownload} />
      </ThemeProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('processed1.xlsx')).toBeInTheDocument()
    })

    expect(screen.getAllByText(/processed files/i).length).toBeGreaterThan(0)
  })

  it('calls onDownload when download button is clicked', async () => {
    const mockFiles = {
      macros: [{ id: 1, original_filename: 'macro1.bas' }],
      instructions: [],
      reports: [],
      processed: []
    }
    axios.get.mockResolvedValue({ data: mockFiles })
    
    render(
      <ThemeProvider theme={theme}>
        <GeneratedFiles fileId={1} apiBase={apiBase} onDownload={mockOnDownload} />
      </ThemeProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Download')).toBeInTheDocument()
    })

    const downloadButton = screen.getByText('Download')
    await act(async () => {
      fireEvent.click(downloadButton)
    })
    expect(mockOnDownload).toHaveBeenCalledWith(1, 'macro1.bas')
  })

  it('does not load files when fileId is not provided', () => {
    render(
      <ThemeProvider theme={theme}>
        <GeneratedFiles fileId={null} apiBase={apiBase} onDownload={mockOnDownload} />
      </ThemeProvider>
    )

    expect(axios.get).not.toHaveBeenCalled()
  })

  it('handles API errors gracefully', async () => {
    axios.get.mockRejectedValue(new Error('API Error'))
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    render(
      <ThemeProvider theme={theme}>
        <GeneratedFiles fileId={1} apiBase={apiBase} onDownload={mockOnDownload} />
      </ThemeProvider>
    )

    await waitFor(() => {
      expect(screen.getByText(/no generated files yet/i)).toBeInTheDocument()
    })

    expect(consoleSpy).toHaveBeenCalled()
    consoleSpy.mockRestore()
  })

  describe('Edge Cases and Complete Coverage', () => {
    it('handles 401 Unauthorized error', async () => {
      axios.get.mockRejectedValue({
        response: {
          status: 401,
          data: { error: 'Unauthorized' }
        }
      })
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      render(
        <ThemeProvider theme={theme}>
          <GeneratedFiles fileId={1} apiBase={apiBase} onDownload={mockOnDownload} />
        </ThemeProvider>
      )

      await waitFor(() => {
        expect(screen.getByText(/no generated files yet/i)).toBeInTheDocument()
      })

      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })

    it('handles 403 Forbidden error', async () => {
      axios.get.mockRejectedValue({
        response: {
          status: 403,
          data: { error: 'Forbidden' }
        }
      })
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      render(
        <ThemeProvider theme={theme}>
          <GeneratedFiles fileId={1} apiBase={apiBase} onDownload={mockOnDownload} />
        </ThemeProvider>
      )

      await waitFor(() => {
        expect(screen.getByText(/no generated files yet/i)).toBeInTheDocument()
      })

      consoleSpy.mockRestore()
    })

    it('handles 500 Internal Server Error', async () => {
      axios.get.mockRejectedValue({
        response: {
          status: 500,
          data: { error: 'Internal Server Error' }
        }
      })
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      render(
        <ThemeProvider theme={theme}>
          <GeneratedFiles fileId={1} apiBase={apiBase} onDownload={mockOnDownload} />
        </ThemeProvider>
      )

      await waitFor(() => {
        expect(screen.getByText(/no generated files yet/i)).toBeInTheDocument()
      })

      consoleSpy.mockRestore()
    })

    it('handles fileId prop changes', async () => {
      const { rerender } = render(
        <ThemeProvider theme={theme}>
          <GeneratedFiles fileId={1} apiBase={apiBase} onDownload={mockOnDownload} />
        </ThemeProvider>
      )

      axios.get.mockResolvedValueOnce({ data: { macros: [], instructions: [], reports: [], processed: [] } })

      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith(
          expect.stringContaining('/files/1/generated'),
          expect.any(Object)
        )
      })

      // Change fileId
      axios.get.mockResolvedValueOnce({ data: { macros: [], instructions: [], reports: [], processed: [] } })

      await act(async () => {
        rerender(
          <ThemeProvider theme={theme}>
            <GeneratedFiles fileId={2} apiBase={apiBase} onDownload={mockOnDownload} />
          </ThemeProvider>
        )
      })

      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith(
          expect.stringContaining('/files/2/generated'),
          expect.any(Object)
        )
      })
    })

    it('displays all file types together', async () => {
      const mockFiles = {
        macros: [{ id: 1, original_filename: 'macro1.bas' }],
        instructions: [{ id: 2, original_filename: 'instructions1.txt' }],
        reports: [{ id: 3, original_filename: 'report1.json' }],
        processed: [{ id: 4, original_filename: 'processed1.xlsx' }]
      }
      axios.get.mockResolvedValue({ data: mockFiles })
      
      render(
        <ThemeProvider theme={theme}>
          <GeneratedFiles fileId={1} apiBase={apiBase} onDownload={mockOnDownload} />
        </ThemeProvider>
      )

      // Wait for API call to complete
      await waitFor(() => {
        expect(axios.get).toHaveBeenCalled()
      })

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByText(/loading generated files/i)).not.toBeInTheDocument()
      }, { timeout: 3000 })

      // Wait for all files to appear
      await waitFor(() => {
        expect(screen.getByText('macro1.bas')).toBeInTheDocument()
        expect(screen.getByText('instructions1.txt')).toBeInTheDocument()
        expect(screen.getByText('report1.json')).toBeInTheDocument()
        expect(screen.getByText('processed1.xlsx')).toBeInTheDocument()
      }, { timeout: 3000 })
    })

    it('handles download error scenarios', async () => {
      const mockFiles = {
        macros: [{ id: 1, original_filename: 'macro1.bas' }],
        instructions: [],
        reports: [],
        processed: []
      }
      axios.get.mockResolvedValue({ data: mockFiles })
      
      render(
        <ThemeProvider theme={theme}>
          <GeneratedFiles fileId={1} apiBase={apiBase} onDownload={mockOnDownload} />
        </ThemeProvider>
      )

      await waitFor(() => {
        expect(screen.getByText('macro1.bas')).toBeInTheDocument()
      })

      const downloadButton = screen.getByText('Download')
      await act(async () => {
        fireEvent.click(downloadButton)
      })
      
      // onDownload should be called even if download fails (error handling is in parent)
      expect(mockOnDownload).toHaveBeenCalledWith(1, 'macro1.bas')
    })
  })
})
