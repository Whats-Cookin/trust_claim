import axios, { AxiosError } from 'axios'
import { BACKEND_BASE_URL } from '../utils/settings'
import { getAuthHeaders, handleAuthSuccess, clearAuth } from '../utils/authUtils'

const instance = axios.create({
  baseURL: BACKEND_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

instance.interceptors.request.use(config => {
  const route = config.url?.split('/')[1]
  
  // Ensure headers object exists
  if (!config.headers) {
    config.headers = {}
  }
  
  // Always ensure Content-Type is set for JSON requests
  if (!config.headers['Content-Type'] && config.data && typeof config.data === 'object') {
    config.headers['Content-Type'] = 'application/json'
  }
  
  // Add authentication headers (except for auth route)
  if (route !== 'auth') {
    const headers = getAuthHeaders()
    config.headers = { ...config.headers, ...headers }
  }
  
  // Log request details for debugging
  console.log('📡 === AXIOS REQUEST ===')
  console.log('📡 Method:', config.method?.toUpperCase())
  console.log('📡 URL:', config.url)
  console.log('📡 Base URL:', config.baseURL)
  console.log('📡 Full URL:', `${config.baseURL}${config.url}`)
  console.log('📡 Headers:', config.headers)
  if (config.data) {
    if (typeof config.data === 'string') {
      console.log('📡 Data (string):', config.data.length > 1000 ? `${config.data.substring(0, 1000)}... (truncated)` : config.data)
    } else {
      console.log('📡 Data (object):', JSON.stringify(config.data, null, 2).length > 1000 ? 'Large object (>1000 chars)' : config.data)
    }
  }
  
  return config
})

type HaltedReqCb = (newAccessToken: string) => void

let isRefreshing = false
const tokenSubscribers: HaltedReqCb[] = []

const onRefreshed = (newAccessToken: string) => {
  tokenSubscribers.forEach(cb => cb(newAccessToken))
  tokenSubscribers.length = 0 // Clear array after processing
}

const subscribeTokenRefresh = (haltedReqCb: HaltedReqCb) => {
  tokenSubscribers.push(haltedReqCb)
}

instance.interceptors.response.use(
  response => {
    // Log successful responses for debugging
    console.log('📡 === AXIOS RESPONSE SUCCESS ===')
    console.log('📡 Status:', response.status)
    console.log('📡 Status Text:', response.statusText)
    console.log('📡 Headers:', response.headers)
    console.log('📡 Data:', response.data)
    return response
  },
  async error => {
    // Log error responses for debugging
    console.log('📡 === AXIOS RESPONSE ERROR ===')
    console.log('📡 Error:', error.message)
    if (error.response) {
      console.log('📡 Response Status:', error.response.status)
      console.log('📡 Response Data:', error.response.data)
      console.log('📡 Response Headers:', error.response.headers)
    } else if (error.request) {
      console.log('📡 Request made but no response received:', error.request)
    }
    
    const originalReq = error.config
    const errorResponse = error.response

    if (errorResponse?.status === 401) {
      // Check for various JWT error messages
      const errorMessage = errorResponse.data?.message || errorResponse.data?.error || ''
      const isJwtError =
        errorMessage.includes('jwt') || errorMessage.includes('token') || errorMessage.includes('unauthorized')

      if ((errorMessage === 'jwt expired' || isJwtError) && !isRefreshing) {
        isRefreshing = true
        const refreshToken = localStorage.getItem('refreshToken')

        try {
          const res = await instance.post('/auth/refresh_token', { refreshToken })
          const { accessToken, refreshToken: newRefreshToken } = res.data

          handleAuthSuccess({ accessToken, refreshToken: newRefreshToken })
          isRefreshing = false
          onRefreshed(accessToken)

          originalReq.headers = { ...originalReq.headers, ...getAuthHeaders() }
          return instance(originalReq)
        } catch (err) {
          isRefreshing = false
          clearAuth()
          // Don't redirect immediately, let the component handle it
          return Promise.reject(new Error('Please login again'))
        }
      }

      if (isRefreshing) {
        return new Promise(resolve => {
          subscribeTokenRefresh(accessToken => {
            originalReq.headers = { ...originalReq.headers, ...getAuthHeaders() }
            resolve(instance(originalReq))
          })
        })
      }

      // If we get here, it's a 401 but not a JWT issue
      clearAuth()
      return Promise.reject(new Error('Please login again'))
    }

    return Promise.reject(error)
  }
)

export default instance
