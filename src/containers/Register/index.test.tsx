import { render, fireEvent, waitFor, screen, act } from '@testing-library/react'
import { describe, test, expect, afterAll, beforeEach, it, afterEach } from 'vitest'
import axios from 'axios'
import { MemoryRouter } from 'react-router-dom'
import MockAdapter from 'axios-mock-adapter'
import Register from './index'
import { BACKEND_BASE_URL } from '../../utils/settings'

describe('Register component', () => {
  let mockAdapter = new MockAdapter(axios)

  beforeEach(() => {
    mockAdapter = new MockAdapter(axios)
  })

  afterEach(() => {
    mockAdapter.reset()
  })

  afterAll(() => {
    mockAdapter.restore()
  })

  it('should render Register component', async () => {
    const { getByLabelText } = render(
      <MemoryRouter>
        <Register toggleSnackbar={undefined} setSnackbarMessage={undefined} setLoading={undefined} />
      </MemoryRouter>
    )
    expect(getByLabelText('Email')).toBeInTheDocument()
    expect(getByLabelText('Password')).toBeInTheDocument()
  })

  it('should display an error message if registration fails', async () => {
    mockAdapter.onPost(`${BACKEND_BASE_URL}/auth/signup`).reply(400, { error: 'Invalid registration details' })
    const { getByLabelText, queryByText } = render(
      <MemoryRouter>
        <Register toggleSnackbar={undefined} setSnackbarMessage={undefined} setLoading={undefined} />
      </MemoryRouter>
    )
    const emailInput = getByLabelText('Email') as HTMLInputElement
    const passwordInput = getByLabelText('Password') as HTMLInputElement

    fireEvent.change(emailInput, { target: { value: 'user@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password' } })

    await act(async () => {
      await waitFor(() => {
        const errorMessage = queryByText('Invalid registration details')
        expect(errorMessage).toBe(null)
      })
    })
  })

  //

  test('should navigate to login page on successful registration', async () => {
    mockAdapter.onPost('/auth/signup').reply(200)
    const { getByLabelText } = render(
      <MemoryRouter>
        <Register toggleSnackbar={undefined} setSnackbarMessage={undefined} setLoading={undefined} />
      </MemoryRouter>
    )
    const emailInput = getByLabelText('Email') as HTMLInputElement
    const passwordInput = getByLabelText('Password') as HTMLInputElement

    fireEvent.change(emailInput, { target: { value: 'user@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password' } })

    await waitFor(() => expect(screen.queryByText('Redirecting to login page...')).not.toBeInTheDocument())
  })
})
