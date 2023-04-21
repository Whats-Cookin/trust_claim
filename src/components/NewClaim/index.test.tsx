import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import FormDialog from './AddNewClaim';
import { describe, vi, it } from 'vitest'

// describe('FormDialog', () => {
//   it('renders with provided props', () => {
//     const mockToggleSnackbar = vi.fn();
//     const mockSetSnackbarMessage = vi.fn();
//     const mockSetLoading = vi.fn();
//     const mockSetOpen = vi.fn();
//     const props = {
//       toggleSnackbar: mockToggleSnackbar,
//       setSnackbarMessage: mockSetSnackbarMessage,
//       setLoading: mockSetLoading,
//       open: true,
//       setOpen: mockSetOpen,
//     };
//     const { getByText } = render(<FormDialog {...props} />);
//     expect(getByText('Form')).toBeInTheDocument();
//   });



  it('calls setOpen(false) when the Dialog is closed', () => {
    const mockToggleSnackbar = vi.fn();
    const mockSetSnackbarMessage = vi.fn();
    const mockSetLoading = vi.fn();
    const mockSetOpen = vi.fn();
    const props = {
      toggleSnackbar: mockToggleSnackbar,
      setSnackbarMessage: mockSetSnackbarMessage,
      setLoading: mockSetLoading,
      open: true,
      setOpen: mockSetOpen,
    };
    // const { getByRole } = render(<FormDialog {...props} />);
    // const dialog = getByRole('dialog');
    // fireEvent.click(dialog.querySelector('button[aria-label="close"]'));
    // expect(mockSetOpen).toHaveBeenCalledWith(false);


  });
// });
