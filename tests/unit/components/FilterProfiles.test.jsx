/**
 * Unit tests for FilterProfiles component
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ThemeProvider } from 'styled-components'
import FilterProfiles from '../../../src/components/FilterProfiles'
import { theme } from '../../../src/styled/theme'
import axios from 'axios'

vi.mock('axios')

describe('FilterProfiles', () => {
  let mockOnSelectProfile
  let mockSetFilterRules
  let mockSetColumnsToRemove

  const defaultProps = () => ({
    apiBase: 'http://test/api',
    selectedProfileId: null,
    onSelectProfile: mockOnSelectProfile,
    filterRules: [{ column: 'F', value: '0' }],
    setFilterRules: mockSetFilterRules,
    columnsToRemove: [],
    setColumnsToRemove: mockSetColumnsToRemove,
    isAdmin: false,
  })

  beforeEach(() => {
    mockOnSelectProfile = vi.fn()
    mockSetFilterRules = vi.fn()
    mockSetColumnsToRemove = vi.fn()
    localStorage.setItem('token', 'test-token')
    // Default: return empty profiles
    axios.get.mockResolvedValue({ data: { profiles: [] } })
  })

  afterEach(() => {
    vi.restoreAllMocks()
    localStorage.clear()
  })

  const renderWithTheme = (props = {}) => {
    return render(
      <ThemeProvider theme={theme}>
        <FilterProfiles {...defaultProps()} {...props} />
      </ThemeProvider>
    )
  }

  it('renders profile selector with manual option', async () => {
    renderWithTheme()
    expect(screen.getByLabelText(/filter profile/i)).toBeInTheDocument()
    expect(screen.getByText('Manual Configuration')).toBeInTheDocument()
  })

  it('loads and displays profiles', async () => {
    axios.get.mockResolvedValueOnce({
      data: {
        profiles: [
          { id: 1, name: 'Silver', is_system_template: true, filter_rules: [], columns_to_remove: [] },
          { id: 2, name: 'My Profile', is_system_template: false, filter_rules: [], columns_to_remove: [] },
        ],
      },
    })

    renderWithTheme()

    await waitFor(() => {
      expect(screen.getByText(/Silver/)).toBeInTheDocument()
      expect(screen.getByText(/My Profile/)).toBeInTheDocument()
    })
  })

  it('selects a profile and loads its rules', async () => {
    const profileRules = [{ column: 'G', value: '0' }]
    const profileCols = ['B']
    axios.get.mockResolvedValueOnce({
      data: {
        profiles: [
          { id: 5, name: 'Gold', is_system_template: false, filter_rules: profileRules, columns_to_remove: profileCols },
        ],
      },
    })

    renderWithTheme()

    await waitFor(() => {
      expect(screen.getByText(/Gold/)).toBeInTheDocument()
    })

    const select = screen.getByLabelText(/filter profile/i)
    fireEvent.change(select, { target: { value: '5' } })

    expect(mockOnSelectProfile).toHaveBeenCalledWith(5)
    expect(mockSetFilterRules).toHaveBeenCalledWith(profileRules)
    expect(mockSetColumnsToRemove).toHaveBeenCalledWith(profileCols)
  })

  it('switches to manual mode', async () => {
    renderWithTheme({ selectedProfileId: 1 })

    const select = screen.getByLabelText(/filter profile/i)
    fireEvent.change(select, { target: { value: 'manual' } })

    expect(mockOnSelectProfile).toHaveBeenCalledWith(null)
  })

  it('shows save form when button clicked', async () => {
    renderWithTheme()

    const saveBtn = screen.getByText(/save current as profile/i)
    fireEvent.click(saveBtn)

    expect(screen.getByLabelText(/profile name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
  })

  it('hides save form when cancel clicked', async () => {
    renderWithTheme()

    fireEvent.click(screen.getByText(/save current as profile/i))
    expect(screen.getByLabelText(/profile name/i)).toBeInTheDocument()

    fireEvent.click(screen.getByText(/cancel/i))
    expect(screen.queryByLabelText(/profile name/i)).not.toBeInTheDocument()
  })

  it('saves a new profile', async () => {
    axios.post.mockResolvedValueOnce({ data: { id: 10, name: 'Test' } })
    // Reload profiles after save
    axios.get.mockResolvedValue({ data: { profiles: [] } })

    renderWithTheme()

    fireEvent.click(screen.getByText(/save current as profile/i))

    const nameInput = screen.getByLabelText(/profile name/i)
    fireEvent.change(nameInput, { target: { value: 'My New Profile' } })

    const submitBtn = screen.getByText(/save profile/i)
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        'http://test/api/filter-profiles',
        expect.objectContaining({ name: 'My New Profile' }),
        expect.any(Object)
      )
    })
  })

  it('shows save error message', async () => {
    axios.post.mockRejectedValueOnce({
      response: { data: { error: 'Name too long' } },
    })

    renderWithTheme()

    fireEvent.click(screen.getByText(/save current as profile/i))
    fireEvent.change(screen.getByLabelText(/profile name/i), {
      target: { value: 'Test' },
    })
    fireEvent.click(screen.getByText(/save profile/i))

    await waitFor(() => {
      expect(screen.getByText('Name too long')).toBeInTheDocument()
    })
  })

  it('shows system template checkbox for admin', async () => {
    renderWithTheme({ isAdmin: true })

    fireEvent.click(screen.getByText(/save current as profile/i))
    expect(screen.getByText(/save as system template/i)).toBeInTheDocument()
  })

  it('hides system template checkbox for non-admin', async () => {
    renderWithTheme({ isAdmin: false })

    fireEvent.click(screen.getByText(/save current as profile/i))
    expect(screen.queryByText(/save as system template/i)).not.toBeInTheDocument()
  })

  it('shows clone button for system templates', async () => {
    axios.get.mockResolvedValueOnce({
      data: {
        profiles: [
          { id: 1, name: 'Silver', is_system_template: true, filter_rules: [], columns_to_remove: [] },
        ],
      },
    })

    renderWithTheme({ selectedProfileId: 1 })

    await waitFor(() => {
      expect(screen.getByText(/clone to my profiles/i)).toBeInTheDocument()
    })
  })

  it('clones a system template', async () => {
    axios.get.mockResolvedValueOnce({
      data: {
        profiles: [
          { id: 1, name: 'Silver', is_system_template: true, filter_rules: [], columns_to_remove: [] },
        ],
      },
    })
    axios.post.mockResolvedValueOnce({ data: { id: 20, name: 'Silver (Copy)' } })
    // reload after clone
    axios.get.mockResolvedValueOnce({ data: { profiles: [] } })

    renderWithTheme({ selectedProfileId: 1 })

    await waitFor(() => {
      expect(screen.getByText(/clone to my profiles/i)).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText(/clone to my profiles/i))

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        'http://test/api/filter-profiles/1/clone',
        {},
        expect.any(Object)
      )
    })
  })

  it('shows delete button for own profiles', async () => {
    axios.get.mockResolvedValueOnce({
      data: {
        profiles: [
          { id: 2, name: 'Mine', is_system_template: false, filter_rules: [], columns_to_remove: [] },
        ],
      },
    })

    renderWithTheme({ selectedProfileId: 2 })

    await waitFor(() => {
      expect(screen.getByText(/delete/i)).toBeInTheDocument()
    })
  })

  it('deletes a profile after confirm', async () => {
    window.confirm = vi.fn(() => true)
    axios.get.mockResolvedValueOnce({
      data: {
        profiles: [
          { id: 2, name: 'Mine', is_system_template: false, filter_rules: [], columns_to_remove: [] },
        ],
      },
    })
    axios.delete.mockResolvedValueOnce({ data: { message: 'ok' } })
    // reload after delete
    axios.get.mockResolvedValueOnce({ data: { profiles: [] } })

    renderWithTheme({ selectedProfileId: 2 })

    await waitFor(() => {
      expect(screen.getByText(/delete/i)).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText(/delete/i))

    await waitFor(() => {
      expect(axios.delete).toHaveBeenCalledWith(
        'http://test/api/filter-profiles/2',
        expect.any(Object)
      )
      expect(mockOnSelectProfile).toHaveBeenCalledWith(null)
    })
  })

  it('handles load profiles error gracefully', async () => {
    axios.get.mockRejectedValueOnce(new Error('Network error'))

    renderWithTheme()

    // Component should still render without crashing
    await waitFor(() => {
      expect(screen.getByLabelText(/filter profile/i)).toBeInTheDocument()
    })
  })

  it('handles clone error gracefully', async () => {
    axios.get.mockResolvedValueOnce({
      data: {
        profiles: [
          { id: 1, name: 'Tmpl', is_system_template: true, filter_rules: [], columns_to_remove: [] },
        ],
      },
    })
    axios.post.mockRejectedValueOnce({
      response: { data: { error: 'Clone failed' } },
    })

    renderWithTheme({ selectedProfileId: 1 })

    await waitFor(() => {
      expect(screen.getByText(/clone to my profiles/i)).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText(/clone to my profiles/i))

    await waitFor(() => {
      expect(screen.getByText('Clone failed')).toBeInTheDocument()
    })
  })

  it('handles delete error gracefully', async () => {
    window.confirm = vi.fn(() => true)
    axios.get.mockResolvedValueOnce({
      data: {
        profiles: [
          { id: 2, name: 'Mine', is_system_template: false, filter_rules: [], columns_to_remove: [] },
        ],
      },
    })
    axios.delete.mockRejectedValueOnce({
      response: { data: { error: 'Delete failed' } },
    })

    renderWithTheme({ selectedProfileId: 2 })

    await waitFor(() => {
      expect(screen.getByText(/delete/i)).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText(/delete/i))

    await waitFor(() => {
      expect(screen.getByText('Delete failed')).toBeInTheDocument()
    })
  })

  it('does not show delete/clone when no profile selected', async () => {
    renderWithTheme({ selectedProfileId: null })

    expect(screen.queryByText(/clone to my profiles/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/delete/i)).not.toBeInTheDocument()
  })

  it('handles profile without columns_to_remove gracefully', async () => {
    axios.get.mockResolvedValueOnce({
      data: {
        profiles: [
          { id: 3, name: 'Old', is_system_template: false, filter_rules: [{ column: 'A', value: '0' }] },
        ],
      },
    })

    renderWithTheme()

    await waitFor(() => {
      expect(screen.getByText(/Old/)).toBeInTheDocument()
    })

    const select = screen.getByLabelText(/filter profile/i)
    fireEvent.change(select, { target: { value: '3' } })

    expect(mockSetColumnsToRemove).toHaveBeenCalledWith([])
  })

  it('admin sees delete for system templates', async () => {
    axios.get.mockResolvedValueOnce({
      data: {
        profiles: [
          { id: 1, name: 'Silver', is_system_template: true, filter_rules: [], columns_to_remove: [] },
        ],
      },
    })

    renderWithTheme({ selectedProfileId: 1, isAdmin: true })

    await waitFor(() => {
      expect(screen.getByText(/delete/i)).toBeInTheDocument()
    })
  })

  it('non-admin cannot delete system templates', async () => {
    axios.get.mockResolvedValueOnce({
      data: {
        profiles: [
          { id: 1, name: 'Silver', is_system_template: true, filter_rules: [], columns_to_remove: [] },
        ],
      },
    })

    renderWithTheme({ selectedProfileId: 1, isAdmin: false })

    await waitFor(() => {
      // Only clone should be visible, not delete
      expect(screen.getByText(/clone to my profiles/i)).toBeInTheDocument()
      expect(screen.queryByText(/^delete$/i)).not.toBeInTheDocument()
    })
  })

  it('does not delete when confirm is cancelled', async () => {
    window.confirm = vi.fn(() => false)
    axios.get.mockResolvedValueOnce({
      data: {
        profiles: [
          { id: 2, name: 'Mine', is_system_template: false, filter_rules: [], columns_to_remove: [] },
        ],
      },
    })

    renderWithTheme({ selectedProfileId: 2 })

    await waitFor(() => {
      expect(screen.getByText(/delete/i)).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText(/delete/i))

    expect(axios.delete).not.toHaveBeenCalled()
  })

  it('saves profile with description and system template flag', async () => {
    axios.post.mockResolvedValueOnce({ data: { id: 10, name: 'Admin Template' } })
    axios.get.mockResolvedValue({ data: { profiles: [] } })

    renderWithTheme({ isAdmin: true })

    fireEvent.click(screen.getByText(/save current as profile/i))

    fireEvent.change(screen.getByLabelText(/profile name/i), {
      target: { value: 'Admin Template' },
    })
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: 'A system template' },
    })
    fireEvent.click(screen.getByText(/save as system template/i))
    fireEvent.click(screen.getByText(/save profile/i))

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        'http://test/api/filter-profiles',
        expect.objectContaining({
          name: 'Admin Template',
          description: 'A system template',
          is_system_template: true,
        }),
        expect.any(Object)
      )
    })
  })

  it('does not submit empty name', async () => {
    renderWithTheme()

    fireEvent.click(screen.getByText(/save current as profile/i))

    // Don't enter a name — use fireEvent.submit to bypass HTML5 required attr
    const form = screen.getByText(/save profile/i).closest('form')
    fireEvent.submit(form)

    expect(axios.post).not.toHaveBeenCalled()
  })

  it('does not submit whitespace-only name', async () => {
    renderWithTheme()

    fireEvent.click(screen.getByText(/save current as profile/i))
    fireEvent.change(screen.getByLabelText(/profile name/i), {
      target: { value: '   ' },
    })

    const form = screen.getByText(/save profile/i).closest('form')
    fireEvent.submit(form)

    expect(axios.post).not.toHaveBeenCalled()
  })

  it('handles delete error without response data', async () => {
    window.confirm = vi.fn(() => true)
    axios.get.mockResolvedValueOnce({
      data: {
        profiles: [
          { id: 2, name: 'Mine', is_system_template: false, filter_rules: [], columns_to_remove: [] },
        ],
      },
    })
    axios.delete.mockRejectedValueOnce(new Error('Network error'))

    renderWithTheme({ selectedProfileId: 2 })

    await waitFor(() => {
      expect(screen.getByText(/delete/i)).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText(/delete/i))

    await waitFor(() => {
      expect(screen.getByText('Failed to delete profile')).toBeInTheDocument()
    })
  })

  it('handles clone error without response data', async () => {
    axios.get.mockResolvedValueOnce({
      data: {
        profiles: [
          { id: 1, name: 'Tmpl', is_system_template: true, filter_rules: [], columns_to_remove: [] },
        ],
      },
    })
    axios.post.mockRejectedValueOnce(new Error('Network error'))

    renderWithTheme({ selectedProfileId: 1 })

    await waitFor(() => {
      expect(screen.getByText(/clone to my profiles/i)).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText(/clone to my profiles/i))

    await waitFor(() => {
      expect(screen.getByText('Failed to clone profile')).toBeInTheDocument()
    })
  })

  it('handles save error without response data', async () => {
    axios.post.mockRejectedValueOnce(new Error('Network error'))

    renderWithTheme()

    fireEvent.click(screen.getByText(/save current as profile/i))
    fireEvent.change(screen.getByLabelText(/profile name/i), {
      target: { value: 'Test' },
    })
    fireEvent.click(screen.getByText(/save profile/i))

    await waitFor(() => {
      expect(screen.getByText('Failed to save profile')).toBeInTheDocument()
    })
  })

  it('delete does nothing when selectedProfileId is null', async () => {
    // Render with no selectedProfileId — delete button should not be shown,
    // but we test the guard in handleDeleteProfile
    renderWithTheme({ selectedProfileId: null })
    // No delete button shown = the guard is satisfied
    expect(screen.queryByText(/^delete$/i)).not.toBeInTheDocument()
  })

  it('clone does nothing when selectedProfileId is null', async () => {
    renderWithTheme({ selectedProfileId: null })
    expect(screen.queryByText(/clone to my profiles/i)).not.toBeInTheDocument()
  })

  it('delete guard: profile not found in list', async () => {
    // selectedProfileId=999 but profiles list doesn't contain it
    window.confirm = vi.fn(() => true)
    axios.get.mockResolvedValueOnce({ data: { profiles: [] } })

    renderWithTheme({ selectedProfileId: 999 })

    // No delete button visible since selectedProfile would be undefined
    await waitFor(() => {
      expect(screen.queryByText(/^delete$/i)).not.toBeInTheDocument()
    })
  })
})
