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

// ── "Sign in with LinkedTrust" OIDC provider flow ────────────────────────────
// When an external app (e.g. Odoo/Taiga via /oauth/authorize) bounces the user
// here to log in, the backend appends ?lt_oidc=1&return_to=<authorize-url>. We
// stash those on first arrival (they survive the external Google/Bluesky/GitHub
// round-trip via sessionStorage), then after login set the IdP session cookie
// and return the browser to the authorize URL — which redirects back to the app.
const OIDC_FLOW_KEY = 'lt_oidc_flow'
const OIDC_RETURN_KEY = 'lt_oidc_return_to'

export const captureOidcFlow = (params: URLSearchParams) => {
  if (params.get('lt_oidc') === '1') {
    sessionStorage.setItem(OIDC_FLOW_KEY, '1')
    const returnTo = params.get('return_to')
    if (returnTo) sessionStorage.setItem(OIDC_RETURN_KEY, returnTo)
  }
}

// Returns true if it took over navigation (caller should NOT navigate further).
export const maybeCompleteOidcLogin = async (accessToken: string): Promise<boolean> => {
  const flow = sessionStorage.getItem(OIDC_FLOW_KEY)
  const returnTo = sessionStorage.getItem(OIDC_RETURN_KEY)
  if (flow !== '1' || !returnTo) return false

  // Only ever redirect back to our own origin (the /oauth/authorize endpoint);
  // guards against an open-redirect via a crafted return_to.
  let target = '/'
  try {
    if (new URL(returnTo, window.location.origin).origin === window.location.origin) target = returnTo
  } catch {
    /* keep fallback */
  }

  try {
    // Same-origin: sets the lt_idp_session cookie on this host (live.linkedtrust.us).
    await fetch('/oauth/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
      credentials: 'include',
      body: JSON.stringify({ access_token: accessToken })
    })
  } catch {
    // Cookie set may have failed; redirect anyway — authorize will re-bounce if so.
  }

  sessionStorage.removeItem(OIDC_FLOW_KEY)
  sessionStorage.removeItem(OIDC_RETURN_KEY)
  window.location.href = target
  return true
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
