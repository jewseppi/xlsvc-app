/**
 * Unit tests for FilterConfiguration component
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ThemeProvider } from 'styled-components'
import FilterConfiguration from '../../components/FilterConfiguration'
import { theme } from '../../styled/theme'

describe('FilterConfiguration', () => {
  let mockSetFilterRules

  const defaultFilterRules = [
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
    renderWithTheme(
      <FilterConfiguration
        filterRules={defaultFilterRules}
        setFilterRules={mockSetFilterRules}
      />
    )

    // Check that both filter rules are rendered
    const columnInputs = screen.getAllByLabelText(/column/i)
    expect(columnInputs).toHaveLength(2)
  })

  it('allows adding a new filter rule', () => {
    renderWithTheme(
      <FilterConfiguration
        filterRules={defaultFilterRules}
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
      ...defaultFilterRules,
      { column: 'A', value: '0' }
    ])
  })

  it('allows removing a filter rule', () => {
    renderWithTheme(
      <FilterConfiguration
        filterRules={defaultFilterRules}
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
    expect(lastCall[0]).toEqual([defaultFilterRules[1]])
  })

  it('allows updating column value', () => {
    renderWithTheme(
      <FilterConfiguration
        filterRules={defaultFilterRules}
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
      defaultFilterRules[1]
    ])
  })

  it('allows updating value field', () => {
    renderWithTheme(
      <FilterConfiguration
        filterRules={defaultFilterRules}
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
      defaultFilterRules[1]
    ])
  })
})
