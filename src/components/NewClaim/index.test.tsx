import { render, screen, fireEvent } from '@testing-library/react'
// import NewClaim from './index'
import { MemoryRouter } from 'react-router-dom'
import {test,vi} from 'vitest'
import FormDialog from './AddNewClaim'

test('FormDialog submits claim successfully', async () => {
  // Set up component props
  const props = {
    open: true,
    setOpen: vi.fn(),
    toggleSnackbar: vi.fn(),
    setSnackbarMessage: vi.fn(),
    setLoading: vi.fn()
  }

  // Render the component
  render(
    <MemoryRouter>
      <FormDialog {...props} />
    </MemoryRouter>
  )

  // Fill out the form fields
  const subjectInput = screen.getByLabelText(/subject/i)
  fireEvent.input(subjectInput, { target: { value: 'Test subject' } })



  const claimInput = screen.getByLabelText(/claim/i)
  // fireEvent.change(claimInput, { target: { value: 'rated' } })
  fireEvent.input(claimInput, { target: { value: 'rated' } })

  const objectInput = screen.getByLabelText(/object/i)
  fireEvent.input(objectInput, { target: { value: 'Test object' } })

  const sourceURIInput = screen.getByLabelText(/source uri/i)
  fireEvent.input(sourceURIInput, { target: { value: 'http://test.com' } })

  // Submit the form
  const submitButton = screen.getByRole('button', { name: /submit/i })
  fireEvent.click(submitButton)

//   Assert that the loading indicator is shown
  expect(screen.getByTestId('loading-indicator')).toBeInTheDocument()

  // Wait for the claim to be submitted
  await screen.findByText(/claim submitted successfully/i)

  // Assert that the snackbar message is displayed
  expect(screen.getByText(/claim submitted successfully/i)).toBeInTheDocument()

  // Assert that the form fields have been reset
  expect(subjectInput).toHaveValue('')
  expect(claimInput).toHaveValue('')
  expect(objectInput).toHaveValue('')
  expect(sourceURIInput).toHaveValue('')

  // Assert that the loading indicator is hidden
  expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument()
})


// import { render, screen, fireEvent } from '@testing-library/react'
// import {test,vi} from 'vitest'
// import { MemoryRouter } from 'react-router-dom'
// import FormDialog from './AddNewClaim'

// test('FormDialog submits claim successfully', async () => {
//   // Set up component props
//   const props = {
//     open: true,
//     setOpen: vi.fn(),
//     toggleSnackbar: vi.fn(),
//     setSnackbarMessage: vi.fn(),
//     setLoading: vi.fn()
//   }

//   // Render the component with a MemoryRouter
  // render(
  //   <MemoryRouter>
  //     <FormDialog {...props} />
  //   </MemoryRouter>
  // )

//   // Fill out the form fields
//   const subjectInput = screen.getByLabelText(/subject/i)
//   fireEvent.change(subjectInput, { target: { value: 'Test subject' } })

//   const claimInput = screen.getByLabelText(/claim/i)
//   fireEvent.change(claimInput, { target: { value: 'rated' } })

//   const objectInput = screen.getByLabelText(/object/i)
//   fireEvent.change(objectInput, { target: { value: 'Test object' } })

//   const sourceURIInput = screen.getByLabelText(/source uri/i)
//   fireEvent.change(sourceURIInput, { target: { value: 'http://test.com' } })

//   // Submit the form
//   const submitButton = screen.getByRole('button', { name: /submit/i })
//   fireEvent.click(submitButton)

//   // Assert that the loading indicator is shown
//   expect(screen.getByTestId('loading-indicator')).toBeInTheDocument()

//   // Wait for the claim to be submitted
//   await screen.findByText(/claim submitted successfully/i)

//   // Assert that the snackbar message is displayed
//   expect(screen.getByText(/claim submitted successfully/i)).toBeInTheDocument()

//   // Assert that the form fields have been reset
//   expect(subjectInput).toHaveValue('')
//   expect(claimInput).toHaveValue('')
//   expect(objectInput).toHaveValue('')
//   expect(sourceURIInput).toHaveValue('')

//   // Assert that the loading indicator is hidden
//   expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument()
// })
