/**
 * Unit tests for GeneratedFiles component
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { ThemeProvider } from 'styled-components'
import GeneratedFiles from '../../components/GeneratedFiles'
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
    borderRadius: { md: '4px', lg: '8px' }
  }
}))

describe('GeneratedFiles', () => {
  const mockOnDownload = vi.fn()
  const apiBase = 'http://localhost:5000/api'

  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.setItem('token', 'test-token')
  })

  it('shows loading state initially', () => {
    axios.get.mockResolvedValue({ data: { macros: [], instructions: [], reports: [], processed: [] } })
    
    render(
      <ThemeProvider theme={theme}>
        <GeneratedFiles fileId={1} apiBase={apiBase} onDownload={mockOnDownload} />
      </ThemeProvider>
    )

    expect(screen.getByText(/loading generated files/i)).toBeInTheDocument()
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
      expect(screen.getByText(/macros/i)).toBeInTheDocument()
      expect(screen.getByText('macro1.bas')).toBeInTheDocument()
      expect(screen.getByText('macro2.bas')).toBeInTheDocument()
    })

    expect(axios.get).toHaveBeenCalledWith(
      `${apiBase}/files/1/generated`,
      { headers: { Authorization: 'Bearer test-token' } }
    )
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
      expect(screen.getByText(/instructions/i)).toBeInTheDocument()
      expect(screen.getByText('instructions1.txt')).toBeInTheDocument()
      expect(screen.getByText('instructions2.txt')).toBeInTheDocument()
    })
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
      expect(screen.getByText(/deletion reports/i)).toBeInTheDocument()
      expect(screen.getByText('report1.json')).toBeInTheDocument()
    })
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
      expect(screen.getByText(/processed files/i)).toBeInTheDocument()
      expect(screen.getByText('processed1.xlsx')).toBeInTheDocument()
    })
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
      const downloadButton = screen.getByText('Download')
      downloadButton.click()
      expect(mockOnDownload).toHaveBeenCalledWith(1, 'macro1.bas')
    })
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
})
