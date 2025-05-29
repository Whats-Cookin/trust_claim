// Ceramic imports removed - no longer using ceramic

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

  // Add Ethereum address if available
  const ethAddress = localStorage.getItem('ethAddress')
  if (ethAddress) {
    headers['X-ETH-ADDRESS'] = ethAddress
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
  localStorage.removeItem('userDid')
  localStorage.removeItem('userIdType')
}

// Validate token expiration
export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    const expirationTime = payload.exp * 1000 // Convert to milliseconds
    return Date.now() >= expirationTime
  } catch (e) {
    return true
  }
}

// Check if token needs refresh
export const needsTokenRefresh = (): boolean => {
  const accessToken = localStorage.getItem('accessToken')
  if (!accessToken) return true
  
  try {
    const payload = JSON.parse(atob(accessToken.split('.')[1]))
    const expirationTime = payload.exp * 1000 // Convert to milliseconds
    // Refresh if token expires in less than 5 minutes
    return Date.now() >= (expirationTime - 5 * 60 * 1000)
  } catch (e) {
    return true
  }
}

// Ceramic-related functions removed
