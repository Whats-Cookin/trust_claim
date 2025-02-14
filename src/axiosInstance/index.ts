import axios, { AxiosError } from 'axios'
import { BACKEND_BASE_URL } from '../utils/settings'
import { getAuthHeaders, handleAuthSuccess, clearAuth } from '../utils/authUtils'

const instance = axios.create({
  baseURL: BACKEND_BASE_URL,
  timeout: 10000
})

instance.interceptors.request.use(config => {
  const route = config.url?.split('/')[1]
  if (route !== 'auth' && config.headers) {
    const headers = getAuthHeaders()
    config.headers = { ...config.headers, ...headers }
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

    if (errorResponse?.status === 401) {
      if (errorResponse.data.message === 'jwt expired' && !isRefreshing) {
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
          clearAuth()
          window.location.href = '/login'
          return Promise.reject(err)
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
    }

    return Promise.reject(error)
  }
)

export default instance
