// Ceramic imports removed - no longer using ceramic

export const AUTH_STATE_CHANGED_EVENT = 'linkedtrust:auth-state-changed'

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

  // Notify listeners (e.g. App.tsx) that auth state changed
  window.dispatchEvent(new Event(AUTH_STATE_CHANGED_EVENT))
}

const isJwtExpired = (token: string): boolean => {
  try {
    const part = token.split('.')[1]
    if (!part) return false
    const normalized = part.replace(/-/g, '+').replace(/_/g, '/')
    const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4)
    const payload = JSON.parse(atob(padded))
    if (typeof payload.exp !== 'number') return false
    return Date.now() >= payload.exp * 1000
  } catch {
    return false
  }
}

export const checkAuth = () => {
  const accessToken = localStorage.getItem('accessToken')
  const refreshToken = localStorage.getItem('refreshToken')
  const ethAddress = localStorage.getItem('ethAddress') || undefined
  const did = localStorage.getItem('did')

  // JWT auth is primary authentication method.
  // Session lives as long as the refresh token; access token is renewed by the axios interceptor.
  if (accessToken && refreshToken) {
    if (isJwtExpired(refreshToken)) return false
    return true
  }

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
  window.dispatchEvent(new Event(AUTH_STATE_CHANGED_EVENT))
}

// Ceramic-related functions removed
