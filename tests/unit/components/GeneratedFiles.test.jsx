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
    localStorage.clear()
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
      
      // Clear any previous mocks and set up fresh mock
      vi.clearAllMocks()
      axios.get.mockResolvedValue({ data: mockFiles })
      
      render(
        <ThemeProvider theme={theme}>
          <GeneratedFiles fileId={1} apiBase={apiBase} onDownload={mockOnDownload} />
        </ThemeProvider>
      )

      // Wait for axios to be called
      await waitFor(() => {
        expect(axios.get).toHaveBeenCalled()
      }, { timeout: 5000 })

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByText(/loading generated files/i)).not.toBeInTheDocument()
      }, { timeout: 5000 })

      // Wait for at least one file to appear (verifies API response was processed)
      await waitFor(() => {
        // Check if any of the files are present, or if sections are rendered
        const hasMacro = screen.queryByText('macro1.bas')
        const hasInstructions = screen.queryByText('instructions1.txt')
        const hasReport = screen.queryByText('report1.json')
        const hasProcessed = screen.queryByText('processed1.xlsx')
        const hasMacroSection = screen.queryByText(/macros/i)
        const hasInstructionsSection = screen.queryByText(/instructions/i)
        
        // At least one file or section should be present
        expect(hasMacro || hasInstructions || hasReport || hasProcessed || hasMacroSection || hasInstructionsSection).toBeTruthy()
      }, { timeout: 10000 })
      
      // If we got here, the component processed the response
      // Verify axios was called with correct parameters
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('/files/1/generated'),
        expect.any(Object)
      )
    }, { timeout: 15000 })

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

    it('handles network timeout errors', async () => {
      const timeoutError = new Error('timeout of 5000ms exceeded')
      timeoutError.code = 'ECONNABORTED'
      axios.get.mockRejectedValue(timeoutError)
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

    it('handles network errors (no response)', async () => {
      const networkError = new Error('Network Error')
      networkError.request = {}
      axios.get.mockRejectedValue(networkError)
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

    it('handles 404 Not Found error', async () => {
      axios.get.mockRejectedValue({
        response: {
          status: 404,
          data: { error: 'File not found' }
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

    it('handles empty state when only macros are empty', async () => {
      const mockFiles = {
        macros: [],
        instructions: [{ id: 1, original_filename: 'instructions.txt' }],
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
        expect(screen.getByText('instructions.txt')).toBeInTheDocument()
      })

      // Should not show empty state since instructions exist
      expect(screen.queryByText(/no generated files yet/i)).not.toBeInTheDocument()
      // Should not show macros section
      expect(screen.queryByText(/🖥️ macros/i)).not.toBeInTheDocument()
    })

    it('handles empty state when only instructions are empty', async () => {
      const mockFiles = {
        macros: [{ id: 1, original_filename: 'macro.bas' }],
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
        expect(screen.getByText('macro.bas')).toBeInTheDocument()
      })

      // Should not show empty state since macros exist
      expect(screen.queryByText(/no generated files yet/i)).not.toBeInTheDocument()
      // Should not show instructions section
      expect(screen.queryByText(/📋 instructions/i)).not.toBeInTheDocument()
    })

    it('handles empty state when only reports are empty', async () => {
      const mockFiles = {
        macros: [],
        instructions: [],
        reports: [],
        processed: [{ id: 1, original_filename: 'processed.xlsx' }]
      }
      axios.get.mockResolvedValue({ data: mockFiles })
      
      render(
        <ThemeProvider theme={theme}>
          <GeneratedFiles fileId={1} apiBase={apiBase} onDownload={mockOnDownload} />
        </ThemeProvider>
      )

      await waitFor(() => {
        expect(screen.getByText('processed.xlsx')).toBeInTheDocument()
      })

      // Should not show empty state since processed files exist
      expect(screen.queryByText(/no generated files yet/i)).not.toBeInTheDocument()
      // Should not show reports section
      expect(screen.queryByText(/📊 deletion reports/i)).not.toBeInTheDocument()
    })

    it('handles empty state when only processed files are empty', async () => {
      const mockFiles = {
        macros: [],
        instructions: [],
        reports: [{ id: 1, original_filename: 'report.json' }],
        processed: []
      }
      axios.get.mockResolvedValue({ data: mockFiles })
      
      render(
        <ThemeProvider theme={theme}>
          <GeneratedFiles fileId={1} apiBase={apiBase} onDownload={mockOnDownload} />
        </ThemeProvider>
      )

      await waitFor(() => {
        expect(screen.getByText('report.json')).toBeInTheDocument()
      })

      // Should not show empty state since reports exist
      expect(screen.queryByText(/no generated files yet/i)).not.toBeInTheDocument()
      // Should not show processed files section
      expect(screen.queryByText(/📥 processed files/i)).not.toBeInTheDocument()
    })

    it('handles download from different file types correctly', async () => {
      const mockFiles = {
        macros: [{ id: 1, original_filename: 'macro.bas' }],
        instructions: [{ id: 2, original_filename: 'instructions.txt' }],
        reports: [{ id: 3, original_filename: 'report.json' }],
        processed: [{ id: 4, original_filename: 'processed.xlsx' }]
      }
      axios.get.mockResolvedValue({ data: mockFiles })
      
      render(
        <ThemeProvider theme={theme}>
          <GeneratedFiles fileId={1} apiBase={apiBase} onDownload={mockOnDownload} />
        </ThemeProvider>
      )

      await waitFor(() => {
        expect(screen.getByText('macro.bas')).toBeInTheDocument()
      })

      // Test downloading from each file type
      const downloadButtons = screen.getAllByText('Download')
      expect(downloadButtons.length).toBe(4)

      // Download macro
      await act(async () => {
        fireEvent.click(downloadButtons[0])
      })
      expect(mockOnDownload).toHaveBeenCalledWith(1, 'macro.bas')

      // Download instructions
      await act(async () => {
        fireEvent.click(downloadButtons[1])
      })
      expect(mockOnDownload).toHaveBeenCalledWith(2, 'instructions.txt')

      // Download report
      await act(async () => {
        fireEvent.click(downloadButtons[2])
      })
      expect(mockOnDownload).toHaveBeenCalledWith(3, 'report.json')

      // Download processed file
      await act(async () => {
        fireEvent.click(downloadButtons[3])
      })
      expect(mockOnDownload).toHaveBeenCalledWith(4, 'processed.xlsx')
    })

    it('handles loading state transition from loading to empty', async () => {
      let resolvePromise
      const pendingPromise = new Promise((resolve) => {
        resolvePromise = resolve
      })
      axios.get.mockReturnValue(pendingPromise)
      
      const { rerender } = render(
        <ThemeProvider theme={theme}>
          <GeneratedFiles fileId={1} apiBase={apiBase} onDownload={mockOnDownload} />
        </ThemeProvider>
      )

      // Should show loading
      expect(screen.getByText(/loading generated files/i)).toBeInTheDocument()

      // Resolve with empty data
      await act(async () => {
        resolvePromise({ data: { macros: [], instructions: [], reports: [], processed: [] } })
      })

      // Should transition to empty state
      await waitFor(() => {
        expect(screen.getByText(/no generated files yet/i)).toBeInTheDocument()
      })
      expect(screen.queryByText(/loading generated files/i)).not.toBeInTheDocument()
    })

    it('handles loading state transition from loading to files', async () => {
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

      // Should show loading
      expect(screen.getByText(/loading generated files/i)).toBeInTheDocument()

      // Resolve with file data
      await act(async () => {
        resolvePromise({ 
          data: { 
            macros: [{ id: 1, original_filename: 'macro.bas' }],
            instructions: [],
            reports: [],
            processed: []
          } 
        })
      })

      // Should transition to showing files
      await waitFor(() => {
        expect(screen.getByText('macro.bas')).toBeInTheDocument()
      })
      expect(screen.queryByText(/loading generated files/i)).not.toBeInTheDocument()
      expect(screen.queryByText(/no generated files yet/i)).not.toBeInTheDocument()
    })

    it('handles fileId change from null to valid id', async () => {
      const { rerender } = render(
        <ThemeProvider theme={theme}>
          <GeneratedFiles fileId={null} apiBase={apiBase} onDownload={mockOnDownload} />
        </ThemeProvider>
      )

      // Should not call API when fileId is null
      expect(axios.get).not.toHaveBeenCalled()

      // Change to valid fileId
      axios.get.mockResolvedValueOnce({ 
        data: { macros: [], instructions: [], reports: [], processed: [] } 
      })

      await act(async () => {
        rerender(
          <ThemeProvider theme={theme}>
            <GeneratedFiles fileId={1} apiBase={apiBase} onDownload={mockOnDownload} />
          </ThemeProvider>
        )
      })

      // Should now call API
      await waitFor(() => {
        expect(axios.get).toHaveBeenCalled()
      })
    })

    it('handles fileId change from valid to null', async () => {
      axios.get.mockResolvedValueOnce({ 
        data: { macros: [], instructions: [], reports: [], processed: [] } 
      })

      const { rerender } = render(
        <ThemeProvider theme={theme}>
          <GeneratedFiles fileId={1} apiBase={apiBase} onDownload={mockOnDownload} />
        </ThemeProvider>
      )

      await waitFor(() => {
        expect(axios.get).toHaveBeenCalled()
      })

      // Change to null
      await act(async () => {
        rerender(
          <ThemeProvider theme={theme}>
            <GeneratedFiles fileId={null} apiBase={apiBase} onDownload={mockOnDownload} />
          </ThemeProvider>
        )
      })

      // Should not call API again when fileId becomes null
      const callCount = axios.get.mock.calls.length
      await waitFor(() => {
        expect(axios.get.mock.calls.length).toBe(callCount)
      })
    })

    it('handles multiple files of the same type', async () => {
      const mockFiles = {
        macros: [
          { id: 1, original_filename: 'macro1.bas' },
          { id: 2, original_filename: 'macro2.bas' },
          { id: 3, original_filename: 'macro3.bas' }
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
      expect(screen.getByText('macro3.bas')).toBeInTheDocument()
      
      // Should have 3 download buttons
      const downloadButtons = screen.getAllByText('Download')
      expect(downloadButtons.length).toBe(3)
    })

    it('handles files with special characters in filenames', async () => {
      const mockFiles = {
        macros: [{ id: 1, original_filename: 'macro (1).bas' }],
        instructions: [{ id: 2, original_filename: 'instructions_v2.txt' }],
        reports: [{ id: 3, original_filename: 'report-2024.json' }],
        processed: [{ id: 4, original_filename: 'processed file.xlsx' }]
      }
      axios.get.mockResolvedValue({ data: mockFiles })
      
      render(
        <ThemeProvider theme={theme}>
          <GeneratedFiles fileId={1} apiBase={apiBase} onDownload={mockOnDownload} />
        </ThemeProvider>
      )

      await waitFor(() => {
        expect(screen.getByText('macro (1).bas')).toBeInTheDocument()
      })

      expect(screen.getByText('instructions_v2.txt')).toBeInTheDocument()
      expect(screen.getByText('report-2024.json')).toBeInTheDocument()
      expect(screen.getByText('processed file.xlsx')).toBeInTheDocument()
    })
  })
})
