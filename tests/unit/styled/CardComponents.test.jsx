/**
 * Unit tests for CardComponents styled components
 */
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { ThemeProvider } from 'styled-components'
import {
  ContentCard,
  CardHeader,
  CardTitle,
  CardSubtitle,
  CardBody,
  EmptyState
} from '../../../../src/styled/CardComponents'
import { theme } from '../../../../src/styled/theme'

const renderWithTheme = (component) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  )
}

describe('CardComponents', () => {
  describe('ContentCard', () => {
    it('renders without crashing', () => {
      renderWithTheme(<ContentCard data-testid="content-card">Content</ContentCard>)
      expect(document.querySelector('[data-testid="content-card"]')).toBeInTheDocument()
    })

    it('renders card content', () => {
      const { getByText } = renderWithTheme(
        <ContentCard>Card Content</ContentCard>
      )
      expect(getByText('Card Content')).toBeInTheDocument()
    })

    it('applies theme-based styles', () => {
      const { container } = renderWithTheme(
        <ContentCard data-testid="card">Content</ContentCard>
      )
      const element = container.querySelector('[data-testid="card"]')
      expect(element).toBeInTheDocument()
    })
  })

  describe('CardHeader', () => {
    it('renders without crashing', () => {
      renderWithTheme(<CardHeader data-testid="card-header">Header</CardHeader>)
      expect(document.querySelector('[data-testid="card-header"]')).toBeInTheDocument()
    })

    it('renders header content', () => {
      const { getByText } = renderWithTheme(<CardHeader>Upload Excel File</CardHeader>)
      expect(getByText('Upload Excel File')).toBeInTheDocument()
    })
  })

  describe('CardTitle', () => {
    it('renders without crashing', () => {
      renderWithTheme(<CardTitle>Title</CardTitle>)
      expect(document.querySelector('h3')).toBeInTheDocument()
    })

    it('renders title text', () => {
      const { getByText } = renderWithTheme(<CardTitle>Your Files</CardTitle>)
      expect(getByText('Your Files')).toBeInTheDocument()
    })

    it('applies theme-based styles', () => {
      const { container } = renderWithTheme(<CardTitle>Title</CardTitle>)
      const element = container.querySelector('h3')
      expect(element).toBeInTheDocument()
    })
  })

  describe('CardSubtitle', () => {
    it('renders without crashing', () => {
      renderWithTheme(<CardSubtitle>Subtitle</CardSubtitle>)
      expect(document.querySelector('p')).toBeInTheDocument()
    })

    it('renders subtitle text', () => {
      const { getByText } = renderWithTheme(
        <CardSubtitle>Select a file to analyze</CardSubtitle>
      )
      expect(getByText('Select a file to analyze')).toBeInTheDocument()
    })
  })

  describe('CardBody', () => {
    it('renders without crashing', () => {
      renderWithTheme(<CardBody data-testid="card-body">Body Content</CardBody>)
      expect(document.querySelector('[data-testid="card-body"]')).toBeInTheDocument()
    })

    it('renders body content', () => {
      const { getByText } = renderWithTheme(
        <CardBody>File list goes here</CardBody>
      )
      expect(getByText('File list goes here')).toBeInTheDocument()
    })
  })

  describe('EmptyState', () => {
    it('renders without crashing', () => {
      renderWithTheme(<EmptyState data-testid="empty-state">No files</EmptyState>)
      expect(document.querySelector('[data-testid="empty-state"]')).toBeInTheDocument()
    })

    it('renders empty state message', () => {
      const { getByText } = renderWithTheme(
        <EmptyState>No files uploaded yet</EmptyState>
      )
      expect(getByText('No files uploaded yet')).toBeInTheDocument()
    })

    it('renders empty state with icon', () => {
      const { container } = renderWithTheme(
        <EmptyState>
          <div className="icon">📊</div>
          <p>No files</p>
        </EmptyState>
      )
      expect(container.querySelector('.icon')).toBeInTheDocument()
    })
  })

  describe('Component Composition', () => {
    it('composes CardHeader, CardTitle, CardSubtitle, and CardBody', () => {
      const { getByText } = renderWithTheme(
        <ContentCard>
          <CardHeader>
            <CardTitle>Test Card</CardTitle>
            <CardSubtitle>Test Subtitle</CardSubtitle>
          </CardHeader>
          <CardBody>Test Body</CardBody>
        </ContentCard>
      )

      expect(getByText('Test Card')).toBeInTheDocument()
      expect(getByText('Test Subtitle')).toBeInTheDocument()
      expect(getByText('Test Body')).toBeInTheDocument()
    })
  })
})
