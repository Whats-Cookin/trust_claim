import { render, screen, fireEvent } from '@testing-library/react'
import { useNavigate, useLocation } from 'react-router-dom'
import Navbar from './index'
import { vi } from 'vitest'

vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(),
  useLocation: vi.fn()
}))

describe('Navbar component', () => {
  it('should render correctly when authenticated', () => {
    const navigate = vi.fn()
    ;(useNavigate as jest.Mock).mockReturnValue(navigate)
    ;(useLocation as jest.Mock).mockReturnValue({ search: '' })

    render(
      <Navbar
        isAuth={true}
        toggleTheme={function (): void {
          throw new Error('Function not implemented.')
        }}
        isDarkMode={false}
        isSidebarOpen={false}
        setIsNavbarVisible={jest.fn()}
      />
    )
    const trustClaimsText = screen.getByText('Trust Claims')
    expect(trustClaimsText).toBeInTheDocument()

    const profileDropdown = screen.getByRole('button', { name: '' })
    expect(profileDropdown).toBeInTheDocument()

    fireEvent.click(profileDropdown)
    const logoutButton = screen.getByRole('button', { name: /logout/i })
    expect(logoutButton).toBeInTheDocument()
    fireEvent.click(logoutButton)

    expect(navigate).toHaveBeenCalledWith('/login')
  })

  it('should render correctly when not authenticated', () => {
    const navigate = vi.fn()
    ;(useNavigate as jest.Mock).mockReturnValue(navigate)
    ;(useLocation as jest.Mock).mockReturnValue({ search: '' })

    render(
      <Navbar
        isAuth={false}
        toggleTheme={function (): void {
          throw new Error('Function not implemented.')
        }}
        isDarkMode={false}
        isSidebarOpen={false}
        setIsNavbarVisible={jest.fn()}
      />
    )

    const trustClaimsText = screen.getAllByText(/trust claims/i)
    expect(trustClaimsText.length).toBeGreaterThan(0)

    const loginButton = screen.getByRole('button', { name: /login/i })
    expect(loginButton).toBeInTheDocument()

    fireEvent.click(loginButton)
    expect(navigate).toHaveBeenCalledWith('/login')

    const registerButton = screen.getByRole('button', { name: /register/i })
    expect(registerButton).toBeInTheDocument()

    fireEvent.click(registerButton)
    expect(navigate).toHaveBeenCalledWith('/register')
  })
})
