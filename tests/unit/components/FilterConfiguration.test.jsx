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
      expect(screen.getByText(/Rows will be deleted/i)).toBeInTheDocument()
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
  })
})
