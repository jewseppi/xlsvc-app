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
})
