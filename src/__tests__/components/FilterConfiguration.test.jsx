/**
 * Unit tests for FilterConfiguration component
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ThemeProvider } from 'styled-components'
import FilterConfiguration from '../../components/FilterConfiguration'
import { theme } from '../../styled/theme'

describe('FilterConfiguration', () => {
  const mockSetFilterRules = vi.fn()

  const defaultFilterRules = [
    { column: 'F', value: '0' },
    { column: 'G', value: '0' }
  ]

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
    expect(screen.getByLabelText(/column/i)).toBeInTheDocument()
    expect(screen.getAllByLabelText(/column/i)).toHaveLength(2)
  })

  it('allows adding a new filter rule', () => {
    renderWithTheme(
      <FilterConfiguration
        filterRules={defaultFilterRules}
        setFilterRules={mockSetFilterRules}
      />
    )

    const addButton = screen.getByText(/add filter rule/i)
    fireEvent.click(addButton)

    expect(mockSetFilterRules).toHaveBeenCalledWith([
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
    fireEvent.click(removeButtons[0])

    expect(mockSetFilterRules).toHaveBeenCalledWith([defaultFilterRules[1]])
  })

  it('allows updating column value', () => {
    renderWithTheme(
      <FilterConfiguration
        filterRules={defaultFilterRules}
        setFilterRules={mockSetFilterRules}
      />
    )

    const columnInputs = screen.getAllByLabelText(/column/i)
    fireEvent.change(columnInputs[0], { target: { value: 'H' } })

    expect(mockSetFilterRules).toHaveBeenCalledWith([
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
    fireEvent.change(valueInputs[0], { target: { value: '1' } })

    expect(mockSetFilterRules).toHaveBeenCalledWith([
      { column: 'F', value: '1' },
      defaultFilterRules[1]
    ])
  })
})
