const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL
const GITHUB_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID
// BASE_URL should derive from BACKEND_BASE_URL or window.location.origin
// Extract base URL from backend URL (e.g., http://localhost:9000 -> http://localhost:3000)
// or use window.location.origin as fallback
const getBaseUrl = () => {
  if (import.meta.env.VITE_BACKEND_BASE_URL) {
    // Extract protocol and host from backend URL
    try {
      const url = new URL(import.meta.env.VITE_BACKEND_BASE_URL)
      return url.origin
    } catch {
      // If not a full URL, return as-is
      return import.meta.env.VITE_BACKEND_BASE_URL
    }
  }
  return typeof window !== 'undefined' ? window.location.origin : ''
}
const BASE_URL = getBaseUrl()

export { BACKEND_BASE_URL, GITHUB_CLIENT_ID, GOOGLE_CLIENT_ID, BASE_URL }
