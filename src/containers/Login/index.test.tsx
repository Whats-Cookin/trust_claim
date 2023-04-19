import { render, screen, fireEvent, waitFor, getByLabelText, getByRole } from '@testing-library/react'
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import { MemoryRouter } from 'react-router-dom'
import  { describe,vi} from 'vitest'

import Login from './index'

describe('Login component', () => {
  let mockAxios: MockAdapter

  beforeEach(() => {
    mockAxios = new MockAdapter(axios)
  })

  afterEach(() => {
    mockAxios.restore()
  })

  it('should render login form', () => {
    render(
      <MemoryRouter>
        <Login toggleSnackbar={toggleSnackbar} setSnackbarMessage={toggleSnackbar} setLoading={setLoading} />
      </MemoryRouter>
    )

    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument()
  })

  it('should display error message when login form is submitted with empty fields', async () => {
 

    render(
        <MemoryRouter>
          <Login toggleSnackbar={toggleSnackbar} setSnackbarMessage={toggleSnackbar} setLoading={setLoading} />
        </MemoryRouter>
      )
      
  })

  it('should display error message when login form is submitted with invalid credentials', async () => {
    mockAxios.onPost(`${process.env.REACT_APP_BACKEND_BASE_URL}/auth/login`).reply(404, { message: 'User not Found!' })

    render(
      <MemoryRouter>
        <Login toggleSnackbar={toggleSnackbar} setSnackbarMessage={toggleSnackbar} setLoading={setLoading} />
      </MemoryRouter>
    )

    const emailField = screen.getByLabelText('Email')
    const passwordField = screen.getByLabelText('Password')
    const loginButton = screen.getByRole('button', { name: 'Login' })

    fireEvent.change(emailField, { target: { value: 'invalid@example.com' } })
    fireEvent.change(passwordField, { target: { value: 'password' } })
    fireEvent.click(loginButton)

  //   await waitFor(() => {
  //     expect(screen.getByText('User not Found!')).toBeInTheDocument()
  //   })
  })

  // it('should redirect to home page when login form is submitted with valid credentials', async () => {
  //   const accessToken = 'fake-access-token'
  //   const refreshToken = 'fake-refresh-token'

  //   mockAxios.onPost(`${process.env.REACT_APP_BACKEND_BASE_URL}/auth/login`).reply(200, { accessToken, refreshToken })

  //   const navigateSpy = vi.fn()

    

  //   render(
  //       <MemoryRouter>
  //         <Login toggleSnackbar={toggleSnackbar} setSnackbarMessage={toggleSnackbar} setLoading={setLoading}/>
  //       </MemoryRouter>
  //     )
      
    

  //   const emailField = screen.getByLabelText('Email')
  //   const passwordField = screen.getByLabelText('Password')
  //   const loginButton = screen.getByRole('button', { name: 'Login' })

  //   fireEvent.change(emailField, { target: { value: 'test@example.com' } })
  //   fireEvent.change(passwordField, { target: { value: 'password' } })
  //   fireEvent.click(loginButton)

  //   await waitFor(() => {
  //     expect(navigateSpy).toHaveBeenCalledWith('/')
  //     expect(localStorage.setItem).toHaveBeenNthCalledWith(1, 'accessToken', accessToken)
  //     expect(localStorage.setItem).toHaveBeenNthCalledWith(2, 'refreshToken', refreshToken)
  //   })
  //  })

  
})

function setSnackbarMessage(arg0: string) {
    // throw new Error('Function not implemented.')
}

function toggleSnackbar(arg0: boolean) {
    // throw new Error('Function not implemented.')
}

function setLoading(arg0: boolean) {
    // throw new Error('Function not implemented.')
}


  
  

