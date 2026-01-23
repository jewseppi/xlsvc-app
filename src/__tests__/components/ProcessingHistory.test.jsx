/**
 * Unit tests for ProcessingHistory component
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { ThemeProvider } from 'styled-components'
import ProcessingHistory from '../../components/ProcessingHistory'
import { theme } from '../../styled/theme'
import axios from 'axios'

vi.mock('axios')
vi.mock('../../styled/theme', () => ({
  theme: {
    spacing: { xs: '0.25rem', sm: '0.5rem', md: '1rem', lg: '1.5rem', xl: '2rem' },
    colors: {
      background: { primary: '#fff', secondary: '#f5f5f5' },
      text: { primary: '#000', secondary: '#666' },
      border: { primary: '#ddd', secondary: '#aaa' },
      accent: { primary: '#007bff' }
    },
    borderRadius: { md: '4px', lg: '8px' },
    transitions: { normal: '0.2s' }
  }
}))

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

  it('shows loading state initially', () => {
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

    expect(screen.getByText(/loading processing history/i)).toBeInTheDocument()
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
    
    const { rerender } = render(
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
      expect(mockSetHistory).toHaveBeenCalledWith(mockHistory)
    })

    // Rerender with history prop
    rerender(
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
      expect(screen.getByText('5')).toBeInTheDocument()
    })
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
    
    const { rerender } = render(
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
      expect(mockSetHistory).toHaveBeenCalled()
    })

    rerender(
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
    
    const { rerender } = render(
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
      expect(mockSetHistory).toHaveBeenCalled()
    })

    rerender(
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
      expect(screen.getByText(/failed/i)).toBeInTheDocument()
      expect(screen.getByText(/processing failed/i)).toBeInTheDocument()
    })
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
    
    const { rerender } = render(
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
      expect(mockSetHistory).toHaveBeenCalled()
    })

    rerender(
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
    
    const { rerender } = render(
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
      expect(mockSetHistory).toHaveBeenCalled()
    })

    rerender(
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
      expect(screen.getByText("F = '0'")).toBeInTheDocument()
      expect(screen.getByText("G = '0'")).toBeInTheDocument()
    })
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
    
    const { rerender } = render(
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
      expect(mockSetHistory).toHaveBeenCalled()
    })

    rerender(
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
    
    const { rerender } = render(
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
      expect(mockSetHistory).toHaveBeenCalled()
    })

    rerender(
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
      const downloadButton = screen.getByText(/download processed file/i)
      fireEvent.click(downloadButton)
      expect(mockOnDownload).toHaveBeenCalledWith(10, 'processed.xlsx')
    })
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
    
    const { rerender } = render(
      <ThemeProvider theme={theme}>
        <ProcessingHistory 
          fileId={1} 
          apiBase={apiBase} 
          onDownload={mockOnDownload}
          history={[]}
          setHistory={mockSetHistory}
          isAdmin={true}
        />
      </ThemeProvider>
    )

    await waitFor(() => {
      expect(mockSetHistory).toHaveBeenCalled()
    })

    rerender(
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
    
    const { rerender } = render(
      <ThemeProvider theme={theme}>
        <ProcessingHistory 
          fileId={1} 
          apiBase={apiBase} 
          onDownload={mockOnDownload}
          history={[]}
          setHistory={mockSetHistory}
          isAdmin={false}
        />
      </ThemeProvider>
    )

    await waitFor(() => {
      expect(mockSetHistory).toHaveBeenCalled()
    })

    rerender(
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
