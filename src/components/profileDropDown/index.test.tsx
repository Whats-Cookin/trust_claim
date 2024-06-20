import { render, fireEvent } from '@testing-library/react'
import ProfileDropdown from './index'
import { vi } from 'vitest'
import { useNavigate } from 'react-router-dom'

vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn()
}))

describe('ProfileDropdown component', () => {
  it('should render correctly', () => {
    const navigate = vi.fn()
    ;(useNavigate as jest.Mock).mockReturnValue(navigate)

    const { getByRole, getByText } = render(<ProfileDropdown isAuth={true} />)

    const menuButton = getByRole('button')
    expect(menuButton).toBeInTheDocument()

    fireEvent.click(menuButton)

    const searchButton = getByText(/Search/i)
    expect(searchButton).toBeInTheDocument()
    fireEvent.click(searchButton)
    expect(navigate).toHaveBeenCalledWith('/search')

    const createClaimButton = getByText(/Create Claim/i)
    expect(createClaimButton).toBeInTheDocument()
    fireEvent.click(createClaimButton)
    expect(navigate).toHaveBeenCalledWith('/claim')

    const logoutButton = getByText(/Logout/i)
    expect(logoutButton).toBeInTheDocument()
    fireEvent.click(logoutButton)
    expect(navigate).toHaveBeenCalledWith('/login')
  })
})
