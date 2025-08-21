// src/styled/theme.js
export const theme = {
  colors: {
    // Dark theme palette
    background: {
      primary: '#0a0a0b',
      secondary: '#121214',
      tertiary: '#1a1a1d',
      card: '#1e1e22',
      overlay: 'rgba(0, 0, 0, 0.8)'
    },
    text: {
      primary: '#ffffff',
      secondary: '#b4b4b8',
      tertiary: '#8b8b92',
      muted: '#6b6b73'
    },
    accent: {
      primary: '#6366f1', // Indigo
      secondary: '#8b5cf6', // Purple
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444'
    },
    border: {
      primary: '#2a2a2f',
      secondary: '#3a3a42',
      focus: '#6366f1'
    },
    gradient: {
      primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      card: 'linear-gradient(145deg, #1e1e22 0%, #2a2a2f 100%)',
      button: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
      accent: 'linear-gradient(135deg, #f093fb 0%, #f5576c 50%, #4facfe 100%)'
    }
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    xxl: '3rem'
  },
  borderRadius: {
    sm: '6px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '9999px'
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.3)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.6), 0 10px 10px -5px rgba(0, 0, 0, 0.3)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.3)'
  },
  transitions: {
    fast: 'all 0.15s ease',
    normal: 'all 0.2s ease',
    slow: 'all 0.3s ease'
  }
}
