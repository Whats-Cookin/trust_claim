import { render, screen, fireEvent  } from '@testing-library/react';
import { test, expect } from 'vitest';
import Form from './index';
import axios from "axios";
// import { mockAxios, mock } from "../../mocks/axios";
import { mockAxios, mock } from "../../../mocks/axios";
import MockAdapter from "axios-mock-adapter";

const mockFunction = (): any => {
    // return a mock value here
  }
  
test('Form', () => {
    let mockToggleSnackbar = mockFunction();
    let mockSetSnackbarMessage = mockFunction();
    let mockSetLoading = mockFunction();
    

  test('submission with subject and claim', async () => {
    const { getByLabelText, getByText } = render(
      <Form
        toggleSnackbar={mockToggleSnackbar}
        setSnackbarMessage={mockSetSnackbarMessage}
        setLoading={mockSetLoading}
      />
    );

    const subjectInput = getByLabelText(/subject/i);
    const claimInput = getByLabelText(/claim/i);
    const submitButton = getByText(/submit/i);

    fireEvent.change(subjectInput, { target: { value: 'Test subject' } });
    fireEvent.change(claimInput, { target: { value: 'Test claim' } });
    fireEvent.click(submitButton);

    // Assert that the loading state is set to true
    expect(mockSetLoading).toHaveBeenCalledWith(true);

    // Assert that the API call is made with the correct data
    expect(mockAxios.post).toHaveBeenCalledWith(
      '/api/claim',
      expect.objectContaining({
      subject: "test subject",
      claim: "test claim",
      object: "",
      statement: "",
      aspect: "",
      howKnown: "",
      sourceURI: "",
      effectiveDate: expect.any(String),
      confidence: 0,
      stars: 0,
      })
    );

    // Assert that the snackbar is shown with the correct message
    expect(mockToggleSnackbar).toHaveBeenCalledWith(true);
    expect(mockSetSnackbarMessage).toHaveBeenCalledWith('Claim submitted successfully!');

    // Assert that the form fields are reset
    expect(subjectInput).toHaveValue('');
    expect(claimInput).toHaveValue('');
  });

  test('submission without subject or claim', async () => {
    const { getByText } = render(
      <Form
        toggleSnackbar={mockToggleSnackbar}
        setSnackbarMessage={mockSetSnackbarMessage}
        setLoading={mockSetLoading}
      />
    );

    const submitButton = getByText(/submit/i);

    fireEvent.click(submitButton);

    // Assert that the loading state is not set
    expect(mockSetLoading).not.toHaveBeenCalled();

    // Assert that the snackbar is shown with the correct message
    expect(mockToggleSnackbar).toHaveBeenCalledWith(true);
    expect(mockSetSnackbarMessage).toHaveBeenCalledWith('Subject and Claims are required fields.');
  });
});
