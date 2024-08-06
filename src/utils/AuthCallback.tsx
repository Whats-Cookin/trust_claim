import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from '../axiosInstance'
import { useQueryParams } from '../hooks'

interface AuthCallbackProps {
  setLoading: (isLoading: boolean) => void
  toggleSnackbar: (open: boolean) => void
  setSnackbarMessage: (message: string) => void
}

const AuthCallback: React.FC<AuthCallbackProps> = ({ setLoading, toggleSnackbar, setSnackbarMessage }) => {
  const navigate = useNavigate()
  const queryParams = useQueryParams()
  const githubAuthCode = queryParams.get('code')

  useEffect(() => {
    if (githubAuthCode) {
      setLoading(true)
      axios
        .post('/github', { code: githubAuthCode })
        .then(res => {
          const { accessToken, refreshToken } = res.data
          localStorage.setItem('accessToken', accessToken)
          localStorage.setItem('refreshToken', refreshToken)
          setLoading(false)
          navigate('/')
        })
        .catch(err => {
          setLoading(false)
          toggleSnackbar(true)
          setSnackbarMessage('Failed to authenticate with GitHub.')
          console.error('GitHub Auth Error:', err.message)
          navigate('/login')
        })
    }
  }, [githubAuthCode, navigate, setLoading, toggleSnackbar, setSnackbarMessage])

  return null
}

export default AuthCallback
