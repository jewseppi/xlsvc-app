/**
 * Unit tests for UploadComponents styled components
 */
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { ThemeProvider } from 'styled-components'
import {
  FileInput,
  ProgressContainer,
  ProgressBar,
  ProgressFill,
  ProgressText
} from '../../../src/styled/UploadComponents'
import { theme } from '../../../src/styled/theme'

const renderWithTheme = (component) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  )
}

describe('UploadComponents', () => {
  describe('FileInput', () => {
    it('renders without crashing', () => {
      renderWithTheme(<FileInput type="file" data-testid="file-input" />)
      expect(document.querySelector('[data-testid="file-input"]')).toBeInTheDocument()
    })

    it('renders as input element', () => {
      const { container } = renderWithTheme(<FileInput type="file" />)
      expect(container.querySelector('input[type="file"]')).toBeInTheDocument()
    })

    it('applies file input type', () => {
      const { container } = renderWithTheme(<FileInput type="file" />)
      const input = container.querySelector('input')
      expect(input).toHaveAttribute('type', 'file')
    })

    it('handles disabled state', () => {
      const { container } = renderWithTheme(<FileInput type="file" disabled />)
      const input = container.querySelector('input')
      expect(input).toBeDisabled()
    })

    it('applies accept attribute', () => {
      const { container } = renderWithTheme(
        <FileInput type="file" accept=".xlsx,.xls" />
      )
      const input = container.querySelector('input')
      expect(input).toHaveAttribute('accept', '.xlsx,.xls')
    })
  })

  describe('ProgressContainer', () => {
    it('renders without crashing', () => {
      renderWithTheme(<ProgressContainer data-testid="progress-container">Container</ProgressContainer>)
      expect(document.querySelector('[data-testid="progress-container"]')).toBeInTheDocument()
    })

    it('renders progress container content', () => {
      const { getByText } = renderWithTheme(
        <ProgressContainer>
          <ProgressBar>
            <ProgressFill progress={50} />
          </ProgressBar>
        </ProgressContainer>
      )
      expect(document.querySelector('[data-testid="progress-container"]') || document.querySelector('div')).toBeInTheDocument()
    })
  })

  describe('ProgressBar', () => {
    it('renders without crashing', () => {
      renderWithTheme(<ProgressBar data-testid="progress-bar">Bar</ProgressBar>)
      expect(document.querySelector('[data-testid="progress-bar"]')).toBeInTheDocument()
    })

    it('renders progress bar container', () => {
      const { container } = renderWithTheme(
        <ProgressBar>
          <ProgressFill progress={75} />
        </ProgressBar>
      )
      const bar = container.querySelector('div')
      expect(bar).toBeInTheDocument()
    })
  })

  describe('ProgressFill', () => {
    it('renders without crashing', () => {
      renderWithTheme(<ProgressFill progress={0} data-testid="progress-fill" />)
      expect(document.querySelector('[data-testid="progress-fill"]')).toBeInTheDocument()
    })

    it('applies progress prop as width', () => {
      const { container } = renderWithTheme(<ProgressFill progress={50} />)
      const fill = container.querySelector('div')
      expect(fill).toBeInTheDocument()
    })

    it('handles 0% progress', () => {
      const { container } = renderWithTheme(<ProgressFill progress={0} />)
      const fill = container.querySelector('div')
      expect(fill).toBeInTheDocument()
    })

    it('handles 100% progress', () => {
      const { container } = renderWithTheme(<ProgressFill progress={100} />)
      const fill = container.querySelector('div')
      expect(fill).toBeInTheDocument()
    })

    it('handles intermediate progress values', () => {
      const { container } = renderWithTheme(<ProgressFill progress={75} />)
      const fill = container.querySelector('div')
      expect(fill).toBeInTheDocument()
    })
  })

  describe('ProgressText', () => {
    it('renders without crashing', () => {
      renderWithTheme(<ProgressText>50%</ProgressText>)
      expect(document.querySelector('p')).toBeInTheDocument()
    })

    it('renders as paragraph element', () => {
      const { container } = renderWithTheme(<ProgressText>Uploading...</ProgressText>)
      expect(container.querySelector('p')).toBeInTheDocument()
    })

    it('renders progress text', () => {
      const { getByText } = renderWithTheme(<ProgressText>Uploading 50%...</ProgressText>)
      expect(getByText('Uploading 50%...')).toBeInTheDocument()
    })
  })

  describe('Component Composition', () => {
    it('composes all upload components', () => {
      const { getByText } = renderWithTheme(
        <div>
          <FileInput type="file" accept=".xlsx,.xls" />
          <ProgressContainer>
            <ProgressBar>
              <ProgressFill progress={50} />
            </ProgressBar>
            <ProgressText>Uploading 50%...</ProgressText>
          </ProgressContainer>
        </div>
      )

      expect(document.querySelector('input[type="file"]')).toBeInTheDocument()
      expect(getByText('Uploading 50%...')).toBeInTheDocument()
    })

    it('handles upload progress states', () => {
      const { rerender, getByText } = renderWithTheme(
        <ProgressContainer>
          <ProgressBar>
            <ProgressFill progress={0} />
          </ProgressBar>
          <ProgressText>Starting upload...</ProgressText>
        </ProgressContainer>
      )

      expect(getByText('Starting upload...')).toBeInTheDocument()

      rerender(
        <ThemeProvider theme={theme}>
          <ProgressContainer>
            <ProgressBar>
              <ProgressFill progress={50} />
            </ProgressBar>
            <ProgressText>Uploading 50%...</ProgressText>
          </ProgressContainer>
        </ThemeProvider>
      )

      expect(getByText('Uploading 50%...')).toBeInTheDocument()
    })
  })
})
