import { useEffect, useState } from 'react'
import { Box, Typography, CircularProgress, Button, Paper } from '@mui/material'

// Standalone "Sign in with LinkedTrust" invite redemption page. Additive — it does
// NOT touch the normal /login flow. An admin-minted invite link lands here:
//   /sso-invite?token=<jwt>
// We stash the token, send the user through the EXISTING login flow if they aren't
// signed in, then redeem at /oauth/bind-invite so the relying app (Taiga) matches
// their existing account by email.
const INVITE_KEY = 'lt_sso_invite_token'
const TAIGA_URL = 'https://taiga.linkedtrust.us'

const SsoInvite = () => {
  const [status, setStatus] = useState<'working' | 'done' | 'error'>('working')
  const [message, setMessage] = useState('Linking your account…')
  const [email, setEmail] = useState('')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const urlToken = params.get('token')
    if (urlToken) sessionStorage.setItem(INVITE_KEY, urlToken)
    const token = urlToken || sessionStorage.getItem(INVITE_KEY)

    if (!token) {
      setStatus('error')
      setMessage('This invite link is missing or invalid.')
      return
    }

    const accessToken = localStorage.getItem('accessToken')
    if (!accessToken) {
      // Not signed in — reuse the existing login flow, return here afterward.
      window.location.href = `/login?lt_oidc=1&return_to=${encodeURIComponent('/sso-invite')}`
      return
    }

    ;(async () => {
      try {
        const res = await fetch('/oauth/bind-invite', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
          credentials: 'include',
          body: JSON.stringify({ invite: token })
        })
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          setStatus('error')
          setMessage(
            err.error === 'invite_already_used'
              ? 'This invite link has already been used.'
              : 'Could not link your account. The link may have expired — ask for a new one.'
          )
          return
        }
        const data = await res.json()
        sessionStorage.removeItem(INVITE_KEY)
        setEmail(data.email || '')
        setStatus('done')
        setMessage('Your account is linked.')
      } catch {
        setStatus('error')
        setMessage('Network error while linking your account. Try again.')
      }
    })()
  }, [])

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', p: 2 }}>
      <Paper sx={{ p: 4, maxWidth: 460, width: '100%', textAlign: 'center' }} elevation={3}>
        <Typography variant='h5' gutterBottom>
          Sign in with LinkedTrust
        </Typography>
        {status === 'working' && (
          <Box sx={{ mt: 3 }}>
            <CircularProgress />
            <Typography sx={{ mt: 2 }}>{message}</Typography>
          </Box>
        )}
        {status === 'done' && (
          <Box sx={{ mt: 2 }}>
            <Typography sx={{ mb: 1 }}>{message}</Typography>
            {email && (
              <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
                {email}
              </Typography>
            )}
            <Button variant='contained' href={TAIGA_URL}>
              Continue to Taiga
            </Button>
          </Box>
        )}
        {status === 'error' && (
          <Typography color='error' sx={{ mt: 3 }}>
            {message}
          </Typography>
        )}
      </Paper>
    </Box>
  )
}

export default SsoInvite
