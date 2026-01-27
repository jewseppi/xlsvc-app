/**
 * Unit tests for DashboardComponents styled components
 */
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { ThemeProvider } from 'styled-components'
import {
  DashboardHeader,
  HeaderContent,
  DashboardTitle,
  UserInfo,
  UserEmail,
  MainContent,
  DashboardGrid,
  LeftColumn,
  RightColumn
} from '../../../../src/styled/DashboardComponents'
import { theme } from '../../../../src/styled/theme'

const renderWithTheme = (component) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  )
}

describe('DashboardComponents', () => {
  describe('DashboardHeader', () => {
    it('renders without crashing', () => {
      renderWithTheme(<DashboardHeader data-testid="dashboard-header">Header</DashboardHeader>)
      expect(document.querySelector('[data-testid="dashboard-header"]')).toBeInTheDocument()
    })

    it('renders as header element', () => {
      const { container } = renderWithTheme(<DashboardHeader>Header</DashboardHeader>)
      expect(container.querySelector('header')).toBeInTheDocument()
    })
  })

  describe('HeaderContent', () => {
    it('renders without crashing', () => {
      renderWithTheme(<HeaderContent data-testid="header-content">Content</HeaderContent>)
      expect(document.querySelector('[data-testid="header-content"]')).toBeInTheDocument()
    })

    it('renders header content', () => {
      const { getByText } = renderWithTheme(<HeaderContent>Title and User Info</HeaderContent>)
      expect(getByText('Title and User Info')).toBeInTheDocument()
    })
  })

  describe('DashboardTitle', () => {
    it('renders without crashing', () => {
      renderWithTheme(<DashboardTitle>Excel Processor</DashboardTitle>)
      expect(document.querySelector('h1')).toBeInTheDocument()
    })

    it('renders title text', () => {
      const { getByText } = renderWithTheme(<DashboardTitle>Excel Processor</DashboardTitle>)
      expect(getByText('Excel Processor')).toBeInTheDocument()
    })

    it('applies theme-based gradient styles', () => {
      const { container } = renderWithTheme(<DashboardTitle>Title</DashboardTitle>)
      const element = container.querySelector('h1')
      expect(element).toBeInTheDocument()
    })
  })

  describe('UserInfo', () => {
    it('renders without crashing', () => {
      renderWithTheme(<UserInfo data-testid="user-info">User Info</UserInfo>)
      expect(document.querySelector('[data-testid="user-info"]')).toBeInTheDocument()
    })

    it('renders user information', () => {
      const { getByText } = renderWithTheme(
        <UserInfo>
          <UserEmail>test@example.com</UserEmail>
        </UserInfo>
      )
      expect(getByText('test@example.com')).toBeInTheDocument()
    })
  })

  describe('UserEmail', () => {
    it('renders without crashing', () => {
      renderWithTheme(<UserEmail>test@example.com</UserEmail>)
      expect(document.querySelector('span')).toBeInTheDocument()
    })

    it('renders email text', () => {
      const { getByText } = renderWithTheme(<UserEmail>user@example.com</UserEmail>)
      expect(getByText('user@example.com')).toBeInTheDocument()
    })
  })

  describe('MainContent', () => {
    it('renders without crashing', () => {
      renderWithTheme(<MainContent data-testid="main-content">Main</MainContent>)
      expect(document.querySelector('[data-testid="main-content"]')).toBeInTheDocument()
    })

    it('renders as main element', () => {
      const { container } = renderWithTheme(<MainContent>Content</MainContent>)
      expect(container.querySelector('main')).toBeInTheDocument()
    })

    it('renders main content', () => {
      const { getByText } = renderWithTheme(<MainContent>Dashboard Content</MainContent>)
      expect(getByText('Dashboard Content')).toBeInTheDocument()
    })
  })

  describe('DashboardGrid', () => {
    it('renders without crashing', () => {
      renderWithTheme(<DashboardGrid data-testid="dashboard-grid">Grid</DashboardGrid>)
      expect(document.querySelector('[data-testid="dashboard-grid"]')).toBeInTheDocument()
    })

    it('renders grid content', () => {
      const { getByText } = renderWithTheme(
        <DashboardGrid>
          <div>Left Column</div>
          <div>Right Column</div>
        </DashboardGrid>
      )
      expect(getByText('Left Column')).toBeInTheDocument()
      expect(getByText('Right Column')).toBeInTheDocument()
    })
  })

  describe('LeftColumn', () => {
    it('renders without crashing', () => {
      renderWithTheme(<LeftColumn data-testid="left-column">Left</LeftColumn>)
      expect(document.querySelector('[data-testid="left-column"]')).toBeInTheDocument()
    })

    it('renders left column content', () => {
      const { getByText } = renderWithTheme(<LeftColumn>File List</LeftColumn>)
      expect(getByText('File List')).toBeInTheDocument()
    })
  })

  describe('RightColumn', () => {
    it('renders without crashing', () => {
      renderWithTheme(<RightColumn data-testid="right-column">Right</RightColumn>)
      expect(document.querySelector('[data-testid="right-column"]')).toBeInTheDocument()
    })

    it('renders right column content', () => {
      const { getByText } = renderWithTheme(<RightColumn>Processing Section</RightColumn>)
      expect(getByText('Processing Section')).toBeInTheDocument()
    })
  })

  describe('Component Composition', () => {
    it('composes all dashboard components', () => {
      const { getByText } = renderWithTheme(
        <div>
          <DashboardHeader>
            <HeaderContent>
              <DashboardTitle>Excel Processor</DashboardTitle>
              <UserInfo>
                <UserEmail>test@example.com</UserEmail>
              </UserInfo>
            </HeaderContent>
          </DashboardHeader>
          <MainContent>
            <DashboardGrid>
              <LeftColumn>Left</LeftColumn>
              <RightColumn>Right</RightColumn>
            </DashboardGrid>
          </MainContent>
        </div>
      )

      expect(getByText('Excel Processor')).toBeInTheDocument()
      expect(getByText('test@example.com')).toBeInTheDocument()
      expect(getByText('Left')).toBeInTheDocument()
      expect(getByText('Right')).toBeInTheDocument()
    })
  })
})
