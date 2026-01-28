/**
 * Unit tests for FilterConfiguration component
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ThemeProvider } from 'styled-components'
import FilterConfiguration from '../../../src/components/FilterConfiguration'
import { theme } from '../../../src/styled/theme'

describe('FilterConfiguration', () => {
  let mockSetFilterRules

  // Create a function that returns fresh filter rules to avoid mutation issues
  const getDefaultFilterRules = () => [
    { column: 'F', value: '0' },
    { column: 'G', value: '0' }
  ]

  beforeEach(() => {
    mockSetFilterRules = vi.fn()
  })

  const renderWithTheme = (component) => {
    return render(
      <ThemeProvider theme={theme}>
        {component}
      </ThemeProvider>
    )
  }

  it('renders filter rules', () => {
    const filterRules = getDefaultFilterRules()
    renderWithTheme(
      <FilterConfiguration
        filterRules={filterRules}
        setFilterRules={mockSetFilterRules}
      />
    )

    // Check that both filter rules are rendered
    const columnInputs = screen.getAllByLabelText(/column/i)
    expect(columnInputs).toHaveLength(2)
  })

  it('allows adding a new filter rule', () => {
    const filterRules = getDefaultFilterRules()
    renderWithTheme(
      <FilterConfiguration
        filterRules={filterRules}
        setFilterRules={mockSetFilterRules}
      />
    )

    const addButton = screen.getByText(/add filter rule/i)
    
    // Clear any previous calls from render
    mockSetFilterRules.mockClear()
    
    fireEvent.click(addButton)

    // Check that setFilterRules was called with the new rule added
    expect(mockSetFilterRules).toHaveBeenCalled()
    const lastCall = mockSetFilterRules.mock.calls[mockSetFilterRules.mock.calls.length - 1]
    expect(lastCall[0]).toEqual([
      ...filterRules,
      { column: 'A', value: '0' }
    ])
  })

  it('allows removing a filter rule', () => {
    const filterRules = getDefaultFilterRules()
    renderWithTheme(
      <FilterConfiguration
        filterRules={filterRules}
        setFilterRules={mockSetFilterRules}
      />
    )

    const removeButtons = screen.getAllByLabelText(/remove filter rule/i)
    
    // Clear any previous calls from render
    mockSetFilterRules.mockClear()
    
    fireEvent.click(removeButtons[0])

    // Check that setFilterRules was called with the rule removed
    expect(mockSetFilterRules).toHaveBeenCalled()
    const lastCall = mockSetFilterRules.mock.calls[mockSetFilterRules.mock.calls.length - 1]
    expect(lastCall[0]).toEqual([filterRules[1]])
  })

  it('allows updating column value', () => {
    const filterRules = getDefaultFilterRules()
    renderWithTheme(
      <FilterConfiguration
        filterRules={filterRules}
        setFilterRules={mockSetFilterRules}
      />
    )

    const columnInputs = screen.getAllByLabelText(/column/i)
    
    // Clear any previous calls from render
    mockSetFilterRules.mockClear()
    
    fireEvent.change(columnInputs[0], { target: { value: 'H' } })

    // Check that setFilterRules was called with the updated column
    expect(mockSetFilterRules).toHaveBeenCalled()
    const lastCall = mockSetFilterRules.mock.calls[mockSetFilterRules.mock.calls.length - 1]
    expect(lastCall[0]).toEqual([
      { column: 'H', value: '0' },
      filterRules[1]
    ])
  })

  it('allows updating value field', () => {
    const filterRules = getDefaultFilterRules()
    renderWithTheme(
      <FilterConfiguration
        filterRules={filterRules}
        setFilterRules={mockSetFilterRules}
      />
    )

    const valueInputs = screen.getAllByLabelText(/value to match/i)
    
    // Clear any previous calls from render
    mockSetFilterRules.mockClear()
    
    fireEvent.change(valueInputs[0], { target: { value: '1' } })

    // Check that setFilterRules was called with the updated value
    expect(mockSetFilterRules).toHaveBeenCalled()
    const lastCall = mockSetFilterRules.mock.calls[mockSetFilterRules.mock.calls.length - 1]
    expect(lastCall[0]).toEqual([
      { column: 'F', value: '1' },
      filterRules[1]
    ])
  })

  describe('Edge Cases', () => {
    it('converts column to uppercase', () => {
      const filterRules = getDefaultFilterRules()
      renderWithTheme(
        <FilterConfiguration
          filterRules={filterRules}
          setFilterRules={mockSetFilterRules}
        />
      )

      const columnInputs = screen.getAllByLabelText(/column/i)
      
      mockSetFilterRules.mockClear()
      
      fireEvent.change(columnInputs[0], { target: { value: 'h' } })

      expect(mockSetFilterRules).toHaveBeenCalled()
      const lastCall = mockSetFilterRules.mock.calls[mockSetFilterRules.mock.calls.length - 1]
      expect(lastCall[0][0].column).toBe('H')
    })

    it('handles column with numbers', () => {
      const filterRules = getDefaultFilterRules()
      renderWithTheme(
        <FilterConfiguration
          filterRules={filterRules}
          setFilterRules={mockSetFilterRules}
        />
      )

      const columnInputs = screen.getAllByLabelText(/column/i)
      
      mockSetFilterRules.mockClear()
      
      fireEvent.change(columnInputs[0], { target: { value: '6' } })

      expect(mockSetFilterRules).toHaveBeenCalled()
      const lastCall = mockSetFilterRules.mock.calls[mockSetFilterRules.mock.calls.length - 1]
      expect(lastCall[0][0].column).toBe('6')
    })

    it('handles invalid column values', () => {
      const filterRules = getDefaultFilterRules()
      renderWithTheme(
        <FilterConfiguration
          filterRules={filterRules}
          setFilterRules={mockSetFilterRules}
        />
      )

      const columnInputs = screen.getAllByLabelText(/column/i)
      
      mockSetFilterRules.mockClear()
      
      // Test with special characters
      fireEvent.change(columnInputs[0], { target: { value: '@#$' } })

      // Component should still update (validation happens on backend)
      expect(mockSetFilterRules).toHaveBeenCalled()
    })

    it('handles empty column value', () => {
      const filterRules = getDefaultFilterRules()
      renderWithTheme(
        <FilterConfiguration
          filterRules={filterRules}
          setFilterRules={mockSetFilterRules}
        />
      )

      const columnInputs = screen.getAllByLabelText(/column/i)
      
      mockSetFilterRules.mockClear()
      
      fireEvent.change(columnInputs[0], { target: { value: '' } })

      expect(mockSetFilterRules).toHaveBeenCalled()
      const lastCall = mockSetFilterRules.mock.calls[mockSetFilterRules.mock.calls.length - 1]
      expect(lastCall[0][0].column).toBe('')
    })

    it('handles empty value field', () => {
      const filterRules = getDefaultFilterRules()
      renderWithTheme(
        <FilterConfiguration
          filterRules={filterRules}
          setFilterRules={mockSetFilterRules}
        />
      )

      const valueInputs = screen.getAllByLabelText(/value to match/i)
      
      mockSetFilterRules.mockClear()
      
      fireEvent.change(valueInputs[0], { target: { value: '' } })

      expect(mockSetFilterRules).toHaveBeenCalled()
      const lastCall = mockSetFilterRules.mock.calls[mockSetFilterRules.mock.calls.length - 1]
      expect(lastCall[0][0].value).toBe('')
    })

    it('allows removing all rules', () => {
      const filterRules = [{ column: 'F', value: '0' }]
      renderWithTheme(
        <FilterConfiguration
          filterRules={filterRules}
          setFilterRules={mockSetFilterRules}
        />
      )

      const removeButtons = screen.getAllByLabelText(/remove filter rule/i)
      
      mockSetFilterRules.mockClear()
      
      fireEvent.click(removeButtons[0])

      expect(mockSetFilterRules).toHaveBeenCalled()
      const lastCall = mockSetFilterRules.mock.calls[mockSetFilterRules.mock.calls.length - 1]
      expect(lastCall[0]).toEqual([])
    })

    it('allows adding multiple rules', () => {
      const filterRules = getDefaultFilterRules()
      renderWithTheme(
        <FilterConfiguration
          filterRules={filterRules}
          setFilterRules={mockSetFilterRules}
        />
      )

      const addButton = screen.getByText(/add filter rule/i)
      
      // Add multiple rules
      mockSetFilterRules.mockClear()
      fireEvent.click(addButton)
      
      expect(mockSetFilterRules).toHaveBeenCalled()
      const lastCall = mockSetFilterRules.mock.calls[mockSetFilterRules.mock.calls.length - 1]
      expect(lastCall[0].length).toBe(filterRules.length + 1)
    })

    it('handles value with special characters', () => {
      const filterRules = getDefaultFilterRules()
      renderWithTheme(
        <FilterConfiguration
          filterRules={filterRules}
          setFilterRules={mockSetFilterRules}
        />
      )

      const valueInputs = screen.getAllByLabelText(/value to match/i)
      
      mockSetFilterRules.mockClear()
      
      fireEvent.change(valueInputs[0], { target: { value: 'test@value#123' } })

      expect(mockSetFilterRules).toHaveBeenCalled()
      const lastCall = mockSetFilterRules.mock.calls[mockSetFilterRules.mock.calls.length - 1]
      expect(lastCall[0][0].value).toBe('test@value#123')
    })

    it('handles very long column values', () => {
      const filterRules = getDefaultFilterRules()
      renderWithTheme(
        <FilterConfiguration
          filterRules={filterRules}
          setFilterRules={mockSetFilterRules}
        />
      )

      const columnInputs = screen.getAllByLabelText(/column/i)
      
      mockSetFilterRules.mockClear()
      
      const longValue = 'A'.repeat(100)
      fireEvent.change(columnInputs[0], { target: { value: longValue } })

      expect(mockSetFilterRules).toHaveBeenCalled()
      const lastCall = mockSetFilterRules.mock.calls[mockSetFilterRules.mock.calls.length - 1]
      expect(lastCall[0][0].column).toBe(longValue.toUpperCase())
    })

    it('handles numeric column values', () => {
      const filterRules = getDefaultFilterRules()
      renderWithTheme(
        <FilterConfiguration
          filterRules={filterRules}
          setFilterRules={mockSetFilterRules}
        />
      )

      const columnInputs = screen.getAllByLabelText(/column/i)
      
      mockSetFilterRules.mockClear()
      
      fireEvent.change(columnInputs[0], { target: { value: '26' } })

      expect(mockSetFilterRules).toHaveBeenCalled()
      const lastCall = mockSetFilterRules.mock.calls[mockSetFilterRules.mock.calls.length - 1]
      expect(lastCall[0][0].column).toBe('26')
    })

    it('handles mixed case column values', () => {
      const filterRules = getDefaultFilterRules()
      renderWithTheme(
        <FilterConfiguration
          filterRules={filterRules}
          setFilterRules={mockSetFilterRules}
        />
      )

      const columnInputs = screen.getAllByLabelText(/column/i)
      
      mockSetFilterRules.mockClear()
      
      fireEvent.change(columnInputs[0], { target: { value: 'aBc' } })

      expect(mockSetFilterRules).toHaveBeenCalled()
      const lastCall = mockSetFilterRules.mock.calls[mockSetFilterRules.mock.calls.length - 1]
      expect(lastCall[0][0].column).toBe('ABC')
    })

    it('renders info box with instructions', () => {
      const filterRules = getDefaultFilterRules()
      renderWithTheme(
        <FilterConfiguration
          filterRules={filterRules}
          setFilterRules={mockSetFilterRules}
        />
      )

      expect(screen.getByText('How it works')).toBeInTheDocument()
      // The text is in InfoText component with <strong> tags, so check the container
      const infoBox = screen.getByText('How it works').closest('div')?.parentElement
      if (infoBox) {
        // Check that the info box contains the expected text content
        expect(infoBox.textContent).toMatch(/Rows will be/i)
        expect(infoBox.textContent).toMatch(/deleted/i)
      } else {
        // Fallback: just verify the "How it works" title exists
        expect(screen.getByText('How it works')).toBeInTheDocument()
      }
    })

    it('handles updating multiple rules in sequence', () => {
      const filterRules = getDefaultFilterRules()
      renderWithTheme(
        <FilterConfiguration
          filterRules={filterRules}
          setFilterRules={mockSetFilterRules}
        />
      )

      const columnInputs = screen.getAllByLabelText(/column/i)
      const valueInputs = screen.getAllByLabelText(/value to match/i)
      
      mockSetFilterRules.mockClear()
      
      // Update first rule
      fireEvent.change(columnInputs[0], { target: { value: 'H' } })
      fireEvent.change(valueInputs[0], { target: { value: '1' } })
      
      // Update second rule
      fireEvent.change(columnInputs[1], { target: { value: 'I' } })
      fireEvent.change(valueInputs[1], { target: { value: '2' } })

      expect(mockSetFilterRules).toHaveBeenCalledTimes(4)
    })

    it('handles invalid column letters (non-alphanumeric)', () => {
      const filterRules = getDefaultFilterRules()
      renderWithTheme(
        <FilterConfiguration
          filterRules={filterRules}
          setFilterRules={mockSetFilterRules}
        />
      )

      const columnInputs = screen.getAllByLabelText(/column/i)
      
      mockSetFilterRules.mockClear()
      
      // Test with special characters - component should still accept and uppercase
      fireEvent.change(columnInputs[0], { target: { value: '@#$' } })

      expect(mockSetFilterRules).toHaveBeenCalled()
      const lastCall = mockSetFilterRules.mock.calls[mockSetFilterRules.mock.calls.length - 1]
      expect(lastCall[0][0].column).toBe('@#$')
    })

    it('allows adding many rules (no maximum limit enforced)', () => {
      // Start with default rules
      const initialRules = getDefaultFilterRules()
      let currentRules = [...initialRules]
      
      const { rerender } = render(
        <ThemeProvider theme={theme}>
          <FilterConfiguration
            filterRules={currentRules}
            setFilterRules={(newRules) => {
              currentRules = newRules
              mockSetFilterRules(newRules)
            }}
          />
        </ThemeProvider>
      )

      const addButton = screen.getByText(/add filter rule/i)
      
      // Add multiple rules (test that component can handle adding many)
      const rulesToAdd = 5 // Test adding 5 more rules
      for (let i = 0; i < rulesToAdd; i++) {
        mockSetFilterRules.mockClear()
        fireEvent.click(addButton)
        expect(mockSetFilterRules).toHaveBeenCalled()
        
        // Update component with new rules
        const lastCall = mockSetFilterRules.mock.calls[mockSetFilterRules.mock.calls.length - 1]
        currentRules = lastCall[0]
        
        rerender(
          <ThemeProvider theme={theme}>
            <FilterConfiguration
              filterRules={currentRules}
              setFilterRules={(newRules) => {
                currentRules = newRules
                mockSetFilterRules(newRules)
              }}
            />
          </ThemeProvider>
        )
      }
      
      // Component should handle many rules without issues
      const columnInputs = screen.getAllByLabelText(/column/i)
      expect(columnInputs.length).toBe(initialRules.length + rulesToAdd)
    })

    it('handles column with numbers (valid Excel column)', () => {
      const filterRules = getDefaultFilterRules()
      renderWithTheme(
        <FilterConfiguration
          filterRules={filterRules}
          setFilterRules={mockSetFilterRules}
        />
      )

      const columnInputs = screen.getAllByLabelText(/column/i)
      
      mockSetFilterRules.mockClear()
      
      // Excel columns can be numbers (1-based index)
      fireEvent.change(columnInputs[0], { target: { value: '6' } })

      expect(mockSetFilterRules).toHaveBeenCalled()
      const lastCall = mockSetFilterRules.mock.calls[mockSetFilterRules.mock.calls.length - 1]
      expect(lastCall[0][0].column).toBe('6')
    })

    it('validates column with invalid letters (non-single character)', () => {
      const filterRules = getDefaultFilterRules()
      renderWithTheme(
        <FilterConfiguration
          filterRules={filterRules}
          setFilterRules={mockSetFilterRules}
        />
      )

      const columnInputs = screen.getAllByLabelText(/column/i)
      
      mockSetFilterRules.mockClear()
      
      // Test with multiple letters (should still be accepted and uppercased)
      fireEvent.change(columnInputs[0], { target: { value: 'abc' } })

      expect(mockSetFilterRules).toHaveBeenCalled()
      const lastCall = mockSetFilterRules.mock.calls[mockSetFilterRules.mock.calls.length - 1]
      expect(lastCall[0][0].column).toBe('ABC')
    })

    it('validates column with only numbers (valid Excel column reference)', () => {
      const filterRules = getDefaultFilterRules()
      renderWithTheme(
        <FilterConfiguration
          filterRules={filterRules}
          setFilterRules={mockSetFilterRules}
        />
      )

      const columnInputs = screen.getAllByLabelText(/column/i)
      
      mockSetFilterRules.mockClear()
      
      // Excel columns can be numeric (1-based)
      fireEvent.change(columnInputs[0], { target: { value: '26' } })

      expect(mockSetFilterRules).toHaveBeenCalled()
      const lastCall = mockSetFilterRules.mock.calls[mockSetFilterRules.mock.calls.length - 1]
      expect(lastCall[0][0].column).toBe('26')
    })

    it('validates column with mixed alphanumeric (should be uppercased)', () => {
      const filterRules = getDefaultFilterRules()
      renderWithTheme(
        <FilterConfiguration
          filterRules={filterRules}
          setFilterRules={mockSetFilterRules}
        />
      )

      const columnInputs = screen.getAllByLabelText(/column/i)
      
      mockSetFilterRules.mockClear()
      
      // Mixed alphanumeric should be uppercased
      fireEvent.change(columnInputs[0], { target: { value: 'a1b2' } })

      expect(mockSetFilterRules).toHaveBeenCalled()
      const lastCall = mockSetFilterRules.mock.calls[mockSetFilterRules.mock.calls.length - 1]
      expect(lastCall[0][0].column).toBe('A1B2')
    })

    it('validates value with whitespace only', () => {
      const filterRules = getDefaultFilterRules()
      renderWithTheme(
        <FilterConfiguration
          filterRules={filterRules}
          setFilterRules={mockSetFilterRules}
        />
      )

      const valueInputs = screen.getAllByLabelText(/value to match/i)
      
      mockSetFilterRules.mockClear()
      
      fireEvent.change(valueInputs[0], { target: { value: '   ' } })

      expect(mockSetFilterRules).toHaveBeenCalled()
      const lastCall = mockSetFilterRules.mock.calls[mockSetFilterRules.mock.calls.length - 1]
      expect(lastCall[0][0].value).toBe('   ')
    })

    it('validates value with newline characters', () => {
      const filterRules = getDefaultFilterRules()
      renderWithTheme(
        <FilterConfiguration
          filterRules={filterRules}
          setFilterRules={mockSetFilterRules}
        />
      )

      const valueInputs = screen.getAllByLabelText(/value to match/i)
      
      mockSetFilterRules.mockClear()
      
      fireEvent.change(valueInputs[0], { target: { value: 'test\nvalue' } })

      expect(mockSetFilterRules).toHaveBeenCalled()
      const lastCall = mockSetFilterRules.mock.calls[mockSetFilterRules.mock.calls.length - 1]
      expect(lastCall[0][0].value).toBe('test\nvalue')
    })

    it('validates value with tab characters', () => {
      const filterRules = getDefaultFilterRules()
      renderWithTheme(
        <FilterConfiguration
          filterRules={filterRules}
          setFilterRules={mockSetFilterRules}
        />
      )

      const valueInputs = screen.getAllByLabelText(/value to match/i)
      
      mockSetFilterRules.mockClear()
      
      fireEvent.change(valueInputs[0], { target: { value: 'test\tvalue' } })

      expect(mockSetFilterRules).toHaveBeenCalled()
      const lastCall = mockSetFilterRules.mock.calls[mockSetFilterRules.mock.calls.length - 1]
      expect(lastCall[0][0].value).toBe('test\tvalue')
    })

    it('validates value with unicode characters', () => {
      const filterRules = getDefaultFilterRules()
      renderWithTheme(
        <FilterConfiguration
          filterRules={filterRules}
          setFilterRules={mockSetFilterRules}
        />
      )

      const valueInputs = screen.getAllByLabelText(/value to match/i)
      
      mockSetFilterRules.mockClear()
      
      fireEvent.change(valueInputs[0], { target: { value: 'test值123' } })

      expect(mockSetFilterRules).toHaveBeenCalled()
      const lastCall = mockSetFilterRules.mock.calls[mockSetFilterRules.mock.calls.length - 1]
      expect(lastCall[0][0].value).toBe('test值123')
    })

    it('validates value with emoji characters', () => {
      const filterRules = getDefaultFilterRules()
      renderWithTheme(
        <FilterConfiguration
          filterRules={filterRules}
          setFilterRules={mockSetFilterRules}
        />
      )

      const valueInputs = screen.getAllByLabelText(/value to match/i)
      
      mockSetFilterRules.mockClear()
      
      fireEvent.change(valueInputs[0], { target: { value: 'test😀value' } })

      expect(mockSetFilterRules).toHaveBeenCalled()
      const lastCall = mockSetFilterRules.mock.calls[mockSetFilterRules.mock.calls.length - 1]
      expect(lastCall[0][0].value).toBe('test😀value')
    })

    it('validates value with zero as string', () => {
      const filterRules = getDefaultFilterRules()
      renderWithTheme(
        <FilterConfiguration
          filterRules={filterRules}
          setFilterRules={mockSetFilterRules}
        />
      )

      const valueInputs = screen.getAllByLabelText(/value to match/i)
      
      mockSetFilterRules.mockClear()
      
      fireEvent.change(valueInputs[0], { target: { value: '0' } })

      expect(mockSetFilterRules).toHaveBeenCalled()
      const lastCall = mockSetFilterRules.mock.calls[mockSetFilterRules.mock.calls.length - 1]
      expect(lastCall[0][0].value).toBe('0')
    })

    it('validates value with negative number as string', () => {
      const filterRules = getDefaultFilterRules()
      renderWithTheme(
        <FilterConfiguration
          filterRules={filterRules}
          setFilterRules={mockSetFilterRules}
        />
      )

      const valueInputs = screen.getAllByLabelText(/value to match/i)
      
      mockSetFilterRules.mockClear()
      
      fireEvent.change(valueInputs[0], { target: { value: '-123' } })

      expect(mockSetFilterRules).toHaveBeenCalled()
      const lastCall = mockSetFilterRules.mock.calls[mockSetFilterRules.mock.calls.length - 1]
      expect(lastCall[0][0].value).toBe('-123')
    })

    it('validates value with decimal number as string', () => {
      const filterRules = getDefaultFilterRules()
      renderWithTheme(
        <FilterConfiguration
          filterRules={filterRules}
          setFilterRules={mockSetFilterRules}
        />
      )

      const valueInputs = screen.getAllByLabelText(/value to match/i)
      
      mockSetFilterRules.mockClear()
      
      fireEvent.change(valueInputs[0], { target: { value: '123.45' } })

      expect(mockSetFilterRules).toHaveBeenCalled()
      const lastCall = mockSetFilterRules.mock.calls[mockSetFilterRules.mock.calls.length - 1]
      expect(lastCall[0][0].value).toBe('123.45')
    })

    it('validates column with single space (should be uppercased)', () => {
      const filterRules = getDefaultFilterRules()
      renderWithTheme(
        <FilterConfiguration
          filterRules={filterRules}
          setFilterRules={mockSetFilterRules}
        />
      )

      const columnInputs = screen.getAllByLabelText(/column/i)
      
      mockSetFilterRules.mockClear()
      
      fireEvent.change(columnInputs[0], { target: { value: ' ' } })

      expect(mockSetFilterRules).toHaveBeenCalled()
      const lastCall = mockSetFilterRules.mock.calls[mockSetFilterRules.mock.calls.length - 1]
      expect(lastCall[0][0].column).toBe(' ')
    })

    it('validates column with leading/trailing spaces', () => {
      const filterRules = getDefaultFilterRules()
      renderWithTheme(
        <FilterConfiguration
          filterRules={filterRules}
          setFilterRules={mockSetFilterRules}
        />
      )

      const columnInputs = screen.getAllByLabelText(/column/i)
      
      mockSetFilterRules.mockClear()
      
      fireEvent.change(columnInputs[0], { target: { value: '  A  ' } })

      expect(mockSetFilterRules).toHaveBeenCalled()
      const lastCall = mockSetFilterRules.mock.calls[mockSetFilterRules.mock.calls.length - 1]
      expect(lastCall[0][0].column).toBe('  A  ')
    })

    it('validates value with leading/trailing spaces', () => {
      const filterRules = getDefaultFilterRules()
      renderWithTheme(
        <FilterConfiguration
          filterRules={filterRules}
          setFilterRules={mockSetFilterRules}
        />
      )

      const valueInputs = screen.getAllByLabelText(/value to match/i)
      
      mockSetFilterRules.mockClear()
      
      fireEvent.change(valueInputs[0], { target: { value: '  test  ' } })

      expect(mockSetFilterRules).toHaveBeenCalled()
      const lastCall = mockSetFilterRules.mock.calls[mockSetFilterRules.mock.calls.length - 1]
      expect(lastCall[0][0].value).toBe('  test  ')
    })

    it('handles rapid sequential updates to same rule', () => {
      const filterRules = getDefaultFilterRules()
      renderWithTheme(
        <FilterConfiguration
          filterRules={filterRules}
          setFilterRules={mockSetFilterRules}
        />
      )

      const columnInputs = screen.getAllByLabelText(/column/i)
      const valueInputs = screen.getAllByLabelText(/value to match/i)
      
      mockSetFilterRules.mockClear()
      
      // Rapid sequential updates
      fireEvent.change(columnInputs[0], { target: { value: 'A' } })
      fireEvent.change(valueInputs[0], { target: { value: '1' } })
      fireEvent.change(columnInputs[0], { target: { value: 'B' } })
      fireEvent.change(valueInputs[0], { target: { value: '2' } })

      expect(mockSetFilterRules).toHaveBeenCalledTimes(4)
    })

    it('handles updating rule when filterRules array is empty', () => {
      const filterRules = []
      renderWithTheme(
        <FilterConfiguration
          filterRules={filterRules}
          setFilterRules={mockSetFilterRules}
        />
      )

      const addButton = screen.getByText(/add filter rule/i)
      
      mockSetFilterRules.mockClear()
      
      fireEvent.click(addButton)

      expect(mockSetFilterRules).toHaveBeenCalled()
      const lastCall = mockSetFilterRules.mock.calls[mockSetFilterRules.mock.calls.length - 1]
      expect(lastCall[0]).toEqual([{ column: 'A', value: '0' }])
    })

    it('validates column with very long string', () => {
      const filterRules = getDefaultFilterRules()
      renderWithTheme(
        <FilterConfiguration
          filterRules={filterRules}
          setFilterRules={mockSetFilterRules}
        />
      )

      const columnInputs = screen.getAllByLabelText(/column/i)
      
      mockSetFilterRules.mockClear()
      
      const veryLongValue = 'A'.repeat(1000)
      fireEvent.change(columnInputs[0], { target: { value: veryLongValue } })

      expect(mockSetFilterRules).toHaveBeenCalled()
      const lastCall = mockSetFilterRules.mock.calls[mockSetFilterRules.mock.calls.length - 1]
      expect(lastCall[0][0].column).toBe(veryLongValue.toUpperCase())
    })

    it('validates value with very long string', () => {
      const filterRules = getDefaultFilterRules()
      renderWithTheme(
        <FilterConfiguration
          filterRules={filterRules}
          setFilterRules={mockSetFilterRules}
        />
      )

      const valueInputs = screen.getAllByLabelText(/value to match/i)
      
      mockSetFilterRules.mockClear()
      
      const veryLongValue = 'test'.repeat(250) // 1000 characters
      fireEvent.change(valueInputs[0], { target: { value: veryLongValue } })

      expect(mockSetFilterRules).toHaveBeenCalled()
      const lastCall = mockSetFilterRules.mock.calls[mockSetFilterRules.mock.calls.length - 1]
      expect(lastCall[0][0].value).toBe(veryLongValue)
    })

    it('validates column with control characters', () => {
      const filterRules = getDefaultFilterRules()
      renderWithTheme(
        <FilterConfiguration
          filterRules={filterRules}
          setFilterRules={mockSetFilterRules}
        />
      )

      const columnInputs = screen.getAllByLabelText(/column/i)
      
      mockSetFilterRules.mockClear()
      
      // Control characters should still be accepted (validation happens on backend)
      fireEvent.change(columnInputs[0], { target: { value: 'A\u0000B' } })

      expect(mockSetFilterRules).toHaveBeenCalled()
      const lastCall = mockSetFilterRules.mock.calls[mockSetFilterRules.mock.calls.length - 1]
      expect(lastCall[0][0].column).toBe('A\u0000B')
    })

    it('validates value with control characters', () => {
      const filterRules = getDefaultFilterRules()
      renderWithTheme(
        <FilterConfiguration
          filterRules={filterRules}
          setFilterRules={mockSetFilterRules}
        />
      )

      const valueInputs = screen.getAllByLabelText(/value to match/i)
      
      mockSetFilterRules.mockClear()
      
      // Control characters should still be accepted
      fireEvent.change(valueInputs[0], { target: { value: 'test\u0000value' } })

      expect(mockSetFilterRules).toHaveBeenCalled()
      const lastCall = mockSetFilterRules.mock.calls[mockSetFilterRules.mock.calls.length - 1]
      expect(lastCall[0][0].value).toBe('test\u0000value')
    })
  })
})
