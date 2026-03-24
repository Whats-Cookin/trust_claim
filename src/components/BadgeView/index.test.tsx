import { render, screen } from '@testing-library/react'
import { describe, test, expect, vi } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import BadgeView from './index'

// Mock VideoBadge component
vi.mock('../VideoBadge', () => ({
  default: ({ claimUri, compact, theme }: any) => (
    <div data-testid='video-badge' data-claim={claimUri} data-compact={compact} data-theme={theme}>
      VideoBadge Mock
    </div>
  )
}))

// Helper to render with router
const renderWithRouter = (ui: React.ReactElement, { route = '/' } = {}) => {
  window.history.pushState({}, 'Test page', route)
  return render(ui, { wrapper: BrowserRouter })
}

describe('BadgeView', () => {
  test('shows error when claim parameter is missing', () => {
    renderWithRouter(<BadgeView />, { route: '/badge' })
    expect(screen.getByText(/Missing claim parameter/i)).toBeInTheDocument()
  })

  test('renders VideoBadge with claim URI', () => {
    const claimUri = 'https://live.linkedtrust.us/claims/123'
    renderWithRouter(<BadgeView />, { route: `/badge?claim=${encodeURIComponent(claimUri)}` })

    const badge = screen.getByTestId('video-badge')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveAttribute('data-claim', claimUri)
  })

  test('passes compact parameter to VideoBadge', () => {
    const claimUri = 'https://live.linkedtrust.us/claims/123'
    renderWithRouter(<BadgeView />, { route: `/badge?claim=${encodeURIComponent(claimUri)}&compact=true` })

    const badge = screen.getByTestId('video-badge')
    expect(badge).toHaveAttribute('data-compact', 'true')
  })

  test('passes theme parameter to VideoBadge', () => {
    const claimUri = 'https://live.linkedtrust.us/claims/123'
    renderWithRouter(<BadgeView />, { route: `/badge?claim=${encodeURIComponent(claimUri)}&theme=dark` })

    const badge = screen.getByTestId('video-badge')
    expect(badge).toHaveAttribute('data-theme', 'dark')
  })

  test('defaults to light theme when not specified', () => {
    const claimUri = 'https://live.linkedtrust.us/claims/123'
    renderWithRouter(<BadgeView />, { route: `/badge?claim=${encodeURIComponent(claimUri)}` })

    const badge = screen.getByTestId('video-badge')
    expect(badge).toHaveAttribute('data-theme', 'light')
  })

  test('defaults to compact=false when not specified', () => {
    const claimUri = 'https://live.linkedtrust.us/claims/123'
    renderWithRouter(<BadgeView />, { route: `/badge?claim=${encodeURIComponent(claimUri)}` })

    const badge = screen.getByTestId('video-badge')
    expect(badge).toHaveAttribute('data-compact', 'false')
  })
})
