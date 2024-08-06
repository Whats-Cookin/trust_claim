// axiosInstance.ts
import axios, { AxiosError } from 'axios'
import { BACKEND_BASE_URL } from '../utils/settings'

const instance = axios.create({
  baseURL: BACKEND_BASE_URL,
  timeout: 10000
})

instance.interceptors.request.use(config => {
  const route = config.url?.split('/')[1]
  const accessToken = localStorage.getItem('accessToken')
  if (accessToken && route !== 'auth' && config.headers) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})

type HaultedReqCb = (newAccessToken: string) => void

let isRefreshing = false
let tokenSubscribers: HaultedReqCb[] = []

const onRefreshed = (newAccessToken: string) => {
  tokenSubscribers.forEach(cb => cb(newAccessToken))
  tokenSubscribers = [] // clear subscribers once all are notified
}

const subscribeTokenRefresh = (haultedReqCb: HaultedReqCb) => {
  tokenSubscribers.push(haultedReqCb)
}

instance.interceptors.response.use(
  response => response,
  async error => {
    const originalReq = error.config
    if (error.response?.status === 401 && error.response.data.message === 'jwt expired') {
      if (!isRefreshing) {
        const refreshToken = localStorage.getItem('refreshToken')
        isRefreshing = true
        try {
          const res = await instance.post('/refresh_token', { refreshToken })
          const { accessToken: newAccessToken, refreshToken: newRefreshToken } = res.data
          localStorage.setItem('accessToken', newAccessToken)
          localStorage.setItem('refreshToken', newRefreshToken)
          isRefreshing = false
          onRefreshed(newAccessToken)
        } catch (err: AxiosError | any) {
          console.error('Token could not be refreshed', err.message)
          isRefreshing = false
        }
      }

      return new Promise(resolve => {
        subscribeTokenRefresh(newAccessToken => {
          originalReq.headers.Authorization = `Bearer ${newAccessToken}`
          resolve(instance(originalReq))
        })
      })
    }
    return Promise.reject(error)
  }
)

export default instance
