// src/styled/BaseComponents.js
import styled from 'styled-components'

export const AppContainer = styled.div`
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Inter', sans-serif;
  line-height: 1.6;
  color: ${props => props.theme.colors.text.primary};
  background: ${props => props.theme.colors.background.primary};
  min-height: 100vh;
`

export const LoadingContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  color: ${props => props.theme.colors.text.secondary};
  background: ${props => props.theme.colors.background.primary};
`

export const Button = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: ${props => props.small ? props.theme.spacing.sm : props.theme.spacing.md} 
           ${props => props.small ? props.theme.spacing.md : props.theme.spacing.lg};
  font-size: ${props => props.small ? '0.875rem' : '1rem'};
  font-weight: 600;
  border-radius: ${props => props.theme.borderRadius.md};
  border: none;
  cursor: pointer;
  transition: ${props => props.theme.transitions.normal};
  text-decoration: none;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
    transition: ${props => props.theme.transitions.slow};
  }

  &:hover::before {
    left: 100%;
  }
  
  ${props => props.variant === 'primary' && `
    background: ${props.theme.colors.gradient.button};
    color: ${props.theme.colors.text.primary};
    box-shadow: ${props.theme.shadows.md};
    
    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: ${props.theme.shadows.lg};
    }

    &:active {
      transform: translateY(0);
    }
  `}
  
  ${props => props.variant === 'secondary' && `
    background: transparent;
    color: ${props.theme.colors.accent.primary};
    border: 2px solid ${props.theme.colors.accent.primary};
    
    &:hover:not(:disabled) {
      background: ${props.theme.colors.accent.primary};
      color: ${props.theme.colors.text.primary};
      transform: translateY(-1px);
    }
  `}
  
  ${props => props.variant === 'ghost' && `
    background: none;
    color: ${props.theme.colors.accent.primary};
    
    &:hover:not(:disabled) {
      color: ${props.theme.colors.accent.secondary};
      text-decoration: underline;
    }
  `}
  
  ${props => props.variant === 'danger' && `
    background: ${props.theme.colors.accent.error};
    color: ${props.theme.colors.text.primary};
    
    &:hover:not(:disabled) {
      background: #dc2626;
      transform: translateY(-1px);
    }
  `}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px ${props => props.theme.colors.accent.primary}33;
  }
`

export const Input = styled.input`
  width: 100%;
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  border: 2px solid ${props => props.theme.colors.border.primary};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: 1rem;
  transition: ${props => props.theme.transitions.normal};
  background: ${props => props.theme.colors.background.card};
  color: ${props => props.theme.colors.text.primary};
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.border.focus};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.accent.primary}33;
    background: ${props => props.theme.colors.background.secondary};
  }

  &::placeholder {
    color: ${props => props.theme.colors.text.muted};
  }

  &:hover:not(:focus) {
    border-color: ${props => props.theme.colors.border.secondary};
  }
`

export const Label = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text.secondary};
  margin-bottom: ${props => props.theme.spacing.sm};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`

export const Card = styled.div`
  background: ${props => props.theme.colors.gradient.card};
  border-radius: ${props => props.theme.borderRadius.xl};
  box-shadow: ${props => props.theme.shadows.xl};
  overflow: hidden;
  border: 1px solid ${props => props.theme.colors.border.primary};
  backdrop-filter: blur(10px);
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, 
      transparent, 
      ${props => props.theme.colors.accent.primary}66, 
      transparent
    );
  }
`

export const GlassCard = styled(Card)`
  background: rgba(30, 30, 34, 0.8);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
`
