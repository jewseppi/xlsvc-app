/**
 * Unit tests for ProcessingComponents styled components
 */
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { ThemeProvider } from 'styled-components'
import {
  ProcessingSection,
  SelectedFileInfo,
  ProcessDescription,
  ProcessingLog,
  LogEntry,
  DownloadSection,
  DownloadGrid,
  DownloadCard
} from '../../../src/styled/ProcessingComponents'
import { theme } from '../../../src/styled/theme'

const renderWithTheme = (component) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  )
}

describe('ProcessingComponents', () => {
  describe('ProcessingSection', () => {
    it('renders without crashing', () => {
      renderWithTheme(<ProcessingSection data-testid="processing-section">Section</ProcessingSection>)
      expect(document.querySelector('[data-testid="processing-section"]')).toBeInTheDocument()
    })

    it('renders processing section content', () => {
      const { getByText } = renderWithTheme(
        <ProcessingSection>Processing Controls</ProcessingSection>
      )
      expect(getByText('Processing Controls')).toBeInTheDocument()
    })
  })

  describe('SelectedFileInfo', () => {
    it('renders without crashing', () => {
      renderWithTheme(<SelectedFileInfo data-testid="file-info">File Info</SelectedFileInfo>)
      expect(document.querySelector('[data-testid="file-info"]')).toBeInTheDocument()
    })

    it('renders selected file information', () => {
      const { getByText } = renderWithTheme(
        <SelectedFileInfo>test-file.xlsx selected</SelectedFileInfo>
      )
      expect(getByText('test-file.xlsx selected')).toBeInTheDocument()
    })
  })

  describe('ProcessDescription', () => {
    it('renders without crashing', () => {
      renderWithTheme(<ProcessDescription>Description</ProcessDescription>)
      expect(document.querySelector('p')).toBeInTheDocument()
    })

    it('renders as paragraph element', () => {
      const { container } = renderWithTheme(
        <ProcessDescription>Define which columns to check</ProcessDescription>
      )
      expect(container.querySelector('p')).toBeInTheDocument()
    })

    it('renders description text', () => {
      const { getByText } = renderWithTheme(
        <ProcessDescription>Define which columns to check and what conditions to apply</ProcessDescription>
      )
      expect(getByText('Define which columns to check and what conditions to apply')).toBeInTheDocument()
    })
  })

  describe('ProcessingLog', () => {
    it('renders without crashing', () => {
      renderWithTheme(<ProcessingLog data-testid="processing-log">Log</ProcessingLog>)
      expect(document.querySelector('[data-testid="processing-log"]')).toBeInTheDocument()
    })

    it('renders log content', () => {
      const { getByText } = renderWithTheme(
        <ProcessingLog>
          <LogEntry>Processing started...</LogEntry>
        </ProcessingLog>
      )
      expect(getByText('Processing started...')).toBeInTheDocument()
    })

    it('applies monospace font family', () => {
      const { container } = renderWithTheme(<ProcessingLog>Log</ProcessingLog>)
      const element = container.querySelector('div')
      expect(element).toBeInTheDocument()
    })
  })

  describe('LogEntry', () => {
    it('renders without crashing', () => {
      renderWithTheme(<LogEntry data-testid="log-entry">Entry</LogEntry>)
      expect(document.querySelector('[data-testid="log-entry"]')).toBeInTheDocument()
    })

    it('renders log entry text', () => {
      const { getByText } = renderWithTheme(
        <LogEntry>Processing row 1 of 100</LogEntry>
      )
      expect(getByText('Processing row 1 of 100')).toBeInTheDocument()
    })

    it('applies error prop styling', () => {
      const { container } = renderWithTheme(
        <LogEntry error data-testid="error-entry">Error occurred</LogEntry>
      )
      const element = container.querySelector('[data-testid="error-entry"]')
      expect(element).toBeInTheDocument()
    })

    it('renders multiple log entries', () => {
      const { getByText } = renderWithTheme(
        <ProcessingLog>
          <LogEntry>Entry 1</LogEntry>
          <LogEntry>Entry 2</LogEntry>
          <LogEntry>Entry 3</LogEntry>
        </ProcessingLog>
      )
      expect(getByText('Entry 1')).toBeInTheDocument()
      expect(getByText('Entry 2')).toBeInTheDocument()
      expect(getByText('Entry 3')).toBeInTheDocument()
    })
  })

  describe('DownloadSection', () => {
    it('renders without crashing', () => {
      renderWithTheme(<DownloadSection data-testid="download-section">Download</DownloadSection>)
      expect(document.querySelector('[data-testid="download-section"]')).toBeInTheDocument()
    })

    it('renders download section with h4', () => {
      const { container } = renderWithTheme(
        <DownloadSection>
          <h4>Download Files</h4>
          <p>Your processed files are ready</p>
        </DownloadSection>
      )
      expect(container.querySelector('h4')).toBeInTheDocument()
    })
  })

  describe('DownloadGrid', () => {
    it('renders without crashing', () => {
      renderWithTheme(<DownloadGrid data-testid="download-grid">Grid</DownloadGrid>)
      expect(document.querySelector('[data-testid="download-grid"]')).toBeInTheDocument()
    })

    it('renders grid content', () => {
      const { getByText } = renderWithTheme(
        <DownloadGrid>
          <DownloadCard>Card 1</DownloadCard>
          <DownloadCard>Card 2</DownloadCard>
        </DownloadGrid>
      )
      expect(getByText('Card 1')).toBeInTheDocument()
      expect(getByText('Card 2')).toBeInTheDocument()
    })
  })

  describe('DownloadCard', () => {
    it('renders without crashing', () => {
      renderWithTheme(<DownloadCard data-testid="download-card">Card</DownloadCard>)
      expect(document.querySelector('[data-testid="download-card"]')).toBeInTheDocument()
    })

    it('renders download card with h5', () => {
      const { container } = renderWithTheme(
        <DownloadCard>
          <h5>Macro File</h5>
          <p>Download the generated macro</p>
        </DownloadCard>
      )
      expect(container.querySelector('h5')).toBeInTheDocument()
    })

    it('renders card content', () => {
      const { getByText } = renderWithTheme(
        <DownloadCard>
          <h5>Instructions</h5>
          <p>Download instructions file</p>
        </DownloadCard>
      )
      expect(getByText('Instructions')).toBeInTheDocument()
      expect(getByText('Download instructions file')).toBeInTheDocument()
    })
  })

  describe('Component Composition', () => {
    it('composes all processing components', () => {
      const { getByText } = renderWithTheme(
        <ProcessingSection>
          <SelectedFileInfo>test.xlsx</SelectedFileInfo>
          <ProcessDescription>Define columns to check</ProcessDescription>
          <ProcessingLog>
            <LogEntry>Processing...</LogEntry>
          </ProcessingLog>
          <DownloadSection>
            <h4>Downloads</h4>
            <DownloadGrid>
              <DownloadCard>
                <h5>File</h5>
              </DownloadCard>
            </DownloadGrid>
          </DownloadSection>
        </ProcessingSection>
      )

      expect(getByText('test.xlsx')).toBeInTheDocument()
      expect(getByText('Define columns to check')).toBeInTheDocument()
      expect(getByText('Processing...')).toBeInTheDocument()
      expect(getByText('Downloads')).toBeInTheDocument()
      expect(getByText('File')).toBeInTheDocument()
    })
  })
})
