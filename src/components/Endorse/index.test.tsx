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
    effectiveDate: '2026-02-14'
  }

  const mockReportResponse = {
    claim: mockClaim,
    validations: [],
    summary: { totalValidations: 0, averageConfidence: 0, consensusValid: false }
  }

  const commonProps = {
    toggleSnackbar: vi.fn(),
    setSnackbarMessage: vi.fn(),
    setLoading: vi.fn(),
    /** Avoid mounting QuickAuth banner (GoogleLogin requires GoogleOAuthProvider in tests). */
    isAuthenticated: true
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('shows video suggestion alert when video=true parameter is present', async () => {
    vi.mocked(api.getClaim).mockResolvedValue({ data: { claim: mockClaim } } as any)
    vi.mocked(api.getClaimReport).mockResolvedValue({ data: mockReportResponse } as any)

    const claimUri = 'https://live.linkedtrust.us/claims/123'
    renderWithRouter(<Endorse {...commonProps} />, {
      route: `/endorse?claim=${encodeURIComponent(claimUri)}&video=true`
    })

    await waitFor(() => {
      expect(screen.getByText(/A video endorsement would be especially valuable/i)).toBeInTheDocument()
    })
  })

  test('does not show video suggestion alert when video parameter is missing', async () => {
    vi.mocked(api.getClaim).mockResolvedValue({ data: { claim: mockClaim } } as any)
    vi.mocked(api.getClaimReport).mockResolvedValue({ data: mockReportResponse } as any)

    const claimUri = 'https://live.linkedtrust.us/claims/123'
    renderWithRouter(<Endorse {...commonProps} />, {
      route: `/endorse?claim=${encodeURIComponent(claimUri)}`
    })

    await waitFor(() => {
      expect(screen.getByText(/Endorse This Claim/i)).toBeInTheDocument()
    })

    expect(screen.queryByText(/A video endorsement would be especially valuable/i)).not.toBeInTheDocument()
  })

  test('works with subject parameter (backward compatibility)', async () => {
    vi.mocked(api.getClaim).mockResolvedValue({ data: { claim: mockClaim } } as any)
    vi.mocked(api.getClaimReport).mockResolvedValue({ data: mockReportResponse } as any)

    const claimUri = 'https://live.linkedtrust.us/claims/123'
    renderWithRouter(<Endorse {...commonProps} />, {
      route: `/endorse?subject=${encodeURIComponent(claimUri)}`
    })

    await waitFor(() => {
      expect(screen.getByText(/Endorse This Claim/i)).toBeInTheDocument()
    })
  })
})
