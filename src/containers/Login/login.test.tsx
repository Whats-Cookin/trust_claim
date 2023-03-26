// import React from 'react';
// import { render, fireEvent, screen } from '@testing-library/react';
// import { expect, describe, it, afterEach,test } from 'vitest';
// import Login from './index';

// describe('Login component', () => {
//   test('renders email and password fields', () => {
//     render(<Login />);
//     const emailInput = screen.getByLabelText('Email');
//     const passwordInput = screen.getByLabelText('Password');
//     expect(emailInput).toBeInTheDocument();
//     expect(passwordInput).toBeInTheDocument();
//   });

//   test('clicking login button with empty fields shows error message', () => {
//     render(<Login />);
//     const loginButton = screen.getByRole('button', { name: /log in/i });
//     fireEvent.click(loginButton);
//     const errorMessage = screen.getByText(/both email and password are required fields/i);
//     expect(errorMessage).toBeInTheDocument();
//   });

//   test('clicking Metamask login button shows Metamask popup', async () => {
//     window.ethereum = { request: jest.fn(() => Promise.resolve(['0x1234'])) };
//     render(<Login />);
//     const metamaskButton = screen.getByRole('button', { name: /log in with metamask/i });
//     fireEvent.click(metamaskButton);
//     expect(window.ethereum.request).toHaveBeenCalled();
//   });

//   test('clicking Ethereum login link redirects to Metamask install page', () => {
//     render(<Login />);
//     const ethereumLoginLink = screen.getByText(/install metamask/i);
//     fireEvent.click(ethereumLoginLink);
//     expect(window.location.href).toBe('https://metamask.io/');
//   });
// });
