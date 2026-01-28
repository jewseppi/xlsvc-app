/**
 * Unit tests for ProcessingHistory component
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react'
import { ThemeProvider } from 'styled-components'
import ProcessingHistory from '../../../src/components/ProcessingHistory'
import { theme } from '../../../src/styled/theme'
import axios from 'axios'

vi.mock('axios')

describe('ProcessingHistory', () => {
  const mockOnDownload = vi.fn()
  const mockSetHistory = vi.fn()
  const apiBase = 'http://localhost:5000/api'

  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.setItem('token', 'test-token')
    // Mock window.confirm and window.alert
    global.confirm = vi.fn(() => true)
    global.alert = vi.fn()
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
        <ProcessingHistory 
          fileId={1} 
          apiBase={apiBase} 
          onDownload={mockOnDownload}
          history={[]}
          setHistory={mockSetHistory}
        />
      </ThemeProvider>
    )

    // Assert loading state while promise is pending
    expect(screen.getByText(/loading processing history/i)).toBeInTheDocument()
    
    // Resolve the promise and wait for state updates to complete
    await act(async () => {
      resolvePromise({ data: { history: [] } })
    })
    
    await waitFor(() => {
      expect(screen.getByText(/no processing history yet/i)).toBeInTheDocument()
    })
  })

  it('shows empty state when no history exists', async () => {
    axios.get.mockResolvedValue({ data: { history: [] } })
    
    render(
      <ThemeProvider theme={theme}>
        <ProcessingHistory 
          fileId={1} 
          apiBase={apiBase} 
          onDownload={mockOnDownload}
          history={[]}
          setHistory={mockSetHistory}
        />
      </ThemeProvider>
    )

    await waitFor(() => {
      expect(screen.getByText(/no processing history yet/i)).toBeInTheDocument()
    })
  })

  it('loads and displays history items', async () => {
    const mockHistory = [
      {
        job_id: 1,
        processed_at: '2024-01-15T10:30:00Z',
        status: 'completed',
        deleted_rows: 5,
        filter_rules: [{ column: 'F', value: '0' }],
        processed_filename: 'processed.xlsx',
        result_file_id: 10
      }
    ]
    axios.get.mockResolvedValue({ data: { history: mockHistory } })
    
    render(
      <ThemeProvider theme={theme}>
        <ProcessingHistory 
          fileId={1} 
          apiBase={apiBase} 
          onDownload={mockOnDownload}
          history={mockHistory}
          setHistory={mockSetHistory}
        />
      </ThemeProvider>
    )

    await waitFor(() => {
      expect(screen.getByText(/rows deleted/i)).toBeInTheDocument()
    })

    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('displays completed status badge', async () => {
    const mockHistory = [
      {
        job_id: 1,
        processed_at: '2024-01-15T10:30:00Z',
        status: 'completed',
        deleted_rows: 0
      }
    ]
    axios.get.mockResolvedValue({ data: { history: mockHistory } })
    
    render(
      <ThemeProvider theme={theme}>
        <ProcessingHistory 
          fileId={1} 
          apiBase={apiBase} 
          onDownload={mockOnDownload}
          history={mockHistory}
          setHistory={mockSetHistory}
        />
      </ThemeProvider>
    )

    await waitFor(() => {
      expect(screen.getByText(/completed/i)).toBeInTheDocument()
    })
  })

  it('displays failed status badge', async () => {
    const mockHistory = [
      {
        job_id: 2,
        processed_at: '2024-01-15T10:30:00Z',
        status: 'failed'
      }
    ]
    axios.get.mockResolvedValue({ data: { history: mockHistory } })
    
    render(
      <ThemeProvider theme={theme}>
        <ProcessingHistory 
          fileId={1} 
          apiBase={apiBase} 
          onDownload={mockOnDownload}
          history={mockHistory}
          setHistory={mockSetHistory}
        />
      </ThemeProvider>
    )

    await waitFor(() => {
      expect(screen.getByText(/processing failed/i)).toBeInTheDocument()
    })

    // Check that failed status badge exists (there may be multiple "failed" texts)
    const failedElements = screen.getAllByText(/failed/i)
    expect(failedElements.length).toBeGreaterThan(0)
  })

  it('displays processing status badge', async () => {
    const mockHistory = [
      {
        job_id: 3,
        processed_at: '2024-01-15T10:30:00Z',
        status: 'processing'
      }
    ]
    axios.get.mockResolvedValue({ data: { history: mockHistory } })
    
    render(
      <ThemeProvider theme={theme}>
        <ProcessingHistory 
          fileId={1} 
          apiBase={apiBase} 
          onDownload={mockOnDownload}
          history={mockHistory}
          setHistory={mockSetHistory}
        />
      </ThemeProvider>
    )

    await waitFor(() => {
      expect(screen.getByText(/processing/i)).toBeInTheDocument()
    })
  })

  it('displays filter rules when present', async () => {
    const mockHistory = [
      {
        job_id: 1,
        processed_at: '2024-01-15T10:30:00Z',
        status: 'completed',
        deleted_rows: 5,
        filter_rules: [
          { column: 'F', value: '0' },
          { column: 'G', value: '0' }
        ]
      }
    ]
    axios.get.mockResolvedValue({ data: { history: mockHistory } })
    
    render(
      <ThemeProvider theme={theme}>
        <ProcessingHistory 
          fileId={1} 
          apiBase={apiBase} 
          onDownload={mockOnDownload}
          history={mockHistory}
          setHistory={mockSetHistory}
        />
      </ThemeProvider>
    )

    await waitFor(() => {
      expect(screen.getByText(/filters applied/i)).toBeInTheDocument()
    })

    expect(screen.getByText("F = '0'")).toBeInTheDocument()
    expect(screen.getByText("G = '0'")).toBeInTheDocument()
  })

  it('shows "File was clean" message when deleted_rows is 0', async () => {
    const mockHistory = [
      {
        job_id: 1,
        processed_at: '2024-01-15T10:30:00Z',
        status: 'completed',
        deleted_rows: 0
      }
    ]
    axios.get.mockResolvedValue({ data: { history: mockHistory } })
    
    render(
      <ThemeProvider theme={theme}>
        <ProcessingHistory 
          fileId={1} 
          apiBase={apiBase} 
          onDownload={mockOnDownload}
          history={mockHistory}
          setHistory={mockSetHistory}
        />
      </ThemeProvider>
    )

    await waitFor(() => {
      expect(screen.getByText(/file was clean/i)).toBeInTheDocument()
    })
  })

  it('calls onDownload when download button is clicked', async () => {
    const mockHistory = [
      {
        job_id: 1,
        processed_at: '2024-01-15T10:30:00Z',
        status: 'completed',
        deleted_rows: 5,
        processed_filename: 'processed.xlsx',
        result_file_id: 10
      }
    ]
    axios.get.mockResolvedValue({ data: { history: mockHistory } })
    
    render(
      <ThemeProvider theme={theme}>
        <ProcessingHistory 
          fileId={1} 
          apiBase={apiBase} 
          onDownload={mockOnDownload}
          history={mockHistory}
          setHistory={mockSetHistory}
        />
      </ThemeProvider>
    )

    await waitFor(() => {
      expect(screen.getByText(/download processed file/i)).toBeInTheDocument()
    })

    const downloadButton = screen.getByText(/download processed file/i)
    await act(async () => {
      fireEvent.click(downloadButton)
    })
    expect(mockOnDownload).toHaveBeenCalledWith(10, 'processed.xlsx')
  })

  it('shows clear history button for admin users', async () => {
    const mockHistory = [
      {
        job_id: 1,
        processed_at: '2024-01-15T10:30:00Z',
        status: 'completed',
        deleted_rows: 5
      }
    ]
    axios.get.mockResolvedValue({ data: { history: mockHistory } })
    
    render(
      <ThemeProvider theme={theme}>
        <ProcessingHistory 
          fileId={1} 
          apiBase={apiBase} 
          onDownload={mockOnDownload}
          history={mockHistory}
          setHistory={mockSetHistory}
          isAdmin={true}
        />
      </ThemeProvider>
    )

    await waitFor(() => {
      expect(screen.getByText(/clear all history/i)).toBeInTheDocument()
    })
  })

  it('does not show clear history button for non-admin users', async () => {
    const mockHistory = [
      {
        job_id: 1,
        processed_at: '2024-01-15T10:30:00Z',
        status: 'completed',
        deleted_rows: 5
      }
    ]
    axios.get.mockResolvedValue({ data: { history: mockHistory } })
    
    render(
      <ThemeProvider theme={theme}>
        <ProcessingHistory 
          fileId={1} 
          apiBase={apiBase} 
          onDownload={mockOnDownload}
          history={mockHistory}
          setHistory={mockSetHistory}
          isAdmin={false}
        />
      </ThemeProvider>
    )

    await waitFor(() => {
      expect(screen.queryByText(/clear all history/i)).not.toBeInTheDocument()
    })
  })

  it('handles API errors gracefully', async () => {
    axios.get.mockRejectedValue(new Error('API Error'))
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    render(
      <ThemeProvider theme={theme}>
        <ProcessingHistory 
          fileId={1} 
          apiBase={apiBase} 
          onDownload={mockOnDownload}
          history={[]}
          setHistory={mockSetHistory}
        />
      </ThemeProvider>
    )

    await waitFor(() => {
      expect(screen.getByText(/failed to load processing history/i)).toBeInTheDocument()
    })

    expect(consoleSpy).toHaveBeenCalled()
    consoleSpy.mockRestore()
  })

  it('does not load history when fileId is not provided', () => {
    render(
      <ThemeProvider theme={theme}>
        <ProcessingHistory 
          fileId={null} 
          apiBase={apiBase} 
          onDownload={mockOnDownload}
          history={[]}
          setHistory={mockSetHistory}
        />
      </ThemeProvider>
    )

    expect(axios.get).not.toHaveBeenCalled()
  })

  describe('Delete Operations', () => {
    it('cancels delete item when confirmation is rejected', async () => {
      const mockHistory = [
        {
          job_id: 1,
          processed_at: '2024-01-15T10:30:00Z',
          status: 'completed',
          deleted_rows: 5
        }
      ]
      axios.get.mockResolvedValue({ data: { history: mockHistory } })
      global.confirm = vi.fn(() => false) // User cancels
      
      render(
        <ThemeProvider theme={theme}>
          <ProcessingHistory 
            fileId={1} 
            apiBase={apiBase} 
            onDownload={mockOnDownload}
            history={mockHistory}
            setHistory={mockSetHistory}
          />
        </ThemeProvider>
      )

      await waitFor(() => {
        expect(screen.getByText(/rows deleted/i)).toBeInTheDocument()
      })

      // Find delete button (🗑️ emoji)
      const deleteButtons = screen.getAllByTitle(/delete this history item/i)
      if (deleteButtons.length > 0) {
        await act(async () => {
          fireEvent.click(deleteButtons[0])
        })

        // Should not call delete API
        expect(axios.delete).not.toHaveBeenCalled()
      }
    })

    it('handles delete item API error', async () => {
      const mockHistory = [
        {
          job_id: 1,
          processed_at: '2024-01-15T10:30:00Z',
          status: 'completed',
          deleted_rows: 5
        }
      ]
      axios.get.mockResolvedValue({ data: { history: mockHistory } })
      axios.delete.mockRejectedValue({
        response: {
          status: 500,
          data: { error: 'Delete failed' }
        }
      })
      global.alert = vi.fn()
      
      render(
        <ThemeProvider theme={theme}>
          <ProcessingHistory 
            fileId={1} 
            apiBase={apiBase} 
            onDownload={mockOnDownload}
            history={mockHistory}
            setHistory={mockSetHistory}
          />
        </ThemeProvider>
      )

      await waitFor(() => {
        expect(screen.getByText(/rows deleted/i)).toBeInTheDocument()
      })

      const deleteButtons = screen.getAllByTitle(/delete this history item/i)
      if (deleteButtons.length > 0) {
        await act(async () => {
          fireEvent.click(deleteButtons[0])
        })

        await waitFor(() => {
          expect(axios.delete).toHaveBeenCalled()
        })

        // Should show alert on error
        await waitFor(() => {
          expect(global.alert).toHaveBeenCalled()
        })
      }
    })

    it('cancels clear history when confirmation is rejected', async () => {
      const mockHistory = [
        {
          job_id: 1,
          processed_at: '2024-01-15T10:30:00Z',
          status: 'completed',
          deleted_rows: 5
        }
      ]
      axios.get.mockResolvedValue({ data: { history: mockHistory } })
      global.confirm = vi.fn(() => false) // User cancels
      
      render(
        <ThemeProvider theme={theme}>
          <ProcessingHistory 
            fileId={1} 
            apiBase={apiBase} 
            onDownload={mockOnDownload}
            history={mockHistory}
            setHistory={mockSetHistory}
            isAdmin={true}
          />
        </ThemeProvider>
      )

      await waitFor(() => {
        expect(screen.getByText(/clear all history/i)).toBeInTheDocument()
      })

      const clearButton = screen.getByText(/clear all history/i)
      await act(async () => {
        fireEvent.click(clearButton)
      })

      // Should not call delete API
      expect(axios.delete).not.toHaveBeenCalled()
    })

    it('handles clear history API error', async () => {
      const mockHistory = [
        {
          job_id: 1,
          processed_at: '2024-01-15T10:30:00Z',
          status: 'completed',
          deleted_rows: 5
        }
      ]
      axios.get.mockResolvedValue({ data: { history: mockHistory } })
      axios.delete.mockRejectedValue({
        response: {
          status: 500,
          data: { error: 'Clear failed' }
        }
      })
      global.alert = vi.fn()
      
      render(
        <ThemeProvider theme={theme}>
          <ProcessingHistory 
            fileId={1} 
            apiBase={apiBase} 
            onDownload={mockOnDownload}
            history={mockHistory}
            setHistory={mockSetHistory}
            isAdmin={true}
          />
        </ThemeProvider>
      )

      await waitFor(() => {
        expect(screen.getByText(/clear all history/i)).toBeInTheDocument()
      })

      const clearButton = screen.getByText(/clear all history/i)
      await act(async () => {
        fireEvent.click(clearButton)
      })

      await waitFor(() => {
        expect(axios.delete).toHaveBeenCalled()
      })

      // Should show alert on error
      await waitFor(() => {
        expect(global.alert).toHaveBeenCalled()
      })
    })

    it('successfully deletes history item', async () => {
      const mockHistory = [
        {
          job_id: 1,
          processed_at: '2024-01-15T10:30:00Z',
          status: 'completed',
          deleted_rows: 5
        }
      ]
      axios.get.mockResolvedValue({ data: { history: mockHistory } })
      axios.delete.mockResolvedValueOnce({ data: { success: true } })
      global.confirm = vi.fn(() => true) // User confirms
      
      render(
        <ThemeProvider theme={theme}>
          <ProcessingHistory 
            fileId={1} 
            apiBase={apiBase} 
            onDownload={mockOnDownload}
            history={mockHistory}
            setHistory={mockSetHistory}
          />
        </ThemeProvider>
      )

      await waitFor(() => {
        expect(screen.getByText(/rows deleted/i)).toBeInTheDocument()
      })

      const deleteButtons = screen.getAllByTitle(/delete this history item/i)
      if (deleteButtons.length > 0) {
        await act(async () => {
          fireEvent.click(deleteButtons[0])
        })

        await waitFor(() => {
          expect(axios.delete).toHaveBeenCalledWith(
            expect.stringContaining('/files/1/history/1'),
            expect.any(Object)
          )
        })

        // Verify setHistory was called to remove the item
        await waitFor(() => {
          expect(mockSetHistory).toHaveBeenCalled()
        })
      }
    })

    it('successfully clears all history', async () => {
      const mockHistory = [
        {
          job_id: 1,
          processed_at: '2024-01-15T10:30:00Z',
          status: 'completed',
          deleted_rows: 5
        },
        {
          job_id: 2,
          processed_at: '2024-01-16T10:30:00Z',
          status: 'completed',
          deleted_rows: 3
        }
      ]
      axios.get.mockResolvedValue({ data: { history: mockHistory } })
      axios.delete.mockResolvedValueOnce({ 
        data: { deleted_count: 2 } 
      })
      global.confirm = vi.fn(() => true) // User confirms
      global.alert = vi.fn()
      
      render(
        <ThemeProvider theme={theme}>
          <ProcessingHistory 
            fileId={1} 
            apiBase={apiBase} 
            onDownload={mockOnDownload}
            history={mockHistory}
            setHistory={mockSetHistory}
            isAdmin={true}
          />
        </ThemeProvider>
      )

      await waitFor(() => {
        expect(screen.getByText(/clear all history/i)).toBeInTheDocument()
      })

      const clearButton = screen.getByText(/clear all history/i)
      await act(async () => {
        fireEvent.click(clearButton)
      })

      await waitFor(() => {
        expect(axios.delete).toHaveBeenCalledWith(
          expect.stringContaining('/files/1/history'),
          expect.any(Object)
        )
      })

      // Verify setHistory was called with empty array
      await waitFor(() => {
        expect(mockSetHistory).toHaveBeenCalledWith([])
      })

      // Verify alert was called with success message
      await waitFor(() => {
        expect(global.alert).toHaveBeenCalledWith(
          expect.stringContaining('Cleared 2 history items')
        )
      })
    })
  })

  describe('Edge Cases', () => {
    it('handles date formatting edge cases', async () => {
      const mockHistory = [
        {
          job_id: 1,
          processed_at: '2024-01-01T00:00:00Z', // Edge case: midnight UTC
          status: 'completed',
          deleted_rows: 5
        }
      ]
      axios.get.mockResolvedValue({ data: { history: mockHistory } })
      
      render(
        <ThemeProvider theme={theme}>
          <ProcessingHistory 
            fileId={1} 
            apiBase={apiBase} 
            onDownload={mockOnDownload}
            history={mockHistory}
            setHistory={mockSetHistory}
          />
        </ThemeProvider>
      )

      await waitFor(() => {
        // Date should be formatted
        expect(screen.getByText(/rows deleted/i)).toBeInTheDocument()
      })
    })

    it('handles missing filter rules gracefully', async () => {
      const mockHistory = [
        {
          job_id: 1,
          processed_at: '2024-01-15T10:30:00Z',
          status: 'completed',
          deleted_rows: 5,
          filter_rules: null // Missing filter rules
        }
      ]
      axios.get.mockResolvedValue({ data: { history: mockHistory } })
      
      render(
        <ThemeProvider theme={theme}>
          <ProcessingHistory 
            fileId={1} 
            apiBase={apiBase} 
            onDownload={mockOnDownload}
            history={mockHistory}
            setHistory={mockSetHistory}
          />
        </ThemeProvider>
      )

      await waitFor(() => {
        expect(screen.getByText(/rows deleted/i)).toBeInTheDocument()
      })

      // Should not show filter rules section
      expect(screen.queryByText(/filters applied/i)).not.toBeInTheDocument()
    })

    it('handles empty filter rules array', async () => {
      const mockHistory = [
        {
          job_id: 1,
          processed_at: '2024-01-15T10:30:00Z',
          status: 'completed',
          deleted_rows: 5,
          filter_rules: [] // Empty array
        }
      ]
      axios.get.mockResolvedValue({ data: { history: mockHistory } })
      
      render(
        <ThemeProvider theme={theme}>
          <ProcessingHistory 
            fileId={1} 
            apiBase={apiBase} 
            onDownload={mockOnDownload}
            history={mockHistory}
            setHistory={mockSetHistory}
          />
        </ThemeProvider>
      )

      await waitFor(() => {
        expect(screen.getByText(/rows deleted/i)).toBeInTheDocument()
      })

      // Should not show filter rules section when empty
      expect(screen.queryByText(/filters applied/i)).not.toBeInTheDocument()
    })

    it('handles missing processed_filename gracefully', async () => {
      const mockHistory = [
        {
          job_id: 1,
          processed_at: '2024-01-15T10:30:00Z',
          status: 'completed',
          deleted_rows: 5,
          result_file_id: 10
          // Missing processed_filename
        }
      ]
      axios.get.mockResolvedValue({ data: { history: mockHistory } })
      
      render(
        <ThemeProvider theme={theme}>
          <ProcessingHistory 
            fileId={1} 
            apiBase={apiBase} 
            onDownload={mockOnDownload}
            history={mockHistory}
            setHistory={mockSetHistory}
          />
        </ThemeProvider>
      )

      await waitFor(() => {
        expect(screen.getByText(/rows deleted/i)).toBeInTheDocument()
      })

      // Download button should still work even without filename
      const downloadButtons = screen.queryAllByText(/download processed file/i)
      if (downloadButtons.length > 0) {
        await act(async () => {
          fireEvent.click(downloadButtons[0])
        })
        expect(mockOnDownload).toHaveBeenCalledWith(10, undefined)
      }
    })

    it('handles all status badge states', async () => {
      const mockHistory = [
        { job_id: 1, processed_at: '2024-01-15T10:30:00Z', status: 'completed', deleted_rows: 0 },
        { job_id: 2, processed_at: '2024-01-15T10:30:00Z', status: 'failed' },
        { job_id: 3, processed_at: '2024-01-15T10:30:00Z', status: 'processing' }
      ]
      axios.get.mockResolvedValue({ data: { history: mockHistory } })
      
      render(
        <ThemeProvider theme={theme}>
          <ProcessingHistory 
            fileId={1} 
            apiBase={apiBase} 
            onDownload={mockOnDownload}
            history={mockHistory}
            setHistory={mockSetHistory}
          />
        </ThemeProvider>
      )

      await waitFor(() => {
        expect(screen.getByText(/completed/i)).toBeInTheDocument()
        // Use getAllByText since "failed" appears multiple times (badge and error message)
        const failedElements = screen.getAllByText(/failed/i)
        expect(failedElements.length).toBeGreaterThan(0)
        // Use getAllByText for "processing" as well since it might appear multiple times
        const processingElements = screen.getAllByText(/processing/i)
        expect(processingElements.length).toBeGreaterThan(0)
      })
    })

    it('handles date formatting with different timezone formats', async () => {
      const mockHistory = [
        {
          job_id: 1,
          processed_at: '2024-12-31T23:59:59Z', // Edge case: end of year
          status: 'completed',
          deleted_rows: 5
        },
        {
          job_id: 2,
          processed_at: '2024-01-01T00:00:00Z', // Edge case: start of year
          status: 'completed',
          deleted_rows: 3
        }
      ]
      axios.get.mockResolvedValue({ data: { history: mockHistory } })
      
      render(
        <ThemeProvider theme={theme}>
          <ProcessingHistory 
            fileId={1} 
            apiBase={apiBase} 
            onDownload={mockOnDownload}
            history={mockHistory}
            setHistory={mockSetHistory}
          />
        </ThemeProvider>
      )

      await waitFor(() => {
        expect(screen.getByText(/rows deleted/i)).toBeInTheDocument()
      })

      // Dates should be formatted and displayed
      expect(screen.getAllByText(/rows deleted/i).length).toBeGreaterThan(0)
    })

    it('handles very long filenames', async () => {
      const longFilename = 'a'.repeat(200) + '.xlsx'
      const mockHistory = [
        {
          job_id: 1,
          processed_at: '2024-01-15T10:30:00Z',
          status: 'completed',
          deleted_rows: 5,
          processed_filename: longFilename,
          result_file_id: 10
        }
      ]
      axios.get.mockResolvedValue({ data: { history: mockHistory } })
      
      render(
        <ThemeProvider theme={theme}>
          <ProcessingHistory 
            fileId={1} 
            apiBase={apiBase} 
            onDownload={mockOnDownload}
            history={mockHistory}
            setHistory={mockSetHistory}
          />
        </ThemeProvider>
      )

      await waitFor(() => {
        expect(screen.getByText(/rows deleted/i)).toBeInTheDocument()
      })

      // Should handle long filename (may be truncated in display)
      const downloadButton = screen.getByText(/download processed file/i)
      await act(async () => {
        fireEvent.click(downloadButton)
      })
      expect(mockOnDownload).toHaveBeenCalledWith(10, longFilename)
    })

    it('handles missing result_file_id for completed jobs', async () => {
      const mockHistory = [
        {
          job_id: 1,
          processed_at: '2024-01-15T10:30:00Z',
          status: 'completed',
          deleted_rows: 5,
          processed_filename: 'processed.xlsx'
          // Missing result_file_id
        }
      ]
      axios.get.mockResolvedValue({ data: { history: mockHistory } })
      
      render(
        <ThemeProvider theme={theme}>
          <ProcessingHistory 
            fileId={1} 
            apiBase={apiBase} 
            onDownload={mockOnDownload}
            history={mockHistory}
            setHistory={mockSetHistory}
          />
        </ThemeProvider>
      )

      await waitFor(() => {
        expect(screen.getByText(/rows deleted/i)).toBeInTheDocument()
      })

      // Download button should not appear if result_file_id is missing
      expect(screen.queryByText(/download processed file/i)).not.toBeInTheDocument()
    })

    it('handles delete item with network timeout', async () => {
      const mockHistory = [
        {
          job_id: 1,
          processed_at: '2024-01-15T10:30:00Z',
          status: 'completed',
          deleted_rows: 5
        }
      ]
      axios.get.mockResolvedValue({ data: { history: mockHistory } })
      const timeoutError = new Error('timeout of 5000ms exceeded')
      timeoutError.code = 'ECONNABORTED'
      axios.delete.mockRejectedValue(timeoutError)
      global.alert = vi.fn()
      
      render(
        <ThemeProvider theme={theme}>
          <ProcessingHistory 
            fileId={1} 
            apiBase={apiBase} 
            onDownload={mockOnDownload}
            history={mockHistory}
            setHistory={mockSetHistory}
          />
        </ThemeProvider>
      )

      await waitFor(() => {
        expect(screen.getByText(/rows deleted/i)).toBeInTheDocument()
      })

      const deleteButtons = screen.getAllByTitle(/delete this history item/i)
      if (deleteButtons.length > 0) {
        await act(async () => {
          fireEvent.click(deleteButtons[0])
        })

        await waitFor(() => {
          expect(axios.delete).toHaveBeenCalled()
        })

        // Should show alert on timeout error
        await waitFor(() => {
          expect(global.alert).toHaveBeenCalled()
        })
      }
    })

    it('handles clear history with network timeout', async () => {
      const mockHistory = [
        {
          job_id: 1,
          processed_at: '2024-01-15T10:30:00Z',
          status: 'completed',
          deleted_rows: 5
        }
      ]
      axios.get.mockResolvedValue({ data: { history: mockHistory } })
      const timeoutError = new Error('timeout of 5000ms exceeded')
      timeoutError.code = 'ECONNABORTED'
      axios.delete.mockRejectedValue(timeoutError)
      global.alert = vi.fn()
      
      render(
        <ThemeProvider theme={theme}>
          <ProcessingHistory 
            fileId={1} 
            apiBase={apiBase} 
            onDownload={mockOnDownload}
            history={mockHistory}
            setHistory={mockSetHistory}
            isAdmin={true}
          />
        </ThemeProvider>
      )

      await waitFor(() => {
        expect(screen.getByText(/clear all history/i)).toBeInTheDocument()
      })

      const clearButton = screen.getByText(/clear all history/i)
      await act(async () => {
        fireEvent.click(clearButton)
      })

      await waitFor(() => {
        expect(axios.delete).toHaveBeenCalled()
      })

      // Should show alert on timeout error
      await waitFor(() => {
        expect(global.alert).toHaveBeenCalled()
      })
    })

    it('handles delete item with network error (no response)', async () => {
      const mockHistory = [
        {
          job_id: 1,
          processed_at: '2024-01-15T10:30:00Z',
          status: 'completed',
          deleted_rows: 5
        }
      ]
      axios.get.mockResolvedValue({ data: { history: mockHistory } })
      const networkError = new Error('Network Error')
      networkError.request = {}
      axios.delete.mockRejectedValue(networkError)
      global.alert = vi.fn()
      
      render(
        <ThemeProvider theme={theme}>
          <ProcessingHistory 
            fileId={1} 
            apiBase={apiBase} 
            onDownload={mockOnDownload}
            history={mockHistory}
            setHistory={mockSetHistory}
          />
        </ThemeProvider>
      )

      await waitFor(() => {
        expect(screen.getByText(/rows deleted/i)).toBeInTheDocument()
      })

      const deleteButtons = screen.getAllByTitle(/delete this history item/i)
      if (deleteButtons.length > 0) {
        await act(async () => {
          fireEvent.click(deleteButtons[0])
        })

        await waitFor(() => {
          expect(axios.delete).toHaveBeenCalled()
        })

        // Should show alert on network error
        await waitFor(() => {
          expect(global.alert).toHaveBeenCalled()
        })
      }
    })

    it('handles multiple delete operations sequentially', async () => {
      const mockHistory = [
        {
          job_id: 1,
          processed_at: '2024-01-15T10:30:00Z',
          status: 'completed',
          deleted_rows: 5
        },
        {
          job_id: 2,
          processed_at: '2024-01-16T10:30:00Z',
          status: 'completed',
          deleted_rows: 3
        }
      ]
      axios.get.mockResolvedValue({ data: { history: mockHistory } })
      axios.delete.mockResolvedValue({ data: { success: true } })
      global.confirm = vi.fn(() => true)
      
      render(
        <ThemeProvider theme={theme}>
          <ProcessingHistory 
            fileId={1} 
            apiBase={apiBase} 
            onDownload={mockOnDownload}
            history={mockHistory}
            setHistory={mockSetHistory}
          />
        </ThemeProvider>
      )

      await waitFor(() => {
        expect(screen.getByText(/rows deleted/i)).toBeInTheDocument()
      })

      const deleteButtons = screen.getAllByTitle(/delete this history item/i)
      expect(deleteButtons.length).toBe(2)

      // Delete first item
      if (deleteButtons.length > 0) {
        await act(async () => {
          fireEvent.click(deleteButtons[0])
        })

        await waitFor(() => {
          expect(axios.delete).toHaveBeenCalledWith(
            expect.stringContaining('/files/1/history/1'),
            expect.any(Object)
          )
        })

        // Verify setHistory was called
        expect(mockSetHistory).toHaveBeenCalled()
      }
    })

    it('handles error state with different error messages', async () => {
      axios.get.mockRejectedValue(new Error('Custom error message'))
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      render(
        <ThemeProvider theme={theme}>
          <ProcessingHistory 
            fileId={1} 
            apiBase={apiBase} 
            onDownload={mockOnDownload}
            history={[]}
            setHistory={mockSetHistory}
          />
        </ThemeProvider>
      )

      await waitFor(() => {
        expect(screen.getByText(/failed to load processing history/i)).toBeInTheDocument()
      })

      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })

    it('handles error state with 401 Unauthorized', async () => {
      axios.get.mockRejectedValue({
        response: {
          status: 401,
          data: { error: 'Unauthorized' }
        }
      })
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      render(
        <ThemeProvider theme={theme}>
          <ProcessingHistory 
            fileId={1} 
            apiBase={apiBase} 
            onDownload={mockOnDownload}
            history={[]}
            setHistory={mockSetHistory}
          />
        </ThemeProvider>
      )

      await waitFor(() => {
        expect(screen.getByText(/failed to load processing history/i)).toBeInTheDocument()
      })

      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })

    it('handles error state with 403 Forbidden', async () => {
      axios.get.mockRejectedValue({
        response: {
          status: 403,
          data: { error: 'Forbidden' }
        }
      })
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      render(
        <ThemeProvider theme={theme}>
          <ProcessingHistory 
            fileId={1} 
            apiBase={apiBase} 
            onDownload={mockOnDownload}
            history={[]}
            setHistory={mockSetHistory}
          />
        </ThemeProvider>
      )

      await waitFor(() => {
        expect(screen.getByText(/failed to load processing history/i)).toBeInTheDocument()
      })

      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })

    it('handles error state with 500 Internal Server Error', async () => {
      axios.get.mockRejectedValue({
        response: {
          status: 500,
          data: { error: 'Internal Server Error' }
        }
      })
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      render(
        <ThemeProvider theme={theme}>
          <ProcessingHistory 
            fileId={1} 
            apiBase={apiBase} 
            onDownload={mockOnDownload}
            history={[]}
            setHistory={mockSetHistory}
          />
        </ThemeProvider>
      )

      await waitFor(() => {
        expect(screen.getByText(/failed to load processing history/i)).toBeInTheDocument()
      })

      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })

    it('handles filter rules with special characters in values', async () => {
      const mockHistory = [
        {
          job_id: 1,
          processed_at: '2024-01-15T10:30:00Z',
          status: 'completed',
          deleted_rows: 5,
          filter_rules: [
            { column: 'F', value: "test'value" },
            { column: 'G', value: 'test"value' },
            { column: 'H', value: 'test&value' }
          ]
        }
      ]
      axios.get.mockResolvedValue({ data: { history: mockHistory } })
      
      render(
        <ThemeProvider theme={theme}>
          <ProcessingHistory 
            fileId={1} 
            apiBase={apiBase} 
            onDownload={mockOnDownload}
            history={mockHistory}
            setHistory={mockSetHistory}
          />
        </ThemeProvider>
      )

      await waitFor(() => {
        expect(screen.getByText(/filters applied/i)).toBeInTheDocument()
      })

      // Should display filter rules with special characters
      expect(screen.getByText(/F = 'test'value'/i)).toBeInTheDocument()
    })

    it('handles very long filter rules list', async () => {
      const manyRules = Array.from({ length: 20 }, (_, i) => ({
        column: String.fromCharCode(65 + i), // A, B, C, ...
        value: `value${i}`
      }))
      
      const mockHistory = [
        {
          job_id: 1,
          processed_at: '2024-01-15T10:30:00Z',
          status: 'completed',
          deleted_rows: 5,
          filter_rules: manyRules
        }
      ]
      axios.get.mockResolvedValue({ data: { history: mockHistory } })
      
      render(
        <ThemeProvider theme={theme}>
          <ProcessingHistory 
            fileId={1} 
            apiBase={apiBase} 
            onDownload={mockOnDownload}
            history={mockHistory}
            setHistory={mockSetHistory}
          />
        </ThemeProvider>
      )

      await waitFor(() => {
        expect(screen.getByText(/filters applied/i)).toBeInTheDocument()
      })

      // Should display all filter rules
      manyRules.forEach(rule => {
        expect(screen.getByText(new RegExp(`${rule.column} = '${rule.value}'`))).toBeInTheDocument()
      })
    })
  })
})
