/**
 * Unit tests for FileComponents styled components
 */
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { ThemeProvider } from 'styled-components'
import {
  FileList,
  FileItem,
  FileInfo,
  FileIcon,
  FileDetails,
  FileMeta,
  FileName,
  Badge
} from '../../../../src/styled/FileComponents'
import { theme } from '../../../../src/styled/theme'

const renderWithTheme = (component) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  )
}

describe('FileComponents', () => {
  describe('FileList', () => {
    it('renders without crashing', () => {
      renderWithTheme(<FileList data-testid="file-list">Files</FileList>)
      expect(document.querySelector('[data-testid="file-list"]')).toBeInTheDocument()
    })

    it('renders file list content', () => {
      const { getByText } = renderWithTheme(
        <FileList>
          <div>File 1</div>
          <div>File 2</div>
        </FileList>
      )
      expect(getByText('File 1')).toBeInTheDocument()
      expect(getByText('File 2')).toBeInTheDocument()
    })
  })

  describe('FileItem', () => {
    it('renders without crashing', () => {
      renderWithTheme(<FileItem data-testid="file-item">File</FileItem>)
      expect(document.querySelector('[data-testid="file-item"]')).toBeInTheDocument()
    })

    it('renders file item content', () => {
      const { getByText } = renderWithTheme(
        <FileItem>test-file.xlsx</FileItem>
      )
      expect(getByText('test-file.xlsx')).toBeInTheDocument()
    })

    it('applies selected prop styling', () => {
      const { container } = renderWithTheme(
        <FileItem selected data-testid="selected-file">File</FileItem>
      )
      const element = container.querySelector('[data-testid="selected-file"]')
      expect(element).toBeInTheDocument()
    })

    it('applies onClick cursor styling', () => {
      const { container } = renderWithTheme(
        <FileItem onClick={() => {}} data-testid="clickable-file">File</FileItem>
      )
      const element = container.querySelector('[data-testid="clickable-file"]')
      expect(element).toBeInTheDocument()
    })
  })

  describe('FileInfo', () => {
    it('renders without crashing', () => {
      renderWithTheme(<FileInfo data-testid="file-info">Info</FileInfo>)
      expect(document.querySelector('[data-testid="file-info"]')).toBeInTheDocument()
    })

    it('renders file information', () => {
      const { getByText } = renderWithTheme(
        <FileInfo>
          <FileIcon>XLS</FileIcon>
          <FileDetails>Details</FileDetails>
        </FileInfo>
      )
      expect(getByText('XLS')).toBeInTheDocument()
      expect(getByText('Details')).toBeInTheDocument()
    })
  })

  describe('FileIcon', () => {
    it('renders without crashing', () => {
      renderWithTheme(<FileIcon data-testid="file-icon">XLS</FileIcon>)
      expect(document.querySelector('[data-testid="file-icon"]')).toBeInTheDocument()
    })

    it('renders icon text', () => {
      const { getByText } = renderWithTheme(<FileIcon>XLS</FileIcon>)
      expect(getByText('XLS')).toBeInTheDocument()
    })

    it('applies theme-based gradient background', () => {
      const { container } = renderWithTheme(<FileIcon>XLS</FileIcon>)
      const element = container.querySelector('div')
      expect(element).toBeInTheDocument()
    })
  })

  describe('FileDetails', () => {
    it('renders without crashing', () => {
      renderWithTheme(<FileDetails data-testid="file-details">Details</FileDetails>)
      expect(document.querySelector('[data-testid="file-details"]')).toBeInTheDocument()
    })

    it('renders file details with h4', () => {
      const { container } = renderWithTheme(
        <FileDetails>
          <h4>File Name</h4>
          <FileMeta>50 KB • Uploaded 1/15/2024</FileMeta>
        </FileDetails>
      )
      expect(container.querySelector('h4')).toBeInTheDocument()
    })
  })

  describe('FileMeta', () => {
    it('renders without crashing', () => {
      renderWithTheme(<FileMeta data-testid="file-meta">Meta</FileMeta>)
      expect(document.querySelector('[data-testid="file-meta"]')).toBeInTheDocument()
    })

    it('renders as paragraph element', () => {
      const { container } = renderWithTheme(<FileMeta>50 KB • Uploaded</FileMeta>)
      expect(container.querySelector('p')).toBeInTheDocument()
    })

    it('renders meta information', () => {
      const { getByText } = renderWithTheme(
        <FileMeta>50 KB • Uploaded 1/15/2024</FileMeta>
      )
      expect(getByText(/50 KB/i)).toBeInTheDocument()
    })
  })

  describe('FileName', () => {
    it('renders without crashing', () => {
      renderWithTheme(<FileName data-testid="file-name">test.xlsx</FileName>)
      expect(document.querySelector('[data-testid="file-name"]')).toBeInTheDocument()
    })

    it('renders file name text', () => {
      const { getByText } = renderWithTheme(
        <FileName title="test-file.xlsx">test-file.xlsx</FileName>
      )
      expect(getByText('test-file.xlsx')).toBeInTheDocument()
    })

    it('applies title attribute for tooltip', () => {
      const { container } = renderWithTheme(
        <FileName title="long-file-name.xlsx">long-file-name.xlsx</FileName>
      )
      const element = container.querySelector('div')
      expect(element).toHaveAttribute('title', 'long-file-name.xlsx')
    })
  })

  describe('Badge', () => {
    it('renders without crashing', () => {
      renderWithTheme(<Badge data-testid="badge">Processed</Badge>)
      expect(document.querySelector('[data-testid="badge"]')).toBeInTheDocument()
    })

    it('renders as span element', () => {
      const { container } = renderWithTheme(<Badge>Status</Badge>)
      expect(container.querySelector('span')).toBeInTheDocument()
    })

    it('renders badge text', () => {
      const { getByText } = renderWithTheme(<Badge>Processed</Badge>)
      expect(getByText('Processed')).toBeInTheDocument()
    })

    it('applies success theme colors', () => {
      const { container } = renderWithTheme(<Badge>Success</Badge>)
      const element = container.querySelector('span')
      expect(element).toBeInTheDocument()
    })
  })

  describe('Component Composition', () => {
    it('composes all file components', () => {
      const { getByText } = renderWithTheme(
        <FileList>
          <FileItem>
            <FileInfo>
              <FileIcon>XLS</FileIcon>
              <FileDetails>
                <FileName title="test.xlsx">test.xlsx</FileName>
                <FileMeta>50 KB • Uploaded</FileMeta>
              </FileDetails>
            </FileInfo>
            <Badge>Processed</Badge>
          </FileItem>
        </FileList>
      )

      expect(getByText('XLS')).toBeInTheDocument()
      expect(getByText('test.xlsx')).toBeInTheDocument()
      expect(getByText(/50 KB/i)).toBeInTheDocument()
      expect(getByText('Processed')).toBeInTheDocument()
    })
  })
})
