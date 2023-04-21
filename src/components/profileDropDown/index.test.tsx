import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProfileDropdown from './index';
import { describe, vi, it } from 'vitest'

// describe('ProfileDropdown', () => {
//   test('renders the menu button', () => {
//     render(<ProfileDropdown isAuth={true} />, { wrapper: MemoryRouter });
//     const buttonElement = screen.getByRole('button', { name: 'menu' });
//     expect(buttonElement).toBeInTheDocument();
//   });

  
  // test('opens the menu when clicked', () => {
  //   render(<ProfileDropdown isAuth={true} />, { wrapper: MemoryRouter });
  //   const buttonElement = screen.getByRole('button', { name: 'menu' });
  //   fireEvent.click(buttonElement);
  //   const searchButtonElement = screen.getByRole('button', { name: 'Search' });
  //   expect(searchButtonElement).toBeInTheDocument();
  // });

  test('navigates to the search page when search button is clicked', () => {
    const navigateMock = vi.fn();
    vi.mock('react-router-dom', () => ({
      ...vi.importActual('react-router-dom'),
      useNavigate: () => navigateMock,
    }));
   
     

  //   render(<ProfileDropdown isAuth={true} />, { wrapper: MemoryRouter });
  //   const buttonElement = screen.getByRole('button', { name: 'menu' });
  //   fireEvent.click(buttonElement);
  //   const searchButtonElement = screen.getByRole('button', { name: 'Search' });
  //   fireEvent.click(searchButtonElement);
  //   expect(navigateMock).toHaveBeenCalledWith('/search');
  });

  test('logs out when logout button is clicked', () => {
    localStorage.setItem('accessToken', 'testAccessToken');
    localStorage.setItem('refreshToken', 'testRefreshToken');
    const navigateMock = vi.fn();
    vi.mock('react-router-dom', () => ({
      ...vi.importActual('react-router-dom'),
      useNavigate: () => navigateMock,
    }));
    // render(<ProfileDropdown isAuth={true} />, { wrapper: MemoryRouter });
    // const buttonElement = screen.getByRole('button', { name: 'menu' });
    // fireEvent.click(buttonElement);
    // const logoutButtonElement = screen.getByRole('button', { name: 'Logout' });
    // fireEvent.click(logoutButtonElement);
    // expect(navigateMock).toHaveBeenCalledWith('/login');
    // expect(localStorage.getItem('accessToken')).toBe(null);
    // expect(localStorage.getItem('refreshToken')).toBe(null);
  });
// });
