import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Sidebar from './index'
import { vi, beforeEach, describe, it, expect } from 'vitest'

// `var` so the mock factory (hoisted) can assign before TDZ issues with `let`/`const`.
var mockNavigate: ReturnType<typeof vi.fn>

vi.mock('react-router-dom', async importOriginal => {
  const actual = await importOriginal<typeof import('react-router-dom')>()
  mockNavigate = vi.fn()
  return {
    ...actual,
    useNavigate: () => mockNavigate
  }
})

describe('Sidebar component', () => {
  const toggleSidebar = vi.fn()
  const toggleTheme = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    // Desktop sidebar (not BottomNav): `down('md')` must not match.
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: vi.fn().mockImplementation(() => ({
        matches: false,
        media: '',
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn()
      }))
    })
  })

  it('should render correctly when authenticated', () => {
    render(
      <MemoryRouter>
        <Sidebar
          isAuth={true}
          isOpen={true}
          toggleSidebar={toggleSidebar}
          toggleTheme={toggleTheme}
          isDarkMode={true}
          isNavbarVisible={true}
        />
      </MemoryRouter>
    )

    const homeButton = screen.getByText('Home')
    expect(homeButton).toBeInTheDocument()

    const createButton = screen.getByText('Claim')
    expect(createButton).toBeInTheDocument()

    const logoutButton = screen.getByText('Log out')
    expect(logoutButton).toBeInTheDocument()

    fireEvent.click(logoutButton)
    expect(mockNavigate).toHaveBeenCalledWith('/login')
  })

  it('should render correctly when not authenticated', () => {
    render(
      <MemoryRouter>
        <Sidebar
          isAuth={false}
          isOpen={true}
          toggleSidebar={toggleSidebar}
          toggleTheme={toggleTheme}
          isDarkMode={true}
          isNavbarVisible={true}
        />
      </MemoryRouter>
    )

    const homeButton = screen.getByText('Home')
    expect(homeButton).toBeInTheDocument()

    const loginButton = screen.getByText('Login')
    expect(loginButton).toBeInTheDocument()

    expect(screen.getByRole('button', { name: /endorse us/i })).toBeInTheDocument()

    fireEvent.click(loginButton)
    expect(mockNavigate).toHaveBeenCalledWith('/login')
  })

  it('should call toggleSidebar when ArrowBack button is clicked', () => {
    render(
      <MemoryRouter>
        <Sidebar
          isAuth={false}
          isOpen={true}
          toggleSidebar={toggleSidebar}
          toggleTheme={toggleTheme}
          isDarkMode={true}
          isNavbarVisible={true}
        />
      </MemoryRouter>
    )

    const arrowBackButton = screen.getByRole('button', { name: /close/i })
    expect(arrowBackButton).toBeInTheDocument()

    fireEvent.click(arrowBackButton)
    expect(toggleSidebar).toHaveBeenCalledTimes(1)
  })
})
