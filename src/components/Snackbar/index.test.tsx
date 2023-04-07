


import { render, screen, fireEvent, } from '@testing-library/react';
import Snackbar from './index';

describe('Snackbar component', () => {
  it('renders snackbar message when open', () => {
    const snackbarMessage = 'Test message';
    const toggleSnackbar = vi.fn();
    const { getByText } = render(
      <Snackbar isSnackbarOpen={true} snackbarMessage={snackbarMessage} toggleSnackbar={toggleSnackbar} />
    );
    expect(getByText(snackbarMessage)).toBeInTheDocument();
  });

  it('calls toggleSnackbar when snackbar is closed', () => {
    const toggleSnackbar = vi.fn();
    render(
      <Snackbar isSnackbarOpen={true} snackbarMessage="Test message" toggleSnackbar={toggleSnackbar} />
    );
    fireEvent.click(screen.getByRole('button'));
    expect(toggleSnackbar).toHaveBeenCalledWith(false);
  });
});
