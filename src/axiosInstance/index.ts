import axios, { AxiosError } from 'axios'
import { BACKEND_BASE_URL } from '../utils/settings'

const baseURL = BACKEND_BASE_URL

const instance = axios.create({
  baseURL: BACKEND_BASE_URL,
  timeout: 10000
})

instance.interceptors.request.use(config => {
  const route = config.url?.split('/')[1]
  const accessToken = localStorage.getItem('accessToken')
  if (accessToken !== 'undefined' && route !== 'auth' && config.headers) {
    config.headers.Authorization = accessToken ? `Bearer ${accessToken}` : ''
  }
  return config
})

type HaultedReqCb = (newAccessToken: string) => void
let isRefreshing = false
let tokenSubscribers: HaultedReqCb[] = []

const onRefreshed = (newAccessToken: string) => {
  tokenSubscribers.forEach(cb => cb(newAccessToken))
}

const subscribeTokenRefresh = (haultedReqCb: HaultedReqCb) => {
  tokenSubscribers.push(haultedReqCb)
}

instance.interceptors.response.use(
  value => value,
  async error => {
    const originalReq = error.config
    const errorResponse = error.response
    if (errorResponse.status === 401 && errorResponse.data.message === 'jwt expired') {
      if (!isRefreshing) {
        const refreshToken = localStorage.getItem('refreshToken')
        isRefreshing = true
        instance
          .post('/auth/refresh_token', { refreshToken })
          .then(res => {
            const {
              data: { accessToken, refreshToken }
            } = res
            localStorage.setItem('accessToken', accessToken)
            localStorage.setItem('refreshToken', refreshToken)

            isRefreshing = false
            onRefreshed(accessToken)
          })
          .catch((err: AxiosError) => {
            console.error('Token could not be refreshed', err.message)
          })
      }

      return new Promise(resolve => {
        subscribeTokenRefresh(accessToken => {
          originalReq.headers.Authorization = `Bearer ${accessToken}`
          resolve(instance(originalReq))
        })
      })
    }
    return Promise.reject(new Error(error.message))
  }
)

export default instance
