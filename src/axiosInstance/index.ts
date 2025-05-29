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
  if (route !== 'auth' && config.headers) {
    const headers = getAuthHeaders()
    config.headers = { ...config.headers, ...headers }
  }

  // Don't override Content-Type for FormData
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'] // Let browser set it with boundary
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
  value => value,
  async error => {
    const originalReq = error.config
    const errorResponse = error.response

    // Handle both 401 and 403 errors
    if (errorResponse?.status === 401 || errorResponse?.status === 403) {
      // Don't retry auth endpoints to avoid infinite loops
      if (originalReq.url?.startsWith('/auth/')) {
        clearAuth()
        window.location.href = '/login'
        return Promise.reject(error)
      }

      if (!isRefreshing) {
        isRefreshing = true
        const refreshToken = localStorage.getItem('refreshToken')

        if (!refreshToken) {
          clearAuth()
          window.location.href = '/login'
          return Promise.reject(error)
        }

        try {
          const res = await instance.post('/auth/refresh_token', { refreshToken })
          const { accessToken, refreshToken: newRefreshToken } = res.data

          handleAuthSuccess({ accessToken, refreshToken: newRefreshToken })
          isRefreshing = false
          onRefreshed(accessToken)

          // Update the original request headers
          originalReq.headers = { ...originalReq.headers, ...getAuthHeaders() }
          return instance(originalReq)
        } catch (err) {
          clearAuth()
          window.location.href = '/login'
          return Promise.reject(err)
        }
      }

      // If we're already refreshing, queue this request
      return new Promise(resolve => {
        subscribeTokenRefresh(accessToken => {
          originalReq.headers = { ...originalReq.headers, ...getAuthHeaders() }
          resolve(instance(originalReq))
        })
      })
    }

    return Promise.reject(error)
  }
)

export default instance
