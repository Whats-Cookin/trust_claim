// import { render ,screen ,fireEvent, waitFor} from "@testing-library/react";
// import Form  from "./index";
// import { expect, describe, it, afterEach,test } from 'vitest';
// import userEvent from "@testing-library/user-event";
// import React from "react";
// import axios from "../../axiosInstance";
// import { act } from '@testing-library/react';

// describe('Form', () => {
//   test('renders form fields', async () => {
//     await act(async () => {
//       render(<Form />);
//     });

//     expect(screen.getByLabelText('Subject')).toBeInTheDocument();
//     expect(screen.getByLabelText('Subject Name')).toBeInTheDocument();
//     expect(screen.getByLabelText('Claim')).toBeInTheDocument();
//     expect(screen.getByLabelText('Aspect')).toBeInTheDocument();
//     expect(screen.getByLabelText('How Known')).toBeInTheDocument();
//     expect(screen.getByLabelText('Object')).toBeInTheDocument();
//     expect(screen.getByLabelText('Statement')).toBeInTheDocument();
//     expect(screen.getByLabelText('Source URI')).toBeInTheDocument();
//     expect(screen.getByLabelText('Confidence')).toBeInTheDocument();
//     expect(screen.getByLabelText('Stars')).toBeInTheDocument();
//     expect(screen.getByLabelText('Effective Date')).toBeInTheDocument();
//   });

//   test('submits the form with valid input', async () => {
//     await act(async () => {
//       render(<Form />);
//     });

//     fireEvent.change(screen.getByLabelText('Subject'), { target: { value: 'John Doe' } });
//     fireEvent.change(screen.getByLabelText('Claim'), { target: { value: 'rated' } });
//     fireEvent.change(screen.getByLabelText('Object'), { target: { value: 'The restaurant' } });
//     fireEvent.change(screen.getByLabelText('Statement'), { target: { value: 'The food was excellent.' } });
//     fireEvent.change(screen.getByLabelText('Aspect'), { target: { value: 'quality:taste' } });
//     fireEvent.change(screen.getByLabelText('How Known'), { target: { value: 'website' } });
//     fireEvent.change(screen.getByLabelText('Source URI'), { target: { value: 'https://example.com' } });
//     fireEvent.change(screen.getByLabelText('Effective Date'), { target: { value: '2022-03-27' } });
//     fireEvent.change(screen.getByLabelText('Confidence'), { target: { value: '0.5' } });
//     fireEvent.change(screen.getByLabelText('Stars'), { target: { value: '4' } });

//     fireEvent.click(screen.getByText('Submit'));

//     // Wait for the form submission to complete
//     await screen.findByText('Claim submitted successfully!');

//     expect(screen.getByLabelText('Subject')).toHaveValue('');
//     expect(screen.getByLabelText('Subject Name')).toHaveValue('');
//     expect(screen.getByLabelText('Claim')).toHaveValue('');
//     expect(screen.getByLabelText('Aspect')).toHaveValue('');
//     expect(screen.getByLabelText('How Known')).toHaveValue('');
//     expect(screen.getByLabelText('Object')).toHaveValue('');
//     expect(screen.getByLabelText('Statement')).toHaveValue('');
//     expect(screen.getByLabelText('Source URI')).toHaveValue('');
//     expect(screen.getByLabelText('Confidence')).toHaveValue('1');
//     expect(screen.getByLabelText('Stars')).toHaveValue('0');
//     expect(screen.getByLabelText('Effective Date')).toHaveValue('');
//   });

//   test('displays an error message if required fields are missing', async () => {
//     await act(async () => {
//       render(<Form />);
//     });

//     fireEvent.click(screen.getByText('Submit'));

//     await screen.findByText('Subject and Claims are required fields.');

//     expect(screen.queryByText('Claim submitted successfully!')).not.toBeInTheDocument();
//   });
// });


