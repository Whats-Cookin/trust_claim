import { useEffect, useCallback } from 'react'
import { useQueryParams } from '../../hooks'
import { useNavigate } from 'react-router-dom'
import CallBackProps from './types'

const GoogleCallback = ({ setLoading }: CallBackProps) => {
  const navigate = useNavigate()
  const queryParams = useQueryParams()

  const handleAuth = useCallback((accessToken: any, refreshToken: any) => {
    console.log('in handle auth')
    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', refreshToken)
    setLoading(false)
    navigate('/')
  }, [])

  useEffect(() => {
    const accessToken = queryParams.get('accessToken')
    const refreshToken = queryParams.get('refreshToken')

    console.log('Authentication successful!')
    handleAuth(accessToken, refreshToken)
  }, [queryParams])

  return <div></div>
}

export default GoogleCallback
