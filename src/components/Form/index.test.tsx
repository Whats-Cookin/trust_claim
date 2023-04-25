import React from 'react'
import { render, fireEvent, screen } from '@testing-library/react'
import { describe, vi, it } from 'vitest'
import { Form } from './index'

describe('Form', () => {
  const props = {
    toggleSnackbar: vi.fn(),
    setSnackbarMessage: vi.fn(),
    setLoading: vi.fn(),
    simple: false,
    onCancel: vi.fn()
  }

  it('submits the form with valid data', async () => {
    const createClaimMock = vi.fn().mockResolvedValue({
      message: 'Claim created successfully.',
      isSuccess: true
    })

    // Add createClaim prop to props object
    const updatedProps = {
      ...props,
      createClaim: createClaimMock
    }

    const { getByLabelText, getByRole } = render(<Form {...updatedProps} />)

    // Fill in form fields
    // fireEvent.change(getByLabelText('Subject'), { target: { value: 'Test Subject' } })
    // fireEvent.change(getByLabelText('Claim'), { target: { value: 'rated' } })
    // fireEvent.change(getByLabelText('Object'), { target: { value: 'Test Object' } })
    // fireEvent.change(getByLabelText('Source URI'), { target: { value: 'http://example.com' } })

    // Submit form
    fireEvent.submit(getByRole('button', { name: 'Submit' }))

    // Verify that createClaimMock was called with the correct payload
    // expect(createClaimMock).toHaveBeenCalledWith({
    //       subject: 'Test Subject',
    //       claim: 'rated',
    //       object: 'Test Object',
    //       statement: '',
    //       aspect: '',
    //       howKnown: '',
    //       sourceURI: 'http://example.com',
    //       effectiveDate: expect.any(String),
    //       confidence: 0.0,
    //       stars: 0
    //   })

    // Verify that success snackbar message is displayed
//     expect(screen.getByText('Claim created successfully.')).toBeInTheDocument()
//   })

//   it('displays an error message when subject and claim are not filled in', async () => {
//     const createClaimMock = vi.fn().mockResolvedValue({
//       message: 'Claim created successfully.',
//       isSuccess: true
//     })

    // Add createClaim prop to props object
    // const updatedProps = {
    //   ...props,
    //   createClaim: createClaimMock
    // }

    // const { getByRole } = render(<Form {...updatedProps} />)

    // Submit form without filling in required fields
    fireEvent.submit(getByRole('button', { name: 'Submit' }))

    // Verify that error snackbar message is displayed

//   await expect(screen.getByText('Subject and Claims are required fields.')).toBeInTheDocument();
})

})
