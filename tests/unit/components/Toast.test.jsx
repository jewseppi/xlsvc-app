/**
 * Unit tests for Toast notification system
 * Covers ToastProvider, useToast hook, and toast display/dismiss behavior
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { ToastProvider, useToast } from '../../../src/components/Toast'

function ToastTrigger({ type, message, duration }) {
  const { toast } = useToast()
  const handleClick = () => {
    if (type === 'success') toast.success(message, duration !== undefined ? { duration } : undefined)
    else if (type === 'error') toast.error(message, duration !== undefined ? { duration } : undefined)
    else if (type === 'info') toast.info(message, duration !== undefined ? { duration } : undefined)
    else toast(message)
  }
  return <button onClick={handleClick}>show toast</button>
}

function renderWithProvider(type, message, duration) {
  return render(
    <ToastProvider>
      <ToastTrigger type={type} message={message} duration={duration} />
    </ToastProvider>
  )
}

describe('Toast', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
  })

  afterEach(() => {
    vi.runAllTimers()
    vi.useRealTimers()
  })

  it('renders children without showing toasts initially', () => {
    render(<ToastProvider><div>child</div></ToastProvider>)
    expect(screen.getByText('child')).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('shows success toast with checkmark icon', async () => {
    renderWithProvider('success', 'Upload done!', 0)
    await act(async () => { screen.getByRole('button').click() })
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByTestId('toast-message')).toHaveTextContent('Upload done!')
    expect(screen.getByTestId('toast-icon-checkmark')).toBeInTheDocument()
  })

  it('shows error toast with cross icon', async () => {
    renderWithProvider('error', 'Something failed', 0)
    await act(async () => { screen.getByRole('button').click() })
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByTestId('toast-message')).toHaveTextContent('Something failed')
    expect(screen.getByTestId('toast-icon-cross')).toBeInTheDocument()
  })

  it('shows info toast with info icon', async () => {
    renderWithProvider('info', 'FYI message', 0)
    await act(async () => { screen.getByRole('button').click() })
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByTestId('toast-icon-info')).toBeInTheDocument()
  })

  it('shows base toast call as info type', async () => {
    renderWithProvider(null, 'Base toast', 0)
    await act(async () => { screen.getByRole('button').click() })
    expect(screen.getByTestId('toast-icon-info')).toBeInTheDocument()
  })

  it('can show multiple toasts', async () => {
    renderWithProvider('success', 'Toast', 0)
    await act(async () => { screen.getByRole('button').click() })
    await act(async () => { screen.getByRole('button').click() })
    expect(screen.getAllByRole('alert')).toHaveLength(2)
  })

  it('dismisses toast when clicked', async () => {
    renderWithProvider('success', 'Click to go', 0)
    await act(async () => { screen.getByRole('button').click() })
    const alert = screen.getByRole('alert')
    await act(async () => { alert.click() })
    // Starts exit animation (260ms), then removes from DOM
    await act(async () => { vi.advanceTimersByTime(300) })
    await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument())
  })

  it('auto-dismisses after custom duration', async () => {
    renderWithProvider('success', 'Short lived', 100)
    await act(async () => { screen.getByRole('button').click() })
    expect(screen.getByRole('alert')).toBeInTheDocument()
    await act(async () => { vi.advanceTimersByTime(100) })
    await act(async () => { vi.advanceTimersByTime(300) })
    await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument())
  })

  it('does not auto-dismiss when duration is 0', async () => {
    renderWithProvider('info', 'Stays around', 0)
    await act(async () => { screen.getByRole('button').click() })
    await act(async () => { vi.advanceTimersByTime(10000) })
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('error toast uses 5000ms default when no duration given', async () => {
    // Tests duration===undefined path for error type → ms=5000
    renderWithProvider('error', 'Error no duration')
    await act(async () => { screen.getByRole('button').click() })
    expect(screen.getByRole('alert')).toBeInTheDocument()
    // Advance past 5000ms + exit animation
    await act(async () => { vi.advanceTimersByTime(5400) })
    await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument())
  })

  it('success toast uses 4000ms default when no duration given', async () => {
    // Tests duration===undefined, type!=="error" path → ms=4000
    renderWithProvider('success', 'Success no duration')
    await act(async () => { screen.getByRole('button').click() })
    expect(screen.getByRole('alert')).toBeInTheDocument()
    await act(async () => { vi.advanceTimersByTime(4400) })
    await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument())
  })

  it('dismissing one of multiple toasts leaves others visible', async () => {
    // Tests the `: t` branch in dismiss's map (non-matching toasts returned unchanged)
    renderWithProvider('success', 'First', 0)
    await act(async () => { screen.getByRole('button').click() })
    await act(async () => { screen.getByRole('button').click() })
    const alerts = screen.getAllByRole('alert')
    expect(alerts).toHaveLength(2)
    await act(async () => { alerts[0].click() })
    await act(async () => { vi.advanceTimersByTime(300) })
    // Second toast should still be visible
    expect(screen.getAllByRole('alert')).toHaveLength(1)
  })

  it('throws when useToast is used outside ToastProvider', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    function BadComponent() {
      useToast()
      return null
    }
    expect(() => render(<BadComponent />)).toThrow('useToast must be used inside ToastProvider')
    consoleError.mockRestore()
  })
})
