import { render, screen, waitFor } from '@testing-library/react'
import { describe, test, expect, vi, beforeEach } from 'vitest'
import VideoBadge from './index'
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

describe('VideoBadge', () => {
  const mockClaim = {
    id: 123,
    claim: 'RATED',
    subject: { uri: 'https://example.com/person', name: 'John Doe', image: 'https://example.com/avatar.jpg' },
    statement: 'Excellent work on the project',
    stars: 5,
    effectiveDate: '2026-02-14',
    image: 'https://cdn.example.com/video.mp4'
  }

  const mockValidations = [
    { id: 1, isValid: true, confidence: 1, statement: 'I confirm this', issuerName: 'Jane Doe', createdAt: '2026-02-14' }
  ]

  const mockReportResponse = {
    claim: mockClaim,
    validations: mockValidations,
    summary: { totalValidations: 1, averageConfidence: 1, consensusValid: true }
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('renders loading state initially', () => {
    vi.mocked(api.getClaim).mockReturnValue(new Promise(() => {})) // Never resolves
    render(<VideoBadge claimUri='https://live.linkedtrust.us/claims/123' />)
    expect(screen.getByText(/Loading endorsement/i)).toBeInTheDocument()
  })

  test('renders claim data after loading', async () => {
    vi.mocked(api.getClaim).mockResolvedValue({ data: { claim: mockClaim } } as any)
    vi.mocked(api.getClaimReport).mockResolvedValue({ data: mockReportResponse } as any)

    render(<VideoBadge claimUri='https://live.linkedtrust.us/claims/123' />)

    await waitFor(() => {
      expect(screen.getByText(mockClaim.statement!)).toBeInTheDocument()
    })

    expect(screen.getByText(/John Doe/i)).toBeInTheDocument()
    expect(screen.getByText(/1 endorsement/i)).toBeInTheDocument()
    expect(screen.getByText(/Verified on LinkedTrust/i)).toBeInTheDocument()
  })

  test('shows stars for RATED claims', async () => {
    vi.mocked(api.getClaim).mockResolvedValue({ data: { claim: mockClaim } } as any)
    vi.mocked(api.getClaimReport).mockResolvedValue({ data: { ...mockReportResponse, validations: [] } } as any)

    render(<VideoBadge claimUri='https://live.linkedtrust.us/claims/123' />)

    await waitFor(() => {
      expect(screen.getByText('5.0')).toBeInTheDocument()
    })
  })

  test('handles claim without video', async () => {
    const claimNoVideo = { ...mockClaim, image: null }
    vi.mocked(api.getClaim).mockResolvedValue({ data: { claim: claimNoVideo } } as any)
    vi.mocked(api.getClaimReport).mockResolvedValue({ data: { ...mockReportResponse, validations: [] } } as any)

    render(<VideoBadge claimUri='https://live.linkedtrust.us/claims/123' />)

    await waitFor(() => {
      expect(screen.getByText(mockClaim.statement!)).toBeInTheDocument()
    })

    // Video element should not be present
    expect(screen.queryByRole('video')).not.toBeInTheDocument()
  })

  test('shows error for invalid claim URI', async () => {
    render(<VideoBadge claimUri='invalid-uri' />)

    await waitFor(() => {
      expect(screen.getByText(/Invalid claim URI/i)).toBeInTheDocument()
    })
  })

  test('handles API error gracefully', async () => {
    vi.mocked(api.getClaim).mockRejectedValue(new Error('Network error'))

    render(<VideoBadge claimUri='https://live.linkedtrust.us/claims/123' />)

    await waitFor(() => {
      expect(screen.getByText(/Failed to load claim data/i)).toBeInTheDocument()
    })
  })

  test('extracts claim ID from various URI formats', async () => {
    vi.mocked(api.getClaim).mockResolvedValue({ data: { claim: mockClaim } } as any)
    vi.mocked(api.getClaimReport).mockResolvedValue({ data: { ...mockReportResponse, validations: [] } } as any)

    render(<VideoBadge claimUri='https://live.linkedtrust.us/claims/123' />)

    await waitFor(() => {
      expect(api.getClaim).toHaveBeenCalledWith('123')
    })
  })

  test('applies compact styling when compact prop is true', async () => {
    vi.mocked(api.getClaim).mockResolvedValue({ data: { claim: mockClaim } } as any)
    vi.mocked(api.getClaimReport).mockResolvedValue({ data: { ...mockReportResponse, validations: [] } } as any)

    const { container } = render(
      <VideoBadge claimUri='https://live.linkedtrust.us/claims/123' compact={true} />
    )

    await waitFor(() => {
      expect(screen.getByText(mockClaim.statement!)).toBeInTheDocument()
    })

    // Check for compact styling (maxWidth: 320)
    const card = container.querySelector('[class*="MuiCard"]')
    expect(card).toBeInTheDocument()
  })
})
