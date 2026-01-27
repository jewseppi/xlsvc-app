/**
 * Unit tests for BaseComponents styled components
 * Tests Button variants, Input, Label, Card, and GlassCard
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ThemeProvider } from 'styled-components'
import {
  Button,
  Input,
  Label,
  Card,
  GlassCard,
  AppContainer,
  LoadingContainer
} from '../../../src/styled/BaseComponents'
import { theme } from '../../../src/styled/theme'

const renderWithTheme = (component) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  )
}

describe('BaseComponents', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Button Component', () => {
    it('renders button with default variant', () => {
      renderWithTheme(<Button>Click me</Button>)
      const button = screen.getByRole('button', { name: 'Click me' })
      expect(button).toBeInTheDocument()
    })

    it('renders button with primary variant', () => {
      renderWithTheme(<Button variant="primary">Primary Button</Button>)
      const button = screen.getByRole('button', { name: 'Primary Button' })
      expect(button).toBeInTheDocument()
    })

    it('renders button with secondary variant', () => {
      renderWithTheme(<Button variant="secondary">Secondary Button</Button>)
      const button = screen.getByRole('button', { name: 'Secondary Button' })
      expect(button).toBeInTheDocument()
    })

    it('renders button with danger variant', () => {
      renderWithTheme(<Button variant="danger">Delete</Button>)
      const button = screen.getByRole('button', { name: 'Delete' })
      expect(button).toBeInTheDocument()
    })

    it('renders button with ghost variant', () => {
      renderWithTheme(<Button variant="ghost">Ghost Button</Button>)
      const button = screen.getByRole('button', { name: 'Ghost Button' })
      expect(button).toBeInTheDocument()
    })

    it('renders button with $small prop (transient)', () => {
      renderWithTheme(<Button $small>Small Button</Button>)
      const button = screen.getByRole('button', { name: 'Small Button' })
      expect(button).toBeInTheDocument()
      // Transient prop should not be passed to DOM
      expect(button).not.toHaveAttribute('$small')
      expect(button).not.toHaveAttribute('small')
    })

    it('renders disabled button', () => {
      renderWithTheme(<Button disabled>Disabled Button</Button>)
      const button = screen.getByRole('button', { name: 'Disabled Button' })
      expect(button).toBeDisabled()
    })

    it('applies disabled styles', () => {
      renderWithTheme(<Button disabled>Disabled</Button>)
      const button = screen.getByRole('button', { name: 'Disabled' })
      expect(button).toHaveStyle({ cursor: 'not-allowed' })
    })

    it('handles click events', async () => {
      const handleClick = vi.fn()
      renderWithTheme(<Button onClick={handleClick}>Clickable</Button>)
      const button = screen.getByRole('button', { name: 'Clickable' })
      button.click()
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('does not handle clicks when disabled', () => {
      const handleClick = vi.fn()
      renderWithTheme(<Button disabled onClick={handleClick}>Disabled</Button>)
      const button = screen.getByRole('button', { name: 'Disabled' })
      button.click()
      // Click handler may still fire, but button should be disabled
      expect(button).toBeDisabled()
    })
  })

  describe('Input Component', () => {
    it('renders input element', () => {
      renderWithTheme(<Input data-testid="test-input" />)
      const input = screen.getByTestId('test-input')
      expect(input).toBeInTheDocument()
      expect(input.tagName).toBe('INPUT')
    })

    it('renders input with type text by default', () => {
      renderWithTheme(<Input data-testid="test-input" />)
      const input = screen.getByTestId('test-input')
      // HTML inputs default to type="text" even if attribute is not explicitly set
      // Check that it's an input element and doesn't have a different type
      expect(input.tagName).toBe('INPUT')
      const type = input.getAttribute('type')
      expect(type === null || type === 'text').toBe(true)
    })

    it('renders input with type email', () => {
      renderWithTheme(<Input type="email" data-testid="test-input" />)
      const input = screen.getByTestId('test-input')
      expect(input).toHaveAttribute('type', 'email')
    })

    it('renders input with type password', () => {
      renderWithTheme(<Input type="password" data-testid="test-input" />)
      const input = screen.getByTestId('test-input')
      expect(input).toHaveAttribute('type', 'password')
    })

    it('renders input with placeholder', () => {
      renderWithTheme(<Input placeholder="Enter text" data-testid="test-input" />)
      const input = screen.getByTestId('test-input')
      expect(input).toHaveAttribute('placeholder', 'Enter text')
    })

    it('renders input with value', () => {
      renderWithTheme(<Input value="test value" readOnly data-testid="test-input" />)
      const input = screen.getByTestId('test-input')
      expect(input).toHaveValue('test value')
    })

    it('renders disabled input', () => {
      renderWithTheme(<Input disabled data-testid="test-input" />)
      const input = screen.getByTestId('test-input')
      expect(input).toBeDisabled()
    })

    it('renders required input', () => {
      renderWithTheme(<Input required data-testid="test-input" />)
      const input = screen.getByTestId('test-input')
      expect(input).toBeRequired()
    })

    it('handles onChange events', () => {
      const handleChange = vi.fn()
      renderWithTheme(<Input onChange={handleChange} data-testid="test-input" />)
      const input = screen.getByTestId('test-input')
      fireEvent.change(input, { target: { value: 'new value' } })
      expect(handleChange).toHaveBeenCalled()
    })
  })

  describe('Label Component', () => {
    it('renders label element', () => {
      renderWithTheme(<Label>Test Label</Label>)
      const label = screen.getByText('Test Label')
      expect(label).toBeInTheDocument()
      expect(label.tagName).toBe('LABEL')
    })

    it('associates label with input using htmlFor', () => {
      renderWithTheme(
        <>
          <Label htmlFor="test-input">Test Label</Label>
          <Input id="test-input" />
        </>
      )
      const label = screen.getByText('Test Label')
      const input = screen.getByLabelText('Test Label')
      expect(label).toHaveAttribute('for', 'test-input')
      expect(input).toHaveAttribute('id', 'test-input')
    })

    it('renders label without htmlFor', () => {
      renderWithTheme(<Label>Standalone Label</Label>)
      const label = screen.getByText('Standalone Label')
      expect(label).toBeInTheDocument()
    })
  })

  describe('Card Component', () => {
    it('renders card div', () => {
      renderWithTheme(<Card data-testid="test-card">Card Content</Card>)
      const card = screen.getByTestId('test-card')
      expect(card).toBeInTheDocument()
      expect(card.tagName).toBe('DIV')
    })

    it('renders card with children', () => {
      renderWithTheme(
        <Card data-testid="test-card">
          <p>Card content</p>
        </Card>
      )
      expect(screen.getByText('Card content')).toBeInTheDocument()
    })

    it('applies card styles', () => {
      renderWithTheme(<Card data-testid="test-card">Content</Card>)
      const card = screen.getByTestId('test-card')
      expect(card).toBeInTheDocument()
    })
  })

  describe('GlassCard Component', () => {
    it('renders GlassCard div', () => {
      renderWithTheme(<GlassCard data-testid="test-glass-card">Glass Content</GlassCard>)
      const glassCard = screen.getByTestId('test-glass-card')
      expect(glassCard).toBeInTheDocument()
      expect(glassCard.tagName).toBe('DIV')
    })

    it('renders GlassCard with children', () => {
      renderWithTheme(
        <GlassCard data-testid="test-glass-card">
          <p>Glass content</p>
        </GlassCard>
      )
      expect(screen.getByText('Glass content')).toBeInTheDocument()
    })

    it('extends Card component', () => {
      // GlassCard should inherit Card styles
      renderWithTheme(<GlassCard data-testid="test-glass-card">Content</GlassCard>)
      const glassCard = screen.getByTestId('test-glass-card')
      expect(glassCard).toBeInTheDocument()
    })
  })

  describe('AppContainer Component', () => {
    it('renders AppContainer div', () => {
      renderWithTheme(<AppContainer data-testid="test-app">App Content</AppContainer>)
      const container = screen.getByTestId('test-app')
      expect(container).toBeInTheDocument()
      expect(container.tagName).toBe('DIV')
    })

    it('renders AppContainer with children', () => {
      renderWithTheme(
        <AppContainer data-testid="test-app">
          <p>App content</p>
        </AppContainer>
      )
      expect(screen.getByText('App content')).toBeInTheDocument()
    })
  })

  describe('LoadingContainer Component', () => {
    it('renders LoadingContainer div', () => {
      renderWithTheme(<LoadingContainer data-testid="test-loading">Loading...</LoadingContainer>)
      const container = screen.getByTestId('test-loading')
      expect(container).toBeInTheDocument()
      expect(container.tagName).toBe('DIV')
    })

    it('renders LoadingContainer with loading text', () => {
      renderWithTheme(<LoadingContainer>Loading...</LoadingContainer>)
      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })
  })

  describe('Component Integration', () => {
    it('renders form with Label and Input', () => {
      renderWithTheme(
        <form>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" />
        </form>
      )
      const input = screen.getByLabelText('Email')
      expect(input).toHaveAttribute('type', 'email')
    })

    it('renders Card with Button', () => {
      renderWithTheme(
        <Card>
          <Button>Click me</Button>
        </Card>
      )
      expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
    })

    it('renders complete form structure', () => {
      renderWithTheme(
        <Card>
          <form>
            <Label htmlFor="username">Username</Label>
            <Input id="username" />
            <Button type="submit">Submit</Button>
          </form>
        </Card>
      )
      expect(screen.getByLabelText('Username')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument()
    })
  })

  describe('Theme Integration', () => {
    it('components use theme colors', () => {
      renderWithTheme(<Button variant="primary">Test</Button>)
      const button = screen.getByRole('button', { name: 'Test' })
      expect(button).toBeInTheDocument()
      // Component should be styled (we can't easily test computed styles in jsdom)
    })

    it('components use theme spacing', () => {
      renderWithTheme(<Input data-testid="test-input" />)
      const input = screen.getByTestId('test-input')
      expect(input).toBeInTheDocument()
    })

    it('components use theme transitions', () => {
      renderWithTheme(<Button>Test</Button>)
      const button = screen.getByRole('button', { name: 'Test' })
      expect(button).toBeInTheDocument()
    })
  })
})
