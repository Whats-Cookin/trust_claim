import { render, screen, waitFor } from '@testing-library/react'
import { describe, test, expect, vi, beforeEach } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import Endorse from './index'
import * as api from '../../api'

// Mock the API module
vi.mock('../../api', () => ({
  getClaim: vi.fn(),
  getClaimReport: vi.fn()
}))

// Mock settings
vi.mock('../../utils/settings', () => ({
  BACKEND_BASE_URL: 'https://test.linkedtrust.us/api'
}))

// Helper to render with router
const renderWithRouter = (ui: React.ReactElement, { route = '/' } = {}) => {
  window.history.pushState({}, 'Test page', route)
  return render(ui, { wrapper: BrowserRouter })
}

describe('Endorse Component', () => {
  const mockClaim = {
    id: 123,
    claim: 'ACHIEVEMENT',
    statement: 'Completed the project successfully',
    subject: 'https://example.com/person/john',
    issuer: {
      name: 'John Doe',
      image: 'https://example.com/avatar.jpg'
    }
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('shows video suggestion alert when video=true parameter is present', async () => {
    vi.mocked(api.getClaim).mockResolvedValue({ data: { claim: mockClaim } })
    vi.mocked(api.getClaimReport).mockResolvedValue({ data: { validations: [] } })

    const claimUri = 'https://live.linkedtrust.us/claims/123'
    renderWithRouter(<Endorse />, {
      route: `/endorse?claim=${encodeURIComponent(claimUri)}&video=true`
    })

    await waitFor(() => {
      expect(screen.getByText(/A video endorsement would be especially valuable/i)).toBeInTheDocument()
    })
  })

  test('does not show video suggestion alert when video parameter is missing', async () => {
    vi.mocked(api.getClaim).mockResolvedValue({ data: { claim: mockClaim } })
    vi.mocked(api.getClaimReport).mockResolvedValue({ data: { validations: [] } })

    const claimUri = 'https://live.linkedtrust.us/claims/123'
    renderWithRouter(<Endorse />, {
      route: `/endorse?claim=${encodeURIComponent(claimUri)}`
    })

    await waitFor(() => {
      expect(screen.getByText(/Endorse This Claim/i)).toBeInTheDocument()
    })

    expect(screen.queryByText(/A video endorsement would be especially valuable/i)).not.toBeInTheDocument()
  })

  test('shows friendly header with issuer name', async () => {
    vi.mocked(api.getClaim).mockResolvedValue({ data: { claim: mockClaim } })
    vi.mocked(api.getClaimReport).mockResolvedValue({ data: { validations: [] } })

    const claimUri = 'https://live.linkedtrust.us/claims/123'
    renderWithRouter(<Endorse />, {
      route: `/endorse?claim=${encodeURIComponent(claimUri)}`
    })

    await waitFor(() => {
      expect(screen.getByText(/John Doe has requested your endorsement/i)).toBeInTheDocument()
    })
  })

  test('works with subject parameter (backward compatibility)', async () => {
    vi.mocked(api.getClaim).mockResolvedValue({ data: { claim: mockClaim } })
    vi.mocked(api.getClaimReport).mockResolvedValue({ data: { validations: [] } })

    const claimUri = 'https://live.linkedtrust.us/claims/123'
    renderWithRouter(<Endorse />, {
      route: `/endorse?subject=${encodeURIComponent(claimUri)}`
    })

    await waitFor(() => {
      expect(screen.getByText(/Endorse This Claim/i)).toBeInTheDocument()
    })
  })

  test('shows default header when issuer name is missing', async () => {
    const claimNoIssuer = { ...mockClaim, issuer: {} }
    vi.mocked(api.getClaim).mockResolvedValue({ data: { claim: claimNoIssuer } })
    vi.mocked(api.getClaimReport).mockResolvedValue({ data: { validations: [] } })

    const claimUri = 'https://live.linkedtrust.us/claims/123'
    renderWithRouter(<Endorse />, {
      route: `/endorse?claim=${encodeURIComponent(claimUri)}`
    })

    await waitFor(() => {
      expect(screen.getByText(/Endorse This Claim/i)).toBeInTheDocument()
    })
  })
})
