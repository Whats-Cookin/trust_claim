import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Navbar from './index'
import { vi, describe, it, expect, beforeEach } from 'vitest'

var mockNavigate: ReturnType<typeof vi.fn>

vi.mock('react-router-dom', async importOriginal => {
  const actual = await importOriginal<typeof import('react-router-dom')>()
  mockNavigate = vi.fn()
  return {
    ...actual,
    useNavigate: () => mockNavigate
  }
})

vi.mock('../../utils/web3Auth', async importOriginal => {
  const actual = await importOriginal<typeof import('../../utils/web3Auth')>()
  return {
    ...actual,
    hasIdentity: () => true
  }
})

vi.mock('../IdentityManager', () => ({
  IdentityButton: () => (
    <button type='button' aria-label='Logout' onClick={() => mockNavigate('/login')}>
      Logout
    </button>
  )
}))

describe('Navbar component', () => {
  beforeEach(() => {
    mockNavigate.mockClear()
  })

  it('should render correctly when authenticated', () => {
    const setIsNavbarVisible = vi.fn()

    render(
      <MemoryRouter>
        <Navbar
          isAuth={true}
          toggleTheme={function (): void {
            throw new Error('Function not implemented.')
          }}
          isDarkMode={false}
          isSidebarOpen={false}
          setIsNavbarVisible={setIsNavbarVisible}
        />
      </MemoryRouter>
    )
    const trustClaimsText = screen.getByText('Linked Trust')
    expect(trustClaimsText).toBeInTheDocument()

    const logoutButton = screen.getByRole('button', { name: /logout/i })
    expect(logoutButton).toBeInTheDocument()
    fireEvent.click(logoutButton)

    expect(mockNavigate).toHaveBeenCalledWith('/login')
  })

  it('should render correctly when not authenticated', () => {
    const setIsNavbarVisible = vi.fn()

    render(
      <MemoryRouter>
        <Navbar
          isAuth={false}
          toggleTheme={function (): void {
            throw new Error('Function not implemented.')
          }}
          isDarkMode={false}
          isSidebarOpen={false}
          setIsNavbarVisible={setIsNavbarVisible}
        />
      </MemoryRouter>
    )

    expect(screen.getByText(/Linked Trust/i)).toBeInTheDocument()

    const loginButton = screen.getByRole('button', { name: /login/i })
    expect(loginButton).toBeInTheDocument()

    fireEvent.click(loginButton)
    expect(mockNavigate).toHaveBeenCalledWith('/login')
  })
})
