import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import Navbar from './index';
import { Mock,vi} from 'vitest';

vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(),
  MemoryRouter: vi.fn(),
}));

describe('Navbar component', () => {

  it('should render correctly when authenticated', () => {
    const navigate = vi.fn();
    (useNavigate as Mock).mockReturnValue(navigate);

    // Mock the removeItem function from localStorage
    const removeItem = vi.spyOn(localStorage, 'removeItem');

    render(<Navbar isAuth={true} />);
    const trustClaimsText = screen.getByText('Trust Claims');
    expect(trustClaimsText).toBeInTheDocument();

    const profileDropdown = screen.getByRole('button', { name:"" });
    expect(profileDropdown).toBeInTheDocument();

    fireEvent.click(profileDropdown);
    const logoutButton = screen.getByRole('button', { name: /logout/i });
    expect(logoutButton).toBeInTheDocument();
    fireEvent.click(logoutButton);
  });


it('should render correctly when not authenticated', () => {
    const navigate = vi.fn();
    (useNavigate as  Mock).mockReturnValue(navigate);
    render(<Navbar isAuth={false} />);
  
    const trustClaimsText = screen.getAllByText('Trust Claims');
    expect(trustClaimsText.length).toBe(2);
  
    // const searchButton = screen.getByRole('button', { name: /search/i });
    // expect(searchButton).toBeInTheDocument();
  
    // fireEvent.click(searchButton);
    // expect(navigate).toHaveBeenCalledWith('/search');
  
    const loginButton = screen.getByRole('button', { name: /login/i });
    expect(loginButton).toBeInTheDocument();
  
    fireEvent.click(loginButton);
    expect(navigate).toHaveBeenCalledWith('/login');
  
    const registerButton = screen.getByRole('button', { name: /register/i });
    expect(registerButton).toBeInTheDocument();
  
    fireEvent.click(registerButton);
    expect(navigate).toHaveBeenCalledWith('/register');
  });
  

});