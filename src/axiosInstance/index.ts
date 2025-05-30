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

    // Debug logging for claim requests
    if (config.url?.includes('/claims')) {
      console.log('Claim request headers:', {
        url: config.url,
        method: config.method,
        headers: config.headers,
        authHeaders: headers
      })
    }
  }

  // Don't override Content-Type for FormData
  if (config.data instanceof FormData && config.headers) {
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

    // Check if this is a claim-related endpoint
    const isClaimEndpoint = originalReq.url?.includes('/claim') || originalReq.url?.includes('/claims')

    // Handle both 401 and 403 errors
    if (errorResponse?.status === 401 || errorResponse?.status === 403) {
      // For claim endpoints with 403, let the component handle the error first
      if (isClaimEndpoint && errorResponse?.status === 403) {
        console.log('Claim creation permission denied:', {
          status: errorResponse.status,
          statusText: errorResponse.statusText,
          data: errorResponse.data,
          url: originalReq.url,
          method: originalReq.method
        })
        // Don't redirect immediately - let the component show the error message
        return Promise.reject(error)
      }

      // For claim endpoints with 401, redirect to feed
      if (isClaimEndpoint && errorResponse?.status === 401) {
        console.log('Claim creation authentication failed. Redirecting to feed...')
        setTimeout(() => {
          window.location.href = '/feed'
        }, 1000)
        return Promise.reject(error)
      }

      // Don't retry auth endpoints to avoid infinite loops
      if (originalReq.url?.startsWith('/auth/')) {
        clearAuth()
        window.location.href = '/login'
        return Promise.reject(error)
      }

      // PREVENT INFINITE RETRY LOOPS
      if (originalReq._retry) {
        // For claim endpoints, just redirect to feed without clearing auth
        if (isClaimEndpoint) {
          window.location.href = '/feed'
        } else {
          clearAuth()
          window.location.href = '/login'
        }
        return Promise.reject(error)
      }

      // Mark request as retried
      originalReq._retry = true

      if (!isRefreshing) {
        isRefreshing = true
        const refreshToken = localStorage.getItem('refreshToken')

        if (!refreshToken) {
          // For claim endpoints, just redirect to feed without clearing auth
          if (isClaimEndpoint) {
            window.location.href = '/feed'
          } else {
            clearAuth()
            window.location.href = '/login'
          }
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
          isRefreshing = false
          // For claim endpoints, just redirect to feed without clearing auth
          if (isClaimEndpoint) {
            window.location.href = '/feed'
          } else {
            clearAuth()
            window.location.href = '/login'
          }
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
