import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import ProfileDropdown from './index'
import { BrowserRouter } from 'react-router-dom'
import { describe, vi, it } from 'vitest'

describe('ProfileDropdown', () => {
  it('renders the menu button', () => {
    render(
      <BrowserRouter>
        <ProfileDropdown />
      </BrowserRouter>
    )

    const button = screen.getByRole('button', { name: /menu/i })
    expect(button).toBeInTheDocument()
  })

  it('opens the menu when the button is clicked', () => {
    render(
      <BrowserRouter>
        <ProfileDropdown />
      </BrowserRouter>
    )

    const button = screen.getByRole('button', { name: /menu/i })
    fireEvent.click(button)

    const searchButton = screen.getByRole('button', { name: /search/i })
    expect(searchButton).toBeInTheDocument()
  })

  it('navigates to the search page when the search button is clicked', () => {
    const mockNavigate = vi.fn()
    vi.mock('react-router-dom', () => ({
      ...vi.requireActual('react-router-dom'),
      useNavigate: () => mockNavigate
    }))

    render(
      <BrowserRouter>
        <ProfileDropdown />
      </BrowserRouter>
    )

    const button = screen.getByRole('button', { name: /menu/i })
    fireEvent.click(button)

    const searchButton = screen.getByRole('button', { name: /search/i })
    fireEvent.click(searchButton)

    expect(mockNavigate).toHaveBeenCalledWith('/search')
  })

  // it('logs out when the logout button is clicked', () => {
  //   const mockRemoveItem = vi.fn()
  //   global.localStorage = {
  //     removeItem: mockRemoveItem

  //   }

  const mockNavigate = vi.fn()
  vi.mock('react-router-dom', () => ({
    ...vi.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate
  }))

  render(
    <BrowserRouter>
      <ProfileDropdown />
    </BrowserRouter>
  )

  const button = screen.getByRole('button', { name: /menu/i })
  fireEvent.click(button)

  const logoutButton = screen.getByRole('button', { name: /logout/i })
  fireEvent.click(logoutButton)

  expect(mockRemoveItem).toHaveBeenCalledTimes(2)
  expect(mockNavigate).toHaveBeenCalledWith('/login')
})
//   })
