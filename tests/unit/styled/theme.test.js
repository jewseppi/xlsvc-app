/**
 * Unit tests for theme configuration
 * Tests theme object structure and all values
 */
import { describe, it, expect } from 'vitest'
import { theme } from '../../../src/styled/theme'

describe('Theme', () => {
  describe('Theme Object Structure', () => {
    it('exports theme object', () => {
      expect(theme).toBeDefined()
      expect(typeof theme).toBe('object')
    })

    it('has colors property', () => {
      expect(theme).toHaveProperty('colors')
      expect(typeof theme.colors).toBe('object')
    })

    it('has spacing property', () => {
      expect(theme).toHaveProperty('spacing')
      expect(typeof theme.spacing).toBe('object')
    })

    it('has borderRadius property', () => {
      expect(theme).toHaveProperty('borderRadius')
      expect(typeof theme.borderRadius).toBe('object')
    })

    it('has shadows property', () => {
      expect(theme).toHaveProperty('shadows')
      expect(typeof theme.shadows).toBe('object')
    })

    it('has transitions property', () => {
      expect(theme).toHaveProperty('transitions')
      expect(typeof theme.transitions).toBe('object')
    })
  })

  describe('Color Values', () => {
    it('has background colors', () => {
      expect(theme.colors.background).toBeDefined()
      expect(theme.colors.background).toHaveProperty('primary')
      expect(theme.colors.background).toHaveProperty('secondary')
      expect(theme.colors.background).toHaveProperty('tertiary')
      expect(theme.colors.background).toHaveProperty('card')
      expect(theme.colors.background).toHaveProperty('overlay')
    })

    it('has text colors', () => {
      expect(theme.colors.text).toBeDefined()
      expect(theme.colors.text).toHaveProperty('primary')
      expect(theme.colors.text).toHaveProperty('secondary')
      expect(theme.colors.text).toHaveProperty('tertiary')
      expect(theme.colors.text).toHaveProperty('muted')
    })

    it('has accent colors', () => {
      expect(theme.colors.accent).toBeDefined()
      expect(theme.colors.accent).toHaveProperty('primary')
      expect(theme.colors.accent).toHaveProperty('secondary')
      expect(theme.colors.accent).toHaveProperty('success')
      expect(theme.colors.accent).toHaveProperty('warning')
      expect(theme.colors.accent).toHaveProperty('error')
    })

    it('has border colors', () => {
      expect(theme.colors.border).toBeDefined()
      expect(theme.colors.border).toHaveProperty('primary')
      expect(theme.colors.border).toHaveProperty('secondary')
      expect(theme.colors.border).toHaveProperty('focus')
    })

    it('has gradient colors', () => {
      expect(theme.colors.gradient).toBeDefined()
      expect(theme.colors.gradient).toHaveProperty('primary')
      expect(theme.colors.gradient).toHaveProperty('card')
      expect(theme.colors.gradient).toHaveProperty('button')
      expect(theme.colors.gradient).toHaveProperty('accent')
    })

    it('has valid color values (hex or gradient strings)', () => {
      // Background colors should be hex strings
      expect(theme.colors.background.primary).toMatch(/^#[0-9a-fA-F]{6}$|^rgba?\(/)
      expect(theme.colors.background.secondary).toMatch(/^#[0-9a-fA-F]{6}$|^rgba?\(/)

      // Text colors should be hex strings
      expect(theme.colors.text.primary).toMatch(/^#[0-9a-fA-F]{6}$|^rgba?\(/)
      expect(theme.colors.text.secondary).toMatch(/^#[0-9a-fA-F]{6}$|^rgba?\(/)

      // Accent colors should be hex strings
      expect(theme.colors.accent.primary).toMatch(/^#[0-9a-fA-F]{6}$|^rgba?\(/)
      expect(theme.colors.accent.error).toMatch(/^#[0-9a-fA-F]{6}$|^rgba?\(/)

      // Gradients should be linear-gradient strings
      expect(theme.colors.gradient.primary).toContain('gradient')
    })
  })

  describe('Spacing Values', () => {
    it('has all spacing values', () => {
      expect(theme.spacing).toHaveProperty('xs')
      expect(theme.spacing).toHaveProperty('sm')
      expect(theme.spacing).toHaveProperty('md')
      expect(theme.spacing).toHaveProperty('lg')
      expect(theme.spacing).toHaveProperty('xl')
      expect(theme.spacing).toHaveProperty('xxl')
    })

    it('has valid spacing values (rem units)', () => {
      expect(theme.spacing.xs).toMatch(/^\d+\.?\d*rem$/)
      expect(theme.spacing.sm).toMatch(/^\d+\.?\d*rem$/)
      expect(theme.spacing.md).toMatch(/^\d+\.?\d*rem$/)
      expect(theme.spacing.lg).toMatch(/^\d+\.?\d*rem$/)
      expect(theme.spacing.xl).toMatch(/^\d+\.?\d*rem$/)
      expect(theme.spacing.xxl).toMatch(/^\d+\.?\d*rem$/)
    })

    it('has increasing spacing values', () => {
      const xs = parseFloat(theme.spacing.xs)
      const sm = parseFloat(theme.spacing.sm)
      const md = parseFloat(theme.spacing.md)
      const lg = parseFloat(theme.spacing.lg)
      const xl = parseFloat(theme.spacing.xl)
      const xxl = parseFloat(theme.spacing.xxl)

      expect(sm).toBeGreaterThanOrEqual(xs)
      expect(md).toBeGreaterThanOrEqual(sm)
      expect(lg).toBeGreaterThanOrEqual(md)
      expect(xl).toBeGreaterThanOrEqual(lg)
      expect(xxl).toBeGreaterThanOrEqual(xl)
    })
  })

  describe('Border Radius Values', () => {
    it('has all borderRadius values', () => {
      expect(theme.borderRadius).toHaveProperty('sm')
      expect(theme.borderRadius).toHaveProperty('md')
      expect(theme.borderRadius).toHaveProperty('lg')
      expect(theme.borderRadius).toHaveProperty('xl')
      expect(theme.borderRadius).toHaveProperty('full')
    })

    it('has valid borderRadius values (px or rem units)', () => {
      expect(theme.borderRadius.sm).toMatch(/^\d+px$|^\d+\.?\d*rem$/)
      expect(theme.borderRadius.md).toMatch(/^\d+px$|^\d+\.?\d*rem$/)
      expect(theme.borderRadius.lg).toMatch(/^\d+px$|^\d+\.?\d*rem$/)
      expect(theme.borderRadius.xl).toMatch(/^\d+px$|^\d+\.?\d*rem$/)
      expect(theme.borderRadius.full).toMatch(/^\d+px$|^\d+\.?\d*rem$|^\d+$/)
    })
  })

  describe('Shadow Values', () => {
    it('has all shadow values', () => {
      expect(theme.shadows).toHaveProperty('sm')
      expect(theme.shadows).toHaveProperty('md')
      expect(theme.shadows).toHaveProperty('lg')
      expect(theme.shadows).toHaveProperty('xl')
      expect(theme.shadows).toHaveProperty('inner')
    })

    it('has valid shadow values (box-shadow strings)', () => {
      expect(typeof theme.shadows.sm).toBe('string')
      expect(typeof theme.shadows.md).toBe('string')
      expect(typeof theme.shadows.lg).toBe('string')
      expect(typeof theme.shadows.xl).toBe('string')
      expect(typeof theme.shadows.inner).toBe('string')

      // Shadows should contain rgba or box-shadow keywords
      expect(theme.shadows.sm).toMatch(/rgba|shadow/)
      expect(theme.shadows.md).toMatch(/rgba|shadow/)
    })
  })

  describe('Transition Values', () => {
    it('has all transition values', () => {
      expect(theme.transitions).toHaveProperty('fast')
      expect(theme.transitions).toHaveProperty('normal')
      expect(theme.transitions).toHaveProperty('slow')
    })

    it('has valid transition values (CSS transition strings)', () => {
      expect(theme.transitions.fast).toMatch(/all.*ease|transition/)
      expect(theme.transitions.normal).toMatch(/all.*ease|transition/)
      expect(theme.transitions.slow).toMatch(/all.*ease|transition/)
    })

    it('has increasing transition durations', () => {
      const fast = parseFloat(theme.transitions.fast.match(/\d+\.?\d*/)?.[0] || '0')
      const normal = parseFloat(theme.transitions.normal.match(/\d+\.?\d*/)?.[0] || '0')
      const slow = parseFloat(theme.transitions.slow.match(/\d+\.?\d*/)?.[0] || '0')

      expect(normal).toBeGreaterThanOrEqual(fast)
      expect(slow).toBeGreaterThanOrEqual(normal)
    })
  })

  describe('Theme Consistency', () => {
    it('has consistent dark theme colors', () => {
      // Dark theme should have dark backgrounds
      expect(theme.colors.background.primary).toMatch(/^#0[0-9a-fA-F]|^rgba?\(0,/)
      expect(theme.colors.background.secondary).toMatch(/^#0[0-9a-fA-F]|^rgba?\(0,/)
    })

    it('has consistent text colors for dark theme', () => {
      // Light text on dark background
      expect(theme.colors.text.primary).toMatch(/^#f[0-9a-fA-F]|^rgba?\(255,|white/)
    })
  })
})
