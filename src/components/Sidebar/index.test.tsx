import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, useNavigate } from 'react-router-dom'
import Sidebar from './index'
import { vi } from 'vitest'

vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn()
}))

describe('Sidebar component', () => {
  const toggleSidebar = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render correctly when authenticated', () => {
    const navigate = vi.fn()
    ;(useNavigate as jest.Mock).mockReturnValue(navigate)

    render(
      <MemoryRouter>
        <Sidebar isAuth={true} isOpen={true} toggleSidebar={toggleSidebar} toggleTheme={function (): void {
          throw new Error('Function not implemented.')
        } } isDarkMode={false} />
      </MemoryRouter>
    )

    const homeButton = screen.getByText('Home')
    expect(homeButton).toBeInTheDocument()

    const exploreButton = screen.getByText('Explore')
    expect(exploreButton).toBeInTheDocument()

    const createButton = screen.getByText('Create Claim')
    expect(createButton).toBeInTheDocument()

    const searchButton = screen.getByText('Search')
    expect(searchButton).toBeInTheDocument()

    const logoutButton = screen.getByText('Logout')
    expect(logoutButton).toBeInTheDocument()

    fireEvent.click(logoutButton)
    expect(navigate).toHaveBeenCalledWith('/login')
  })

  it('should render correctly when not authenticated', () => {
    const navigate = vi.fn()
    ;(useNavigate as jest.Mock).mockReturnValue(navigate)

    render(
      <MemoryRouter>
        <Sidebar isAuth={false} isOpen={true} toggleSidebar={toggleSidebar} toggleTheme={function (): void {
          throw new Error('Function not implemented.')
        } } isDarkMode={false} />
      </MemoryRouter>
    )

    const homeButton = screen.getByText('Home')
    expect(homeButton).toBeInTheDocument()

    const exploreButton = screen.getByText('Explore')
    expect(exploreButton).toBeInTheDocument()

    const loginButton = screen.getByText('Login')
    expect(loginButton).toBeInTheDocument()

    const registerButton = screen.getByText('Register')
    expect(registerButton).toBeInTheDocument()

    fireEvent.click(loginButton)
    expect(navigate).toHaveBeenCalledWith('/login')

    fireEvent.click(registerButton)
    expect(navigate).toHaveBeenCalledWith('/register')
  })

  it('should call toggleSidebar when ArrowBack button is clicked', () => {
    render(
      <MemoryRouter>
        <Sidebar isAuth={false} isOpen={true} toggleSidebar={toggleSidebar} toggleTheme={function (): void {
          throw new Error('Function not implemented.')
        } } isDarkMode={false} />
      </MemoryRouter>
    )

    const arrowBackButton = screen.getByRole('button', { name: /arrowback/i })
    expect(arrowBackButton).toBeInTheDocument()

    fireEvent.click(arrowBackButton)
    expect(toggleSidebar).toHaveBeenCalledTimes(1)
  })
})
