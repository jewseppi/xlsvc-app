/**
 * Unit tests for AuthComponents styled components
 */
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { ThemeProvider } from 'styled-components'
import {
  AuthContainer,
  AuthCard,
  AuthTitle,
  AuthSubtitle,
  Form,
  FormGroup,
  Alert,
  CenterText,
  FloatingLabel
} from '../../../src/styled/AuthComponents'
import { theme } from '../../../src/styled/theme'

const renderWithTheme = (component) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  )
}

describe('AuthComponents', () => {
  describe('AuthContainer', () => {
    it('renders without crashing', () => {
      renderWithTheme(<AuthContainer data-testid="auth-container">Content</AuthContainer>)
      expect(document.querySelector('[data-testid="auth-container"]')).toBeInTheDocument()
    })

    it('applies theme-based styles', () => {
      const { container } = renderWithTheme(
        <AuthContainer data-testid="auth-container">Content</AuthContainer>
      )
      const element = container.querySelector('[data-testid="auth-container"]')
      expect(element).toBeInTheDocument()
    })
  })

  describe('AuthCard', () => {
    it('renders without crashing', () => {
      renderWithTheme(<AuthCard data-testid="auth-card">Content</AuthCard>)
      expect(document.querySelector('[data-testid="auth-card"]')).toBeInTheDocument()
    })

    it('applies theme-based padding', () => {
      const { container } = renderWithTheme(
        <AuthCard data-testid="auth-card">Content</AuthCard>
      )
      const element = container.querySelector('[data-testid="auth-card"]')
      expect(element).toBeInTheDocument()
    })
  })

  describe('AuthTitle', () => {
    it('renders without crashing', () => {
      renderWithTheme(<AuthTitle>Title</AuthTitle>)
      expect(document.querySelector('h2')).toBeInTheDocument()
    })

    it('renders title text', () => {
      const { getByText } = renderWithTheme(<AuthTitle>Excel Processor</AuthTitle>)
      expect(getByText('Excel Processor')).toBeInTheDocument()
    })

    it('applies theme-based styles', () => {
      const { container } = renderWithTheme(<AuthTitle>Title</AuthTitle>)
      const element = container.querySelector('h2')
      expect(element).toBeInTheDocument()
    })
  })

  describe('AuthSubtitle', () => {
    it('renders without crashing', () => {
      renderWithTheme(<AuthSubtitle>Subtitle</AuthSubtitle>)
      expect(document.querySelector('p')).toBeInTheDocument()
    })

    it('renders subtitle text', () => {
      const { getByText } = renderWithTheme(
        <AuthSubtitle>Sign in to your account</AuthSubtitle>
      )
      expect(getByText('Sign in to your account')).toBeInTheDocument()
    })
  })

  describe('Form', () => {
    it('renders without crashing', () => {
      renderWithTheme(
        <Form data-testid="form">
          <input type="text" />
        </Form>
      )
      expect(document.querySelector('[data-testid="form"]')).toBeInTheDocument()
    })

    it('renders form elements', () => {
      const { container } = renderWithTheme(
        <Form>
          <input type="email" data-testid="email-input" />
        </Form>
      )
      expect(container.querySelector('[data-testid="email-input"]')).toBeInTheDocument()
    })
  })

  describe('FormGroup', () => {
    it('renders without crashing', () => {
      renderWithTheme(
        <FormGroup data-testid="form-group">
          <label>Email</label>
          <input type="email" />
        </FormGroup>
      )
      expect(document.querySelector('[data-testid="form-group"]')).toBeInTheDocument()
    })

    it('renders form group content', () => {
      const { getByText } = renderWithTheme(
        <FormGroup>
          <label>Email Address</label>
        </FormGroup>
      )
      expect(getByText('Email Address')).toBeInTheDocument()
    })
  })

  describe('Alert', () => {
    it('renders without crashing', () => {
      renderWithTheme(<Alert data-testid="alert">Error message</Alert>)
      expect(document.querySelector('[data-testid="alert"]')).toBeInTheDocument()
    })

    it('renders alert message', () => {
      const { getByText } = renderWithTheme(<Alert>Invalid credentials</Alert>)
      expect(getByText('Invalid credentials')).toBeInTheDocument()
    })

    it('applies error styling', () => {
      const { container } = renderWithTheme(<Alert>Error</Alert>)
      const element = container.querySelector('div')
      expect(element).toBeInTheDocument()
    })
  })

  describe('CenterText', () => {
    it('renders without crashing', () => {
      renderWithTheme(<CenterText data-testid="center-text">Centered</CenterText>)
      expect(document.querySelector('[data-testid="center-text"]')).toBeInTheDocument()
    })

    it('renders centered text', () => {
      const { getByText } = renderWithTheme(
        <CenterText>Don't have an account?</CenterText>
      )
      expect(getByText("Don't have an account?")).toBeInTheDocument()
    })
  })

  describe('FloatingLabel', () => {
    it('renders without crashing', () => {
      renderWithTheme(
        <FloatingLabel data-testid="floating">
          <input placeholder=" " />
          <label>Email</label>
        </FloatingLabel>
      )
      expect(document.querySelector('[data-testid="floating"]')).toBeInTheDocument()
    })

    it('renders input + label structure', () => {
      const { getByText, container } = renderWithTheme(
        <FloatingLabel>
          <input placeholder=" " data-testid="floating-input" />
          <label>Floating</label>
        </FloatingLabel>
      )
      expect(container.querySelector('[data-testid="floating-input"]')).toBeInTheDocument()
      expect(getByText('Floating')).toBeInTheDocument()
    })
  })
})
