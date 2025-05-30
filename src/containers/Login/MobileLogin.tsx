import React, { useCallback } from 'react'
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
import ILoginProps from './types'
import loginIllustrationPhone from '../../assets/images/loginIllustrationPhone.svg'
import { connectWallet, createDidFromAddress } from '../../utils/web3Auth'
// Ceramic removed
import LogoutIcon from '@mui/icons-material/Logout'
import circles from '../../assets/images/Circles.svg'
import Ellipse from '../../assets/images/Ellipse.svg'
import { GoogleLogin } from '@react-oauth/google'
import { handleAuthSuccess } from '../../utils/authUtils'

const githubUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.REACT_APP_GITHUB_CLIENT_ID}`

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
    (accessToken: string, refreshToken: string) => {
      handleAuthSuccess({ accessToken, refreshToken })
      setLoading(false)
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
    <Box
      sx={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Box
        sx={{
          width: '11.528vw',
          minWidth: '83px',
          maxWidth: '97px',
          height: '11.528vw',
          minHeight: '88px',
          maxHeight: '100px',
          bottom: '2.344vh',
          left: '4.306vw',
          position: 'absolute'
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
          borderRadius: '0 0 20px 20px',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          bottom: '152px'
        }}
      >
        <form onSubmit={onSubmit}>
          <Box
            sx={{
              width: '74.028vw',
              minWidth: '320px',
              maxWidth: '533px',
              height: '49.844vh',
              minHeight: '430px',
              maxHeight: '638px',
              padding: '20px',
              borderRadius: '20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              position: 'relative',
              backgroundColor: theme.palette.pageBackground,
              backgroundRepeat: 'no-repeat',
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: '0px',
                right: '0px',
                display: 'flex',
                alignItems: 'center',
                zIndex: '1'
              }}
            >
              <img src={Ellipse} alt='' />
            </Box>
            <Box
              sx={{
                position: 'absolute',
                top: '30px',
                right: '7px',
                display: 'flex',
                alignItems: 'center',
                zIndex: '5'
              }}
            >
              <DayNightToggle onChange={toggleTheme} checked={isDarkMode} size={30} />
            </Box>
            <Typography
              variant='h5'
              sx={{
                color: theme.palette.texts,
                top: '15px',
                right: '51%',
                transform: 'translateX(50%)',
                textAlign: 'center',
                fontWeight: 500,
                fontSize: '2.5rem',
                position: 'absolute',
                marginBottom: '20px',
                zIndex: '1'
              }}
            >
              Sign in
            </Typography>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                gap: '29px',
                alignItems: 'center',
                marginBottom: '20px',
                mt: '65px',
                zIndex: '2'
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: theme.palette.buttontext,
                  backgroundColor: theme.palette.formBackground,
                  cursor: 'pointer',
                  boxShadow: '0px 1px 5px #ffffff20',
                  borderRadius: '50%',
                  width: '82px',
                  height: '82px'
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
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: theme.palette.buttontext,
                  backgroundColor: theme.palette.formBackground,
                  cursor: 'pointer',
                  boxShadow: '0px 1px 5px #ffffff20',
                  borderRadius: '50%',
                  width: '82px',
                  height: '82px'
                }}
              >
                <MuiLink href={githubUrl} sx={{ color: theme.palette.texts }}>
                  <GitHubIcon sx={{ fontSize: '50px' }} />
                </MuiLink>
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: theme.palette.buttontext,
                  backgroundColor: theme.palette.formBackground,
                  cursor: 'pointer',
                  boxShadow: '0px 1px 5px #ffffff20',
                  borderRadius: '50%',
                  width: '82px',
                  height: '82px'
                }}
              >
                {ethLoginOpt}
              </Box>
            </Box>
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
                },
                paddingBottom: '53px'
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
                width: '31.528vw',
                minWidth: '200px',
                maxWidth: '227px',
                height: '72px',
                color: theme.palette.buttontext,
                backgroundColor: theme.palette.buttons,
                '&:hover': { backgroundColor: theme.palette.buttonHover },
                borderRadius: '80px',
                fontWeight: 'bold',
                fontSize: '20px',
                marginTop: '20px'
              }}
              type='submit'
              variant='contained'
              size='medium'
            >
              Sign in <LogoutIcon sx={{ ml: 2 }} />
            </Button>
          </Box>
        </form>
      </Box>
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          position: 'relative',
          bottom: '102px'
        }}
      >
        <Typography variant='body1' sx={{ color: theme.palette.texts, marginTop: '20px' }}>
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
    </Box>
  )
}

export default MobileLogin
