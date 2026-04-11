import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { describe, test, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import RequestEndorsement from './index'
import * as api from '../../api'

vi.mock('../../api', () => ({
  getClaim: vi.fn(),
  getClaimReport: vi.fn()
}))

vi.mock('../../utils/settings', () => ({
  BACKEND_BASE_URL: 'https://test.linkedtrust.us/api'
}))

const defaultProps = {
  toggleSnackbar: vi.fn(),
  setSnackbarMessage: vi.fn(),
  setLoading: vi.fn()
}

function renderRequestEndorsementAt(path: string, props = defaultProps) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path='/request-endorsement/:claimId' element={<RequestEndorsement {...props} />} />
        <Route path='/request-endorsement' element={<RequestEndorsement {...props} />} />
      </Routes>
    </MemoryRouter>
  )
}

describe('RequestEndorsement', () => {
  const mockClaim = {
    id: 123,
    claim: 'ACHIEVEMENT',
    statement: 'Completed the project successfully',
    subject: 'https://example.com/person/john',
    effectiveDate: '2026-02-14'
  }

  const commonProps = defaultProps

  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('path /request-endorsement/:claimId loads and shows request flow', async () => {
    vi.mocked(api.getClaim).mockResolvedValue({ data: { claim: mockClaim } } as any)

    renderRequestEndorsementAt('/request-endorsement/123', commonProps)

    await waitFor(() => {
      expect(screen.getByText(/Request an Endorsement/i)).toBeInTheDocument()
    })
  })

  test('query claim= works on /request-endorsement', async () => {
    vi.mocked(api.getClaim).mockResolvedValue({ data: { claim: mockClaim } } as any)

    const claimUri = 'https://live.linkedtrust.us/claims/123'
    renderRequestEndorsementAt(`/request-endorsement?claim=${encodeURIComponent(claimUri)}`, commonProps)

    await waitFor(() => {
      expect(screen.getByText(/Request an Endorsement/i)).toBeInTheDocument()
    })
  })

  test('does not auto-expand video when video=true in URL', async () => {
    vi.mocked(api.getClaim).mockResolvedValue({ data: { claim: mockClaim } } as any)

    const claimUri = 'https://live.linkedtrust.us/claims/123'
    renderRequestEndorsementAt(`/request-endorsement?claim=${encodeURIComponent(claimUri)}&video=true`, commonProps)

    await waitFor(() => {
      expect(screen.getByText(/Request an Endorsement/i)).toBeInTheDocument()
    })

    expect(screen.queryByText(/record a video testimonial/i)).not.toBeInTheDocument()
  })

  test('opens inline video recorder when user clicks the video thumbnail', async () => {
    vi.mocked(api.getClaim).mockResolvedValue({ data: { claim: mockClaim } } as any)

    const claimUri = 'https://live.linkedtrust.us/claims/123'
    renderRequestEndorsementAt(`/request-endorsement?claim=${encodeURIComponent(claimUri)}`, commonProps)

    await waitFor(() => {
      expect(screen.getByText(/Request an Endorsement/i)).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: /add or manage video endorsement/i }))

    await waitFor(() => {
      expect(screen.getByText(/record a video testimonial/i)).toBeInTheDocument()
    })
  })

  test('subject query param is supported like legacy endorse', async () => {
    vi.mocked(api.getClaim).mockResolvedValue({ data: { claim: mockClaim } } as any)

    const claimUri = 'https://live.linkedtrust.us/claims/123'
    renderRequestEndorsementAt(`/request-endorsement?subject=${encodeURIComponent(claimUri)}`, commonProps)

    await waitFor(() => {
      expect(screen.getByText(/Request an Endorsement/i)).toBeInTheDocument()
    })
  })
})
