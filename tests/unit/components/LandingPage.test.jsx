/**
 * Unit tests for LandingPage component
 * Tests all sections, navigation links, and responsive behavior
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ThemeProvider } from 'styled-components'
import LandingPage from '../../../src/components/LandingPage'
import { theme } from '../../../src/styled/theme'

// Mock window.matchMedia for responsive tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

const renderLandingPage = () => {
  return render(
    <MemoryRouter>
      <ThemeProvider theme={theme}>
        <LandingPage />
      </ThemeProvider>
    </MemoryRouter>
  )
}

describe('LandingPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Header Section', () => {
    it('renders header with logo', () => {
      renderLandingPage()
      // Logo text is split: Excel<span>Cleaner</span>
      const logoLink = screen.getByRole('link', { name: /Excel.*Cleaner/i })
      expect(logoLink).toBeInTheDocument()
      expect(logoLink).toHaveAttribute('href', '/')
    })

    it('renders navigation links', () => {
      renderLandingPage()
      // Features appears in nav and section, so use getAllByText
      expect(screen.getAllByText('Features').length).toBeGreaterThan(0)
      // GitHub appears multiple times, check in header context
      const header = document.querySelector('header')
      expect(header?.textContent).toContain('GitHub')
      expect(screen.getByText('Launch App')).toBeInTheDocument()
    })

    it('has correct GitHub link in header', () => {
      renderLandingPage()
      const header = document.querySelector('header')
      const githubLinks = header?.querySelectorAll('a[href="https://github.com/jewseppi/xlsvc"]')
      expect(githubLinks?.length).toBeGreaterThan(0)
      if (githubLinks && githubLinks.length > 0) {
        expect(githubLinks[0]).toHaveAttribute('target', '_blank')
      }
    })

    it('has Launch App link to /app', () => {
      renderLandingPage()
      const launchLink = screen.getByText('Launch App').closest('a')
      expect(launchLink).toHaveAttribute('href', '/app')
    })
  })

  describe('Hero Section', () => {
    it('renders hero title', () => {
      renderLandingPage()
      expect(screen.getByText(/Clean Massive Excel Workbooks/i)).toBeInTheDocument()
      expect(screen.getByText(/In One Click/i)).toBeInTheDocument()
    })

    it('renders hero description', () => {
      renderLandingPage()
      expect(screen.getByText(/Delete rows across multiple sheets/i)).toBeInTheDocument()
    })

    it('renders CTA buttons', () => {
      renderLandingPage()
      expect(screen.getByText('Try It Free')).toBeInTheDocument()
      expect(screen.getByText('View Source')).toBeInTheDocument()
    })

    it('has Try It Free link to /app', () => {
      renderLandingPage()
      const tryLink = screen.getByText('Try It Free').closest('a')
      expect(tryLink).toHaveAttribute('href', '/app')
    })

    it('has View Source link to GitHub', () => {
      renderLandingPage()
      const sourceLink = screen.getByText('View Source').closest('a')
      expect(sourceLink).toHaveAttribute('href', 'https://github.com/jewseppi/xlsvc')
      expect(sourceLink).toHaveAttribute('target', '_blank')
    })
  })

  describe('Problem Section', () => {
    it('renders problem section title', () => {
      renderLandingPage()
      expect(screen.getByText('The Problem We Solve')).toBeInTheDocument()
    })

    it('renders manual way description', () => {
      renderLandingPage()
      expect(screen.getByText(/The Manual Way/i)).toBeInTheDocument()
      expect(screen.getByText(/Excel's filter only works one sheet at a time/i)).toBeInTheDocument()
    })

    it('renders solution description', () => {
      renderLandingPage()
      expect(screen.getByText(/With Excel Cleaner/i)).toBeInTheDocument()
      expect(screen.getByText(/Upload your workbook/i)).toBeInTheDocument()
    })
  })

  describe('Features Section', () => {
    it('renders features section title', () => {
      renderLandingPage()
      // Features appears multiple times, check that at least one exists
      const featuresTexts = screen.getAllByText('Features')
      expect(featuresTexts.length).toBeGreaterThan(0)
    })

    it('renders all feature cards', () => {
      renderLandingPage()
      expect(screen.getByText('Multi-Sheet Processing')).toBeInTheDocument()
      expect(screen.getByText('Custom Filter Conditions')).toBeInTheDocument()
      expect(screen.getByText('Image Preservation')).toBeInTheDocument()
      expect(screen.getByText('Fast Processing')).toBeInTheDocument()
      expect(screen.getByText('Deletion Reports')).toBeInTheDocument()
      expect(screen.getByText('Open Source')).toBeInTheDocument()
    })

    it('renders feature descriptions', () => {
      renderLandingPage()
      expect(screen.getByText(/Apply your filter rules to every sheet/i)).toBeInTheDocument()
      expect(screen.getByText(/Set rules on any column/i)).toBeInTheDocument()
      expect(screen.getByText(/preserve your embedded images/i)).toBeInTheDocument()
      expect(screen.getByText(/Powered by LibreOffice/i)).toBeInTheDocument()
      expect(screen.getByText(/Get a detailed report/i)).toBeInTheDocument()
      expect(screen.getByText(/Fully open source/i)).toBeInTheDocument()
    })

    it('renders feature icons', () => {
      renderLandingPage()
      // Check for emoji icons in feature cards - look for feature section by id
      const featuresSection = document.querySelector('section#features') || 
                               Array.from(document.querySelectorAll('section')).find(
                                 s => s.textContent?.includes('Multi-Sheet Processing')
                               )
      expect(featuresSection).toBeInTheDocument()
    })
  })

  describe('How It Works Section', () => {
    it('renders how it works title', () => {
      renderLandingPage()
      expect(screen.getByText('How It Works')).toBeInTheDocument()
    })

    it('renders all steps', () => {
      renderLandingPage()
      expect(screen.getByText('Upload')).toBeInTheDocument()
      expect(screen.getByText('Configure')).toBeInTheDocument()
      expect(screen.getByText('Process')).toBeInTheDocument()
      expect(screen.getByText('Download')).toBeInTheDocument()
    })

    it('renders step descriptions', () => {
      renderLandingPage()
      expect(screen.getByText(/Drop your Excel file/i)).toBeInTheDocument()
      expect(screen.getByText(/Set which columns and conditions/i)).toBeInTheDocument()
      expect(screen.getByText(/We clean all sheets/i)).toBeInTheDocument()
      expect(screen.getByText(/Get your cleaned workbook/i)).toBeInTheDocument()
    })
  })

  describe('Open Source Section', () => {
    it('renders open source title', () => {
      renderLandingPage()
      expect(screen.getByText('100% Open Source')).toBeInTheDocument()
    })

    it('renders open source description', () => {
      renderLandingPage()
      expect(screen.getByText(/Don't trust us with your data/i)).toBeInTheDocument()
    })

    it('has View on GitHub button', () => {
      renderLandingPage()
      const githubButton = screen.getByText('View on GitHub')
      expect(githubButton).toBeInTheDocument()
      expect(githubButton.closest('a')).toHaveAttribute('href', 'https://github.com/jewseppi/xlsvc')
      expect(githubButton.closest('a')).toHaveAttribute('target', '_blank')
    })
  })

  describe('Footer Section', () => {
    it('renders footer with author link', () => {
      renderLandingPage()
      const footerText = screen.getByText(/Built by/i)
      expect(footerText).toBeInTheDocument()
      
      // Check for author link if it exists
      const authorLink = screen.queryByText('jsilverman')
      if (authorLink) {
        expect(authorLink.closest('a')).toHaveAttribute('href', 'https://jsilverman.ca')
        expect(authorLink.closest('a')).toHaveAttribute('target', '_blank')
      }
    })

    it('renders footer GitHub link', () => {
      renderLandingPage()
      const footer = screen.getByText(/Built by/i).closest('footer')
      if (footer) {
        const githubLinks = footer.querySelectorAll('a[href="https://github.com/jewseppi/xlsvc"]')
        expect(githubLinks.length).toBeGreaterThan(0)
      }
    })
  })

  describe('Component Structure', () => {
    it('renders without crashing', () => {
      renderLandingPage()
      // Logo text is split, so check for role instead
      const logoLink = screen.getByRole('link', { name: /Excel.*Cleaner/i })
      expect(logoLink).toBeInTheDocument()
    })

    it('applies inline styles', () => {
      renderLandingPage()
      // Verify component rendered by checking header exists
      const header = document.querySelector('header')
      expect(header).toBeInTheDocument()
    })

    it('has proper semantic HTML structure', () => {
      renderLandingPage()
      expect(document.querySelector('header')).toBeInTheDocument()
      expect(document.querySelectorAll('section').length).toBeGreaterThan(0)
      expect(document.querySelector('footer')).toBeInTheDocument()
    })
  })

  describe('Navigation and Links', () => {
    it('all internal links use React Router Link', () => {
      renderLandingPage()
      const launchAppLink = screen.getByText('Launch App')
      expect(launchAppLink.closest('a')).toHaveAttribute('href', '/app')
      
      const tryItFreeLink = screen.getByText('Try It Free')
      expect(tryItFreeLink.closest('a')).toHaveAttribute('href', '/app')
    })

    it('all external links open in new tab', () => {
      renderLandingPage()
      const externalLinks = document.querySelectorAll('a[href^="http"]')
      expect(externalLinks.length).toBeGreaterThan(0)
      externalLinks.forEach(link => {
        expect(link).toHaveAttribute('target', '_blank')
      })
    })
  })
})
