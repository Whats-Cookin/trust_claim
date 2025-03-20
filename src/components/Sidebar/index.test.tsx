import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, useNavigate } from 'react-router-dom'
import Sidebar from './index'
import { vi } from 'vitest'

vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn()
}))

describe('Sidebar component', () => {
  const toggleSidebar = vi.fn()
  const toggleTheme = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render correctly when authenticated', () => {
    const navigate = vi.fn()
    ;(useNavigate as jest.Mock).mockReturnValue(navigate)

    render(
      <MemoryRouter>
        <Sidebar
          isAuth={true}
       
          toggleTheme={toggleTheme}
          isDarkMode={true}
          isNavbarVisible={true}
        />
      </MemoryRouter>
    )

    const homeButton = screen.getByText('Home')
    expect(homeButton).toBeInTheDocument()

    /* // what we had a search, we do NOT want, just explore from graph
   // we may LATER add a real search of advanced filters for the feed
    const searchButton = screen.getByText('Search')
    expect(searchButton).toBeInTheDocument()
*/

    const createButton = screen.getByText('Claim')
    expect(createButton).toBeInTheDocument()

    const logoutButton = screen.getByText('Log out')
    expect(logoutButton).toBeInTheDocument()

    fireEvent.click(logoutButton)
    expect(navigate).toHaveBeenCalledWith('/login')
  })

  it('should render correctly when not authenticated', () => {
    const navigate = vi.fn()
    ;(useNavigate as jest.Mock).mockReturnValue(navigate)

    render(
      <MemoryRouter>
        <Sidebar isAuth={false} isDarkMode={true} isNavbarVisible={true} toggleTheme={function (): void {
          throw new Error('Function not implemented.')
        } } />
      </MemoryRouter>
    )

    const homeButton = screen.getByText('Home')
    expect(homeButton).toBeInTheDocument()

    /*    const searchButton = screen.getByText('Search')
    expect(searchButton).toBeInTheDocument()
*/

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
        <Sidebar isAuth={false} toggleTheme={toggleTheme} isDarkMode={true} isNavbarVisible={true} />
      </MemoryRouter>
    )

    const arrowBackButton = screen.getByRole('button', { name: /keyboarddoublearrowleft/i })
    expect(arrowBackButton).toBeInTheDocument()

    fireEvent.click(arrowBackButton)
    expect(toggleSidebar).toHaveBeenCalledTimes(1)
  })
})
