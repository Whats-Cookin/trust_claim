import { useEffect, useCallback, useState } from 'react'
import { useQueryParams } from '../../hooks'
import { useNavigate } from 'react-router-dom'
import CallBackProps from './types'
import axios from '../../axiosInstance'
import getGoogleAuthUrl from '../../utils/getGoogleAuthUrl'

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
  const [code, setCode] = useState('')
  const googleAuthCode = queryParams.get('code')
  useEffect(() => {
    console.log(`googleauthcode: ${googleAuthCode}`)
    setCode(googleAuthCode as string)
    console.log(`code: ${code}`)
    if (!code) {
      console.log('no authorization code found! redirecting to callback url')
      const googleAuthUrl = getGoogleAuthUrl()
      axios.get(googleAuthUrl).catch(err => console.error(err))
    } else {
      const googleAuthUrlBackend = '/auth/google'
      axios
        .post<{ accessToken: string; refreshToken: string }>(googleAuthUrlBackend, { code })
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
  }, [code])

  return <div></div>
}

export default GoogleCallback
