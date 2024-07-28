import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Footer from './index'
import { vi } from 'vitest'
import { useTheme, useMediaQuery } from '@mui/material'

// Mocking useTheme and useMediaQuery
vi.mock('@mui/material', async () => {
  const actual = await vi.importActual<typeof import('@mui/material')>('@mui/material')
  return {
    ...actual,
    useTheme: vi.fn(),
    useMediaQuery: vi.fn()
  }
})

describe('Footer component', () => {
  it('should render correctly', () => {
    // Mock the useTheme and useMediaQuery hooks
    ;(useTheme as jest.Mock).mockReturnValue({
      breakpoints: { down: vi.fn().mockReturnValue('md') }
    })
    ;(useMediaQuery as jest.Mock).mockReturnValue(false)

    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    )

    const footerText = screen.getByText(`© ${new Date().getFullYear()} LinkedTrust`)
    expect(footerText).toBeInTheDocument()

    const termsLink = screen.getByText('Terms of Service')
    expect(termsLink).toBeInTheDocument()
    expect(termsLink.closest('a')).toHaveAttribute('href', '/terms')

    const privacyLink = screen.getByText('Privacy Policy')
    expect(privacyLink).toBeInTheDocument()
    expect(privacyLink.closest('a')).toHaveAttribute('href', '/privacy')

    const cookieLink = screen.getByText('Cookie Policy')
    expect(cookieLink).toBeInTheDocument()
    expect(cookieLink.closest('a')).toHaveAttribute('href', '/cookie')
  })

  it('should center content on small screens', () => {
    // Mock the useTheme and useMediaQuery hooks
    ;(useTheme as jest.Mock).mockReturnValue({
      breakpoints: { down: vi.fn().mockReturnValue('md') }
    })
    ;(useMediaQuery as jest.Mock).mockReturnValue(true)

    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    )

    const footerBox = screen.getByTestId('footer-box')
    expect(footerBox).toHaveStyle({ justifyContent: 'center' })
  })

  it('should space between content on large screens', () => {
    // Mock the useTheme and useMediaQuery hooks
    ;(useTheme as jest.Mock).mockReturnValue({
      breakpoints: { down: vi.fn().mockReturnValue('md') }
    })
    ;(useMediaQuery as jest.Mock).mockReturnValue(false)

    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    )

    const footerBox = screen.getByTestId('footer-box')
    expect(footerBox).toHaveStyle({ justifyContent: 'space-between' })
  })
})
