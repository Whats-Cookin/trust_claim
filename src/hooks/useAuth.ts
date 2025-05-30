import { useState, useEffect } from 'react';

interface User {
  id: string;
  email?: string;
  googleId?: string;
  metamaskAddress?: string;
}

export const useAuth = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for auth token and get user info
    const token = localStorage.getItem('authToken');
    
    if (token) {
      // Decode JWT or fetch user info
      try {
        // Simple JWT decode (in production, verify signature)
        const payload = JSON.parse(atob(token.split('.')[1]));
        setCurrentUser({
          id: payload.userId || payload.id,
          email: payload.email,
          googleId: payload.googleId,
          metamaskAddress: payload.metamaskAddress
        });
      } catch (error) {
        console.error('Failed to decode token:', error);
      }
    }
    
    setLoading(false);
  }, []);

  return { currentUser, loading };
};