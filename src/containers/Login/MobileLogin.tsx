import React, { useCallback, useState } from 'react'
import axios from '../../axiosInstance'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Box, Typography, Button, TextField, Link as MuiLink } from '@mui/material'
import GitHubIcon from '@mui/icons-material/GitHub'
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import DayNightToggle from 'react-day-and-night-toggle'
import { useTheme } from '@mui/material/styles'
import metaicon from './metamask-icon.svg'
import styles from './styles'
import { brandColors, neutralColors, linkedTrustTheme } from '../../theme/colors'
import ILoginProps from './types'
import loginIllustrationPhone from '../../assets/images/loginIllustrationPhone.svg'
import { connectWallet, createDidFromAddress } from '../../utils/web3Auth'
// Ceramic removed
import LogoutIcon from '@mui/icons-material/Logout'
import circles from '../../assets/images/Circles.svg'
import Ellipse from '../../assets/images/Ellipse.svg'
import { GoogleLogin } from '@react-oauth/google'
import { handleAuthSuccess, maybeCompleteOidcLogin } from '../../utils/authUtils'
import { GITHUB_CLIENT_ID } from '../../utils/settings'

const githubUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&scope=read:user%20user:email`

const MobileLogin = ({ toggleSnackbar, setSnackbarMessage, setLoading, toggleTheme, isDarkMode }: ILoginProps) => {
  const theme = useTheme()
  const location = useLocation()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm()

  const handleAuth = useCallback(
    async (accessToken: string, refreshToken: string) => {
      handleAuthSuccess({ accessToken, refreshToken })
      setLoading(false)
      // In the "Sign in with LinkedTrust" OIDC flow this returns the browser to
      // the relying-party app instead of navigating into LinkedTrust.
      if (await maybeCompleteOidcLogin(accessToken)) return
      navigate(location.state?.from || '/')
    },
    [navigate, location.state?.from, setLoading]
  )

  const handleWalletAuth = async () => {
    try {
      const address = await connectWallet()
      const did = createDidFromAddress(address)

      // Store wallet info
      handleAuthSuccess({
        ethAddress: address,
        did: did
      })

      // Optional: Send to backend to create/verify account
      try {
        const res = await axios.post('/auth/wallet', {
          address,
          did
        })
        if (res.data.accessToken) {
          handleAuthSuccess({
            accessToken: res.data.accessToken,
            refreshToken: res.data.refreshToken
          })
        }
      } catch (backendError) {
        // Backend auth is optional - can still use client-side signing
        console.log('Backend wallet auth not available, using client-side only')
      }

      navigate(location.state?.from || '/')
    } catch (e) {
      console.error('Wallet auth error:', e)
      toggleSnackbar(true)
      setSnackbarMessage('Failed to connect wallet')
    }
  }

  const handleMetamaskAuth = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault()
    handleWalletAuth()
  }

  const [blueskyHandle, setBlueskyHandle] = useState('')
  const [showBlueskyInput, setShowBlueskyInput] = useState(false)
  const [blueskyLoading, setBlueskyLoading] = useState(false)

  const handleBlueskyAuth = async () => {
    if (!blueskyHandle.trim()) {
      toggleSnackbar(true)
      setSnackbarMessage('Enter your Bluesky handle')
      return
    }
    try {
      setBlueskyLoading(true)
      const res = await axios.post('/auth/atproto/authorize', {
        handle: blueskyHandle.trim()
      })
      if (res.data.url) {
        window.location.href = res.data.url
      }
    } catch (e: any) {
      setBlueskyLoading(false)
      toggleSnackbar(true)
      setSnackbarMessage(e.response?.data?.error || 'Bluesky login failed')
    }
  }

  const onSubmit = handleSubmit(async ({ email, password }) => {
    try {
      if (!email || !password) {
        toggleSnackbar(true)
        setSnackbarMessage('Both email and password are required fields.')
        return
      }

      setLoading(true)
      const {
        data: { accessToken, refreshToken }
      } = await axios.post('/auth/login', { email, password })

      handleAuth(accessToken, refreshToken)
    } catch (err: any) {
      setLoading(false)
      toggleSnackbar(true)
      setSnackbarMessage('User not Found!')
      console.error('Login error:', err?.message)
    }
  })

  const socialCircle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: theme.palette.buttontext,
    backgroundColor: theme.palette.formBackground,
    cursor: 'pointer',
    boxShadow: linkedTrustTheme.shadows.sm,
    borderRadius: '50%',
    width: theme.spacing(10),
    height: theme.spacing(10)
  }

  let ethLoginOpt
  if (typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask) {
    ethLoginOpt = (
      <Box
        id='loginButton'
        onClick={handleMetamaskAuth}
        sx={{
          color: theme.palette.buttontext
        }}
      >
        <Box component='img' src={metaicon} alt='' sx={{ width: '50px' }} />
      </Box>
    )
  } else {
    ethLoginOpt = (
      <Typography id='metamaskLink' sx={{ color: theme.palette.texts }}>
        To login with Ethereum &nbsp;
        <MuiLink component={Link} to='https://metamask.io/' target='_blank' sx={{ color: theme.palette.link }}>
          Install Metamask
        </MuiLink>
      </Typography>
    )
  }

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column', overflowX: 'hidden' }}>
      <Box
        sx={{
          width: '11.528vw',
          minWidth: '83px',
          maxWidth: '97px',
          height: '11.528vw',
          minHeight: '88px',
          maxHeight: '100px',
          bottom: theme.spacing(2),
          left: theme.spacing(2),
          position: 'absolute',
          pointerEvents: 'none'
        }}
      >
        <Box component='img' src={circles} alt='' sx={{ width: '100px' }} />
      </Box>
      <Box
        sx={{
          width: '100%',
          height: '61.25vh',
          minHeight: '400px',
          backgroundImage: `url(${loginIllustrationPhone})`,
          backgroundRepeat: 'no-repeat',
          borderRadius: `0 0 ${linkedTrustTheme.borderRadius.lg} ${linkedTrustTheme.borderRadius.lg}`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />
      <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', px: 2, mt: -19 }}>
        <form onSubmit={onSubmit} style={{ width: '100%', maxWidth: 533 }}>
          <Box
            sx={{
              p: 3,
              borderRadius: linkedTrustTheme.borderRadius.lg,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              position: 'relative',
              overflow: 'hidden',
              backgroundColor: theme.palette.pageBackground
            }}
          >
            <Box sx={{ position: 'absolute', top: 0, right: 0, display: 'flex', alignItems: 'center' }}>
              <img src={Ellipse} alt='' />
            </Box>
            <Box sx={{ position: 'absolute', top: theme.spacing(2), right: theme.spacing(2), zIndex: 1 }}>
              <DayNightToggle onChange={toggleTheme} checked={isDarkMode} size={30} />
            </Box>
            <Typography variant='h4' sx={{ color: theme.palette.texts, fontWeight: 500, zIndex: 1 }}>
              Sign in
            </Typography>
            <Box sx={{ display: 'flex', gap: 3, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center', zIndex: 1 }}>
              <Box
                sx={{
                  ...socialCircle
                }}
              >
                <GoogleLogin
                  type='icon'
                  shape='circle'
                  onSuccess={async credentialResponse => {
                    try {
                      const {
                        data: { accessToken, refreshToken }
                      } = await axios.post('/auth/google', {
                        googleAuthCode: credentialResponse.credential
                      })
                      handleAuth(accessToken, refreshToken)
                    } catch (err) {
                      console.error('Google auth error:', err)
                      toggleSnackbar(true)
                      setSnackbarMessage('Google authentication failed')
                    }
                  }}
                  onError={() => {
                    console.error('Google Login Failed')
                    toggleSnackbar(true)
                    setSnackbarMessage('Google authentication failed')
                  }}
                />
              </Box>
              <Box
                sx={{
                  ...socialCircle
                }}
              >
                <MuiLink href={githubUrl} sx={{ color: theme.palette.texts }}>
                  <GitHubIcon sx={{ fontSize: 44 }} />
                </MuiLink>
              </Box>
              {/* Bluesky */}
              <Box
                onClick={() => setShowBlueskyInput(!showBlueskyInput)}
                sx={{
                  ...socialCircle,
                  backgroundColor: showBlueskyInput ? theme.palette.pageBackground : theme.palette.formBackground,
                  transition: 'background-color 0.2s'
                }}
              >
                <Typography sx={{ fontSize: 32, lineHeight: 1 }}>🦋</Typography>
              </Box>
              {/* MetaMask — hidden on mobile, preserved for future use */}
              <Box
                sx={{
                  ...socialCircle,
                  display: 'none'
                }}
              >
                {ethLoginOpt}
              </Box>
            </Box>
            {showBlueskyInput && (
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', width: '100%', mb: 1 }}>
                <TextField
                  fullWidth
                  size='small'
                  placeholder='your-handle.bsky.social'
                  value={blueskyHandle}
                  onChange={e => setBlueskyHandle(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleBlueskyAuth()
                    }
                  }}
                  disabled={blueskyLoading}
                  sx={{
                    backgroundColor: theme.palette.formBackground,
                    '& .MuiOutlinedInput-root': {
                      color: theme.palette.darkinputtext,
                      '& fieldset': { borderColor: theme.palette.darkinputtext + '40' }
                    },
                    '& .MuiInputBase-input::placeholder': { color: theme.palette.darkinputtext, opacity: 0.6 }
                  }}
                />
                <Button
                  variant='contained'
                  onClick={handleBlueskyAuth}
                  disabled={blueskyLoading}
                  sx={{
                    textTransform: 'none',
                    whiteSpace: 'nowrap',
                    backgroundColor: brandColors.bluesky,
                    '&:hover': { backgroundColor: brandColors.blueskyHover }
                  }}
                >
                  {blueskyLoading ? '...' : 'Go'}
                </Button>
              </Box>
            )}
            <TextField
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address'
                }
              })}
              label={
                <React.Fragment>
                  <EmailOutlinedIcon sx={{ mr: 1 }} />
                  Email
                </React.Fragment>
              }
              InputLabelProps={{
                sx: {
                  display: 'flex',
                  alignItems: 'center'
                }
              }}
              sx={{
                ...styles.inputField,
                '& .MuiFilledInput-root': {
                  backgroundColor: theme.palette.pageBackground
                },
                '& .MuiInputLabel-root': {
                  color: theme.palette.darkinputtext
                },
                '& .MuiFilledInput-input': {
                  color: theme.palette.darkinputtext
                },
                '& .MuiFilledInput-underline:before': {
                  borderBottomColor: theme.palette.darkinputtext
                },
                '& .MuiFilledInput-underline:after': {
                  borderBottomColor: theme.palette.darkinputtext
                },
                '& .MuiFormHelperText-root': {
                  color: theme.palette.darkinputtext
                }
              }}
              fullWidth
              variant='filled'
              type='email'
              helperText={(errors.email?.message as string) || ''}
              error={!!errors.email}
              margin='dense'
            />
            <TextField
              {...register('password', {
                required: 'Password is required'
              })}
              fullWidth
              label={
                <React.Fragment>
                  <LockOutlinedIcon sx={{ mr: 1 }} />
                  Password
                </React.Fragment>
              }
              InputLabelProps={{
                sx: {
                  display: 'flex',
                  alignItems: 'center'
                }
              }}
              sx={{
                ...styles.inputField,
                '& .MuiFilledInput-root': {
                  backgroundColor: theme.palette.pageBackground
                },
                '& .MuiInputLabel-root': {
                  color: theme.palette.darkinputtext
                },
                '& .MuiFilledInput-input': {
                  color: theme.palette.darkinputtext
                },
                '& .MuiFilledInput-underline:before': {
                  borderBottomColor: theme.palette.darkinputtext
                },
                '& .MuiFilledInput-underline:after': {
                  borderBottomColor: theme.palette.darkinputtext
                },
                '& .MuiFormHelperText-root': {
                  color: theme.palette.darkinputtext
                }
              }}
              variant='filled'
              type='password'
              helperText={(errors.password?.message as string) || ''}
              error={!!errors.password}
              margin='dense'
            />
            <Button
              sx={{
                minWidth: 200,
                px: 4,
                color: theme.palette.buttontext,
                backgroundColor: theme.palette.buttons,
                '&:hover': { backgroundColor: theme.palette.buttonHover },
                borderRadius: linkedTrustTheme.borderRadius.full,
                mt: 1
              }}
              type='submit'
              variant='contained'
              size='large'
            >
              Sign in <LogoutIcon sx={{ ml: 2 }} />
            </Button>
          </Box>
        </form>
      </Box>
      <Typography variant='body1' sx={{ color: theme.palette.texts, textAlign: 'center', my: 3 }}>
        Click here to
        <Typography
          component='span'
          onClick={() => navigate('/register')}
          sx={{ color: theme.palette.maintext, display: 'inline', cursor: 'pointer', ml: 1 }}
        >
          Register
        </Typography>
      </Typography>
    </Box>
  )
}

export default MobileLogin
