// Per-client sign-in page for the "Sign in with LinkedTrust" OIDC flow.
//
// Reached only when an app bounces the browser through /oauth/authorize, which
// redirects here as /sso/:clientId. Relying parties call authorize exactly as
// before — the client is resolved server-side, so nothing changes for them.
// Direct visitors to /login keep the original page.
//
// Display details are fetched from /oauth/client/:clientId rather than read off
// the query string, so the app name shown here cannot be spoofed by a crafted
// link. Google / Bluesky / GitHub return via /login, which already completes the
// OIDC hand-off from the sessionStorage flow captured on arrival here.

import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Box, Button, TextField, Typography, useTheme, useMediaQuery } from '@mui/material'
import { useForm } from 'react-hook-form'
import { GoogleLogin } from '@react-oauth/google'
import GitHubIcon from '@mui/icons-material/GitHub'
import axios from '../../axiosInstance'
import { useQueryParams } from '../../hooks'
import { GITHUB_CLIENT_ID } from '../../utils/settings'
import { captureOidcFlow, handleAuthSuccess, maybeCompleteOidcLogin } from '../../utils/authUtils'
import { primaryColors } from '../../theme/colors'
import logo from '../../assets/logolinkedtrust.svg'
import ILoginProps from '../Login/types'

const githubUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}`

interface ClientInfo {
  clientId: string
  name: string
  host: string | null
}

// Stable per-client accent, so an app always looks the same to its users.
const accentFor = (seed: string): [string, string] => {
  const wheel = [
    primaryColors.cyan,
    primaryColors.purple,
    primaryColors.green,
    primaryColors.amber,
    primaryColors.indigo,
    primaryColors.teal,
    primaryColors.pink
  ]
  let hash = 0
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) % 100003
  return [wheel[hash % wheel.length], wheel[(hash + 3) % wheel.length]]
}

const SsoLogin = ({ toggleSnackbar, setSnackbarMessage, setLoading }: ILoginProps) => {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const isNarrow = useMediaQuery(theme.breakpoints.down('md'))
  const navigate = useNavigate()
  const { clientId } = useParams()
  const queryParams = useQueryParams()

  const [client, setClient] = useState<ClientInfo | null>(null)
  const [blueskyHandle, setBlueskyHandle] = useState('')
  const [showBluesky, setShowBluesky] = useState(false)
  const [blueskyLoading, setBlueskyLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm()

  // Stash the OIDC flow before any external round-trip.
  useEffect(() => {
    captureOidcFlow(queryParams)
  }, [])

  useEffect(() => {
    if (!clientId) return
    axios
      .get(`/oauth/client/${encodeURIComponent(clientId)}`)
      .then(res => setClient(res.data))
      .catch(() => setClient(null))
  }, [clientId])

  const finish = async (accessToken: string, refreshToken: string) => {
    handleAuthSuccess({ accessToken, refreshToken })
    setLoading(false)
    if (await maybeCompleteOidcLogin(accessToken)) return
    navigate('/feed')
  }

  const onSubmit = handleSubmit(async ({ email, password }) => {
    try {
      setLoading(true)
      const {
        data: { accessToken, refreshToken }
      } = await axios.post('/auth/login', { email, password })
      await finish(accessToken, refreshToken)
    } catch (err: any) {
      setLoading(false)
      toggleSnackbar(true)
      setSnackbarMessage('Email or password not recognised.')
    }
  })

  const handleBluesky = async () => {
    if (!blueskyHandle.trim()) {
      toggleSnackbar(true)
      setSnackbarMessage('Enter your Bluesky handle')
      return
    }
    try {
      setBlueskyLoading(true)
      const res = await axios.post('/auth/atproto/authorize', { handle: blueskyHandle.trim() })
      if (res.data.url) window.location.href = res.data.url
    } catch (e: any) {
      setBlueskyLoading(false)
      toggleSnackbar(true)
      setSnackbarMessage(e.response?.data?.error || 'Bluesky login failed')
    }
  }

  const appName = client?.name || 'the app'
  const [accent, accent2] = accentFor(client?.clientId || clientId || 'linkedtrust')

  const surface = isDark ? '#111C2E' : '#FFFFFF'
  const line = isDark ? '#22314A' : '#E2E8F0'
  const field = isDark ? '#0D1728' : '#F8FAFC'
  const text = isDark ? '#E8EEF7' : '#0F172A'
  const muted = isDark ? '#8DA0BC' : '#64748B'

  const providerButton = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    width: '100%',
    justifyContent: 'flex-start',
    padding: '12px 16px',
    mb: '10px',
    border: `1px solid ${line}`,
    borderRadius: '11px',
    backgroundColor: surface,
    color: text,
    fontSize: '14.5px',
    fontWeight: 550,
    textTransform: 'none' as const,
    transition: '.14s',
    '&:hover': { backgroundColor: surface, borderColor: muted, transform: 'translateY(-1px)' }
  }

  const fieldStyle = {
    mb: '12px',
    '& .MuiOutlinedInput-root': {
      backgroundColor: field,
      borderRadius: '10px',
      color: text,
      fontSize: '14.5px',
      '& fieldset': { borderColor: line },
      '&:hover fieldset': { borderColor: muted }
    },
    '& .MuiInputBase-input::placeholder': { color: muted, opacity: 0.8 }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: { xs: 0, sm: '24px' },
        backgroundColor: isDark ? '#0B1220' : '#F1F5F9'
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: '760px',
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '224px 1fr' },
          backgroundColor: surface,
          border: `1px solid ${line}`,
          borderRadius: { xs: 0, sm: '16px' },
          overflow: 'hidden',
          boxShadow: isDark
            ? '0 16px 40px -16px rgba(0,0,0,.7)'
            : '0 1px 2px rgba(15,23,42,.06), 0 12px 32px -12px rgba(15,23,42,.18)'
        }}
      >
        {/* brand panel — becomes a header band on narrow screens */}
        <Box
          sx={{
            p: { xs: '16px 20px', md: '30px 24px' },
            display: 'flex',
            flexDirection: { xs: 'row', md: 'column' },
            alignItems: { xs: 'center', md: 'stretch' },
            gap: { xs: '12px', md: 0 },
            justifyContent: 'space-between',
            borderRight: { md: `1px solid ${line}` },
            borderBottom: { xs: `1px solid ${line}`, md: 'none' },
            background: `radial-gradient(120% 90% at 0% 0%, ${accent}33, transparent 62%),
                         radial-gradient(100% 80% at 100% 100%, ${accent2}33, transparent 62%), ${field}`
          }}
        >
          <Box
            sx={{
              display: 'flex',
              gap: { xs: '10px', md: 0 },
              flexDirection: { xs: 'row', md: 'column' },
              alignItems: { xs: 'center', md: 'flex-start' }
            }}
          >
            <Box component='img' src={logo} alt='' sx={{ width: { xs: 32, md: 44 }, height: { xs: 32, md: 44 }, display: 'block' }} />
            <Box>
              <Typography sx={{ fontWeight: 650, fontSize: { xs: '14.5px', md: '15.5px' }, letterSpacing: '-.015em', color: text, mt: { xs: 0, md: '12px' } }}>
                LinkedTrust.us
              </Typography>
              {!isNarrow && (
                <Typography sx={{ mt: '10px', fontSize: '13.5px', lineHeight: 1.45, color: muted }}>
                  Portable reputation.
                  <br />
                  Yours, not ours.
                </Typography>
              )}
            </Box>
          </Box>
          <Typography sx={{ fontSize: '11.5px', color: muted, letterSpacing: '.02em', textAlign: { xs: 'right', md: 'left' } }}>
            Signing you in to {appName}
          </Typography>
        </Box>

        {/* sign-in column */}
        <Box sx={{ p: { xs: '24px 22px 22px', md: '32px 34px 28px' } }}>
          {client?.host && (
            <Typography sx={{ fontSize: '12px', color: muted, letterSpacing: '.03em', textTransform: 'uppercase', mb: '6px' }}>
              {client.host}
            </Typography>
          )}
          <Typography sx={{ fontSize: { xs: '19px', md: '21px' }, fontWeight: 650, letterSpacing: '-.015em', color: text }}>
            Continue to {appName}
          </Typography>
          <Typography sx={{ fontSize: '13.5px', color: muted, mb: '22px' }}>Choose how to sign in.</Typography>

          {/* Google */}
          <Box sx={{ ...providerButton, p: 0, overflow: 'hidden', '& > div': { width: '100%' } }}>
            <GoogleLogin
              width='100%'
              theme={isDark ? 'filled_black' : 'outline'}
              text='continue_with'
              onSuccess={async credentialResponse => {
                try {
                  setLoading(true)
                  const {
                    data: { accessToken, refreshToken }
                  } = await axios.post('/auth/google', { googleAuthCode: credentialResponse.credential })
                  await finish(accessToken, refreshToken)
                } catch (err) {
                  setLoading(false)
                  toggleSnackbar(true)
                  setSnackbarMessage('Google authentication failed')
                }
              }}
              onError={() => {
                toggleSnackbar(true)
                setSnackbarMessage('Google authentication failed')
              }}
            />
          </Box>

          {/* Bluesky */}
          <Button sx={providerButton} onClick={() => setShowBluesky(v => !v)}>
            <Box component='span' sx={{ fontSize: '20px', lineHeight: 1 }}>
              🦋
            </Box>
            <Box component='span' sx={{ flex: 1, textAlign: 'left' }}>
              Continue with Bluesky
            </Box>
          </Button>
          {showBluesky && (
            <Box sx={{ display: 'flex', gap: '8px', mb: '10px' }}>
              <TextField
                fullWidth
                size='small'
                placeholder='you.bsky.social'
                value={blueskyHandle}
                onChange={e => setBlueskyHandle(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleBluesky()
                  }
                }}
                disabled={blueskyLoading}
                sx={{ ...fieldStyle, mb: 0 }}
              />
              <Button
                variant='contained'
                onClick={handleBluesky}
                disabled={blueskyLoading}
                sx={{ textTransform: 'none', whiteSpace: 'nowrap', backgroundColor: '#0085ff', borderRadius: '10px', '&:hover': { backgroundColor: '#0066cc' } }}
              >
                {blueskyLoading ? 'Connecting…' : 'Go'}
              </Button>
            </Box>
          )}

          {/* GitHub */}
          <Button sx={providerButton} href={githubUrl}>
            <GitHubIcon sx={{ fontSize: '20px' }} />
            <Box component='span' sx={{ flex: 1, textAlign: 'left' }}>
              Continue with GitHub
            </Box>
          </Button>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: '14px', color: muted, fontSize: '12px', my: '20px' }}>
            <Box sx={{ flex: 1, height: '1px', backgroundColor: line }} />
            or
            <Box sx={{ flex: 1, height: '1px', backgroundColor: line }} />
          </Box>

          <form onSubmit={onSubmit}>
            <TextField
              fullWidth
              placeholder='Email'
              type='email'
              size='small'
              sx={fieldStyle}
              error={!!errors.email}
              helperText={(errors.email?.message as string) || ''}
              {...register('email', {
                required: 'Email is required',
                pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Invalid email address' }
              })}
            />
            <TextField
              fullWidth
              placeholder='Password'
              type='password'
              size='small'
              sx={fieldStyle}
              error={!!errors.password}
              helperText={(errors.password?.message as string) || ''}
              {...register('password', { required: 'Password is required' })}
            />
            <Button
              type='submit'
              fullWidth
              sx={{
                padding: '12px 16px',
                borderRadius: '11px',
                textTransform: 'none',
                fontSize: '14.5px',
                fontWeight: 600,
                backgroundColor: isDark ? primaryColors.cyan : '#0F172A',
                color: isDark ? '#06202B' : '#FFFFFF',
                '&:hover': { backgroundColor: isDark ? '#0891B2' : '#1E293B' }
              }}
            >
              Sign in
            </Button>
          </form>

          <Typography sx={{ mt: '20px', fontSize: '13.5px', color: muted, textAlign: 'center' }}>
            New here?{' '}
            <Box
              component='span'
              onClick={() => navigate('/register')}
              sx={{
                color: text,
                fontWeight: 600,
                cursor: 'pointer',
                borderBottom: `1.5px solid ${primaryColors.cyan}`,
                pb: '1px'
              }}
            >
              Create an account
            </Box>
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}

export default SsoLogin
