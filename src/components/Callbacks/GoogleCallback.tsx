import { useLayoutEffect, useCallback } from 'react'
import { useQueryParams } from '../../hooks'
import { useNavigate } from 'react-router-dom'
import CallBackProps from './types'
import axios from '../../axiosInstance'

const GoogleCallback = ({ setLoading, toggleSnackbar, setSnackbarMessage }: CallBackProps) => {
  const navigate = useNavigate()
  const queryParams = useQueryParams()

  const handleAuth = useCallback((accessToken: string, refreshToken: string) => {
    console.log('in handle auth')
    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', refreshToken)
    setLoading(false)
    navigate('/')
  }, [])

  useLayoutEffect(() => {
    const googleAuthCode = queryParams.get('code')
    if (!googleAuthCode) {
      console.log('no authorization code found! redirecting to callback url')
    } else {
      const googleAuthUrlBackend = '/auth/google'
      axios
        .post<{ accessToken: string; refreshToken: string }>(googleAuthUrlBackend, { code: googleAuthCode })
        .then(res => {
          console.log('Authentication successful!')
          handleAuth(res.data.accessToken, res.data.refreshToken)
        })
        .catch(err => {
          setLoading(false)
          toggleSnackbar(true)
          setSnackbarMessage(err.message)
          console.error(err.message)
        })
    }
  }, [])

  return <div></div>
}

export default GoogleCallback
