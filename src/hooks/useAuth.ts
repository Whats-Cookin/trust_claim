import { useState, useEffect } from 'react'

interface User {
  id: string
  email?: string
  googleId?: string
  metamaskAddress?: string
}

export const useAuth = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for auth token and get user info
    // Support both 'authToken' (legacy) and 'accessToken' (current)
    const token = localStorage.getItem('accessToken') || localStorage.getItem('authToken')

    if (token) {
      // Decode JWT or fetch user info
      try {
        // Simple JWT decode (in production, verify signature)
        const payload = JSON.parse(atob(token.split('.')[1]))

        // Get DID from token or localStorage (wallet auth stores it separately)
        const did = payload.did || localStorage.getItem('did')
        const ethAddress = localStorage.getItem('ethAddress')

        setCurrentUser({
          id: payload.userId || payload.id,
          email: payload.email,
          googleId: payload.googleId,
          // Use DID/ethAddress from token or localStorage for wallet auth
          metamaskAddress: ethAddress || (did ? did.replace('did:ethr:', '') : undefined)
        })
      } catch (error) {
        console.error('Failed to decode token:', error)
      }
    }

    setLoading(false)
  }, [])

  return { currentUser, loading }
}
