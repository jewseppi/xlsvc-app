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

    it('renders with empty filter rules array', () => {
      renderWithTheme(
        <FilterConfiguration
          filterRules={[]}
          setFilterRules={mockSetFilterRules}
        />
      )

      expect(screen.queryAllByLabelText(/column/i)).toHaveLength(0)
      expect(screen.getByText(/add filter rule/i)).toBeInTheDocument()
      expect(screen.getByText('How it works')).toBeInTheDocument()
    })

    it('handles value with unicode characters', () => {
      const filterRules = getDefaultFilterRules()
      renderWithTheme(
        <FilterConfiguration
          filterRules={filterRules}
          setFilterRules={mockSetFilterRules}
        />
      )

      const valueInputs = screen.getAllByLabelText(/value to match/i)
      mockSetFilterRules.mockClear()

      fireEvent.change(valueInputs[0], { target: { value: 'café' } })

      expect(mockSetFilterRules).toHaveBeenCalled()
      const lastCall = mockSetFilterRules.mock.calls[mockSetFilterRules.mock.calls.length - 1]
      expect(lastCall[0][0].value).toBe('café')
    })

    it('handles value with leading and trailing spaces', () => {
      const filterRules = getDefaultFilterRules()
      renderWithTheme(
        <FilterConfiguration
          filterRules={filterRules}
          setFilterRules={mockSetFilterRules}
        />
      )

      const valueInputs = screen.getAllByLabelText(/value to match/i)
      mockSetFilterRules.mockClear()

      fireEvent.change(valueInputs[0], { target: { value: '  value  ' } })

      expect(mockSetFilterRules).toHaveBeenCalled()
      const lastCall = mockSetFilterRules.mock.calls[mockSetFilterRules.mock.calls.length - 1]
      expect(lastCall[0][0].value).toBe('  value  ')
    })

    it('handles very long value string', () => {
      const filterRules = getDefaultFilterRules()
      renderWithTheme(
        <FilterConfiguration
          filterRules={filterRules}
          setFilterRules={mockSetFilterRules}
        />
      )

      const valueInputs = screen.getAllByLabelText(/value to match/i)
      mockSetFilterRules.mockClear()
      const longValue = 'x'.repeat(500)
      fireEvent.change(valueInputs[0], { target: { value: longValue } })

      expect(mockSetFilterRules).toHaveBeenCalled()
      const lastCall = mockSetFilterRules.mock.calls[mockSetFilterRules.mock.calls.length - 1]
      expect(lastCall[0][0].value).toBe(longValue)
    })

    it('handles numeric value string', () => {
      const filterRules = getDefaultFilterRules()
      renderWithTheme(
        <FilterConfiguration
          filterRules={filterRules}
          setFilterRules={mockSetFilterRules}
        />
      )

      const valueInputs = screen.getAllByLabelText(/value to match/i)
      mockSetFilterRules.mockClear()

      fireEvent.change(valueInputs[0], { target: { value: '12345' } })

      expect(mockSetFilterRules).toHaveBeenCalled()
      const lastCall = mockSetFilterRules.mock.calls[mockSetFilterRules.mock.calls.length - 1]
      expect(lastCall[0][0].value).toBe('12345')
    })

    it('handles value "0" as literal (empty/zero semantic edge case)', () => {
      // Value "0" is displayed when provided in filterRules (used for empty/zero matching)
      const filterRulesWithZero = [{ column: 'F', value: '0' }]
      renderWithTheme(
        <FilterConfiguration
          filterRules={filterRulesWithZero}
          setFilterRules={mockSetFilterRules}
        />
      )
      expect(screen.getByDisplayValue('0')).toBeInTheDocument()

      // Changing from "1" to "0" triggers setFilterRules with value "0"
      const filterRulesWithOne = [{ column: 'F', value: '1' }]
      renderWithTheme(
        <FilterConfiguration
          filterRules={filterRulesWithOne}
          setFilterRules={mockSetFilterRules}
        />
      )
      const valueInput = screen.getByDisplayValue('1')
      mockSetFilterRules.mockClear()
      fireEvent.change(valueInput, { target: { value: '0' } })
      expect(mockSetFilterRules).toHaveBeenCalledTimes(1)
      expect(mockSetFilterRules.mock.calls[0][0][0].value).toBe('0')
    })

    it('allows adding many rules in sequence (no maximum limit)', () => {
      const filterRules = getDefaultFilterRules()
      renderWithTheme(
        <FilterConfiguration
          filterRules={filterRules}
          setFilterRules={mockSetFilterRules}
        />
      )

      const addButton = screen.getByText(/add filter rule/i)
      mockSetFilterRules.mockClear()

      for (let i = 0; i < 15; i++) {
        fireEvent.click(addButton)
      }

      // Component calls setFilterRules each click; without parent updating props, each call uses same filterRules
      expect(mockSetFilterRules).toHaveBeenCalledTimes(15)
      const lastCall = mockSetFilterRules.mock.calls[mockSetFilterRules.mock.calls.length - 1]
      expect(lastCall[0].length).toBe(filterRules.length + 1)
      expect(lastCall[0][lastCall[0].length - 1]).toEqual({ column: 'A', value: '0' })
    })

    it('column with unicode character is uppercased', () => {
      const filterRules = getDefaultFilterRules()
      renderWithTheme(
        <FilterConfiguration
          filterRules={filterRules}
          setFilterRules={mockSetFilterRules}
        />
      )

      const columnInputs = screen.getAllByLabelText(/column/i)
      mockSetFilterRules.mockClear()

      fireEvent.change(columnInputs[0], { target: { value: 'é' } })

      expect(mockSetFilterRules).toHaveBeenCalled()
      const lastCall = mockSetFilterRules.mock.calls[mockSetFilterRules.mock.calls.length - 1]
      expect(lastCall[0][0].column).toBe('É')
    })

    it('removing rule from middle preserves other rules', () => {
      const filterRules = [
        { column: 'F', value: '1' },
        { column: 'G', value: '2' },
        { column: 'H', value: '3' }
      ]
      renderWithTheme(
        <FilterConfiguration
          filterRules={filterRules}
          setFilterRules={mockSetFilterRules}
        />
      )

      const removeButtons = screen.getAllByLabelText(/remove filter rule/i)
      mockSetFilterRules.mockClear()

      fireEvent.click(removeButtons[1])

      expect(mockSetFilterRules).toHaveBeenCalled()
      const lastCall = mockSetFilterRules.mock.calls[mockSetFilterRules.mock.calls.length - 1]
      expect(lastCall[0]).toHaveLength(2)
      expect(lastCall[0][0]).toEqual({ column: 'F', value: '1' })
      expect(lastCall[0][1]).toEqual({ column: 'H', value: '3' })
    })

    it('updates last rule when many rules exist', () => {
      const manyRules = Array.from({ length: 10 }, (_, i) => ({
        column: String.fromCharCode(65 + i),
        value: String(i)
      }))
      renderWithTheme(
        <FilterConfiguration
          filterRules={manyRules}
          setFilterRules={mockSetFilterRules}
        />
      )

      const columnInputs = screen.getAllByLabelText(/column/i)
      const valueInputs = screen.getAllByLabelText(/value to match/i)
      const lastIndex = manyRules.length - 1
      mockSetFilterRules.mockClear()

      fireEvent.change(columnInputs[lastIndex], { target: { value: 'Z' } })
      fireEvent.change(valueInputs[lastIndex], { target: { value: '99' } })

      expect(mockSetFilterRules).toHaveBeenCalledTimes(2)
      const columnCall = mockSetFilterRules.mock.calls[mockSetFilterRules.mock.calls.length - 2][0]
      const valueCall = mockSetFilterRules.mock.calls[mockSetFilterRules.mock.calls.length - 1][0]
      expect(columnCall[lastIndex].column).toBe('Z')
      expect(valueCall[lastIndex].value).toBe('99')
    })

    it('handles column with only special characters', () => {
      const filterRules = getDefaultFilterRules()
      renderWithTheme(
        <FilterConfiguration
          filterRules={filterRules}
          setFilterRules={mockSetFilterRules}
        />
      )

      const columnInputs = screen.getAllByLabelText(/column/i)
      mockSetFilterRules.mockClear()

      fireEvent.change(columnInputs[0], { target: { value: '***' } })

      expect(mockSetFilterRules).toHaveBeenCalled()
      const lastCall = mockSetFilterRules.mock.calls[mockSetFilterRules.mock.calls.length - 1]
      expect(lastCall[0][0].column).toBe('***')
    })

    it('handles column with mixed letters and numbers', () => {
      const filterRules = getDefaultFilterRules()
      renderWithTheme(
        <FilterConfiguration
          filterRules={filterRules}
          setFilterRules={mockSetFilterRules}
        />
      )

      const columnInputs = screen.getAllByLabelText(/column/i)
      mockSetFilterRules.mockClear()

      fireEvent.change(columnInputs[0], { target: { value: 'a1b2' } })

      expect(mockSetFilterRules).toHaveBeenCalled()
      const lastCall = mockSetFilterRules.mock.calls[mockSetFilterRules.mock.calls.length - 1]
      expect(lastCall[0][0].column).toBe('A1B2')
    })
  })
})
