import { CeramicApi } from '@ceramicnetwork/common'
import { ComposeClient } from '@composedb/client'
import { authenticateCeramic } from '../composedb'

interface AuthState {
  accessToken?: string
  refreshToken?: string
  ethAddress?: string
  did?: string
}

export const handleAuthSuccess = (authData: AuthState) => {
  if (authData.accessToken) localStorage.setItem('accessToken', authData.accessToken)
  if (authData.refreshToken) localStorage.setItem('refreshToken', authData.refreshToken)
  if (authData.ethAddress) localStorage.setItem('ethAddress', authData.ethAddress)
  if (authData.did) localStorage.setItem('did', authData.did)
}

export const checkAuth = () => {
  const accessToken = localStorage.getItem('accessToken')
  const refreshToken = localStorage.getItem('refreshToken')
  const ethAddress = localStorage.getItem('ethAddress') || undefined
  const did = localStorage.getItem('did')

  // JWT auth is primary authentication method
  if (accessToken && refreshToken) return true

  // Support legacy DID-only auth
  if (did && ethAddress) return true

  return false
}

export const getAuthHeaders = () => {
  const headers: Record<string, string> = {}

  // Add JWT auth if available
  const accessToken = localStorage.getItem('accessToken')
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`
  }

  // Add DID auth if available
  const did = localStorage.getItem('did')
  if (did) {
    headers['X-DID'] = did
  }

  return headers
}

export const handleAuth = (accessToken: string, refreshToken: string) => {
  handleAuthSuccess({ accessToken, refreshToken })
}

export const clearAuth = () => {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('ethAddress')
  localStorage.removeItem('did')
}

export const initializeDIDAuth = async (ceramic: CeramicApi, compose: ComposeClient) => {
  try {
    const session = await authenticateCeramic(ceramic, compose)
    if (session?.did) {
      handleAuthSuccess({
        did: session.did.parent,
        ethAddress: localStorage.getItem('ethAddress') || undefined // Keep existing ethAddress
      })
      return true
    }
  } catch (error) {
    console.error('DID authentication failed:', error)
  }
  return false
}

export const canSignClaims = () => {
  const did = localStorage.getItem('did')
  const ethAddress = localStorage.getItem('ethAddress')
  return !!(did && ethAddress)
}
