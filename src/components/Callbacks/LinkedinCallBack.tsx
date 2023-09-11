import { useEffect, useCallback } from 'react'
import { useQueryParams } from '../../hooks'
import { useNavigate } from 'react-router-dom'
import CallBackProps from './types'
import axios from '../../axiosInstance'

const LinkedinCallBack = ({ setLoading, toggleSnackbar, setSnackbarMessage }: CallBackProps) => {
  const queryParams = useQueryParams()
  const navigate = useNavigate()

  const handleAuth = useCallback((accessToken: string, refreshToken: string) => {
    console.log('in handle auth, You have a token: ' + accessToken)
    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', refreshToken)
    setLoading(false)
    navigate('/')
  }, [])

  useEffect(() => {
    const code = queryParams.get('code')
    if (code) {
      const linkedinAuthUrl = '/auth/linkedin'
      axios
        .post<{ accessToken: string; refreshToken: string }>(linkedinAuthUrl, { code })
        .then(res => {
          console.log('got the response from backend tuna')
          const { accessToken, refreshToken } = res.data
          handleAuth(accessToken, refreshToken)
        })
        .catch(err => {
          setLoading(false)
          toggleSnackbar(true)
          setSnackbarMessage(err.message)
          console.error(err.message)
        })
    } else {
      console.log('no code or state was found')
    }
  }, [])

  return <div></div>
}

export default LinkedinCallBack
