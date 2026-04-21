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

  test('submit opens mailto with endorsement link and does not create a claim', async () => {
    vi.mocked(api.getClaim).mockResolvedValue({ data: { claim: mockClaim } } as any)
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null)

    const claimUri = 'https://live.linkedtrust.us/claims/123'
    renderRequestEndorsementAt(`/request-endorsement?claim=${encodeURIComponent(claimUri)}`, commonProps)

    await waitFor(() => {
      expect(screen.getByLabelText(/What would you like to be endorsed for/i)).toBeInTheDocument()
    })

    fireEvent.change(screen.getByLabelText(/What would you like to be endorsed for/i), {
      target: { value: 'My project work' }
    })
    fireEvent.change(screen.getByPlaceholderText('name@example.com'), {
      target: { value: 'friend@example.com' }
    })

    fireEvent.click(screen.getByRole('button', { name: /Send endorsement request/i }))

    await waitFor(() => {
      expect(openSpy).toHaveBeenCalled()
    })

    const mailtoCall = openSpy.mock.calls.find(c => typeof c[0] === 'string' && (c[0] as string).startsWith('mailto:'))
    expect(mailtoCall).toBeDefined()
    const mailtoHref = mailtoCall![0] as string
    const bodyParam = new URL(mailtoHref).searchParams.get('body')
    expect(bodyParam).toBeTruthy()
    const decodedBody = decodeURIComponent(bodyParam!)
    expect(decodedBody).toContain('/endorse/123')
    expect(decodedBody).toMatch(/\/validate\?subject=/)
    expect(decodedBody).toContain(`${window.location.origin}/claims/123`)

    openSpy.mockRestore()
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
