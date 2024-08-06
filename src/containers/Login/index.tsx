// Login.tsx
import React, { useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import axios from '../../axiosInstance'
import { useTheme, TextField, IconButton, useMediaQuery, Box, Typography, Button, Link as MuiLink } from '@mui/material'
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import CloseIcon from '@mui/icons-material/Close'
import GitHubIcon from '@mui/icons-material/GitHub'
import DayNightToggle from 'react-day-and-night-toggle'
import MobileLogin from './MobileLogin'
import styles from './styles'
import { GITHUB_CLIENT_ID } from '../../utils/settings'
import ILoginProps from './types'

// Ensure all these assets are imported correctly
import formBackgrounddark from '../../assets/images/formBackgrounddark.svg'
import formBackgroundlight from '../../assets/images/formBackgroundlight.svg'
import loginIllustration from '../../assets/images/loginIllustration.svg'
import metaicon from './metamask-icon.svg'

// Assume these imports are correct, or fix paths
import { authenticateCeramic, ceramic, composeClient } from '../../composedb'
import { getAccountId } from '@didtools/pkh-ethereum' // Ensure this is imported correctly

const githubUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=http://localhost:5173/auth/callback&scope=read:user`

const Login: React.FC<ILoginProps> = ({ toggleSnackbar, setSnackbarMessage, setLoading, toggleTheme, isDarkMode }) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const location = useLocation()
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm()

  const handleAuth = useCallback(
    (accessToken: string, refreshToken: string) => {
      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('refreshToken', refreshToken)
      setLoading(false)
      navigate('/')
    },
    [navigate, setLoading]
  )

  const queryParams = new URLSearchParams(location.search)
  const githubAuthCode = queryParams.get('code')

  useEffect(() => {
    if (githubAuthCode) {
      setLoading(true)
      axios
        .post('/auth/github', { code: githubAuthCode })
        .then(res => {
          const { accessToken, refreshToken } = res.data
          handleAuth(accessToken, refreshToken)
        })
        .catch(err => {
          setLoading(false)
          toggleSnackbar(true)
          setSnackbarMessage('Failed to authenticate with GitHub.')
          console.error('GitHub Auth Error:', err.message)
        })
    }
  }, [githubAuthCode, handleAuth, setLoading, toggleSnackbar, setSnackbarMessage])

  const handleWalletAuth = async () => {
    try {
      const ethProvider = (window as any).ethereum
      if (!ethProvider) throw new Error('Ethereum provider not found')

      const addresses = await ethProvider.request({ method: 'eth_requestAccounts' })
      const accountId = await getAccountId(ethProvider, addresses[0])

      if (accountId) {
        localStorage.setItem('ethAddress', accountId.address)
        await authenticateCeramic(ceramic, composeClient)
        navigate('/')
      } else {
        navigate('/login')
      }
    } catch (e) {
      console.error(`Error trying to authenticate ceramic: ${e}`)
      navigate('/login')
    }
  }

  const handleMetamaskAuth = (event: React.MouseEvent) => {
    event.preventDefault()
    handleWalletAuth()
  }

  const onSubmit = handleSubmit(async ({ email, password }) => {
    setLoading(true)
    try {
      const {
        data: { accessToken, refreshToken }
      } = await axios.post('/auth/login', { email, password })
      handleAuth(accessToken, refreshToken)
      if (location.state?.from) {
        navigate(location.state.from)
      }
    } catch (err: any) {
      setLoading(false)
      toggleSnackbar(true)
      setSnackbarMessage(err.response?.data?.message || 'Login failed.')
      console.error('Login Error: ', err.message)
    }
  })

  // Ensure ethLoginOpt is defined
  let ethLoginOpt: React.ReactNode
  if (typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask) {
    ethLoginOpt = (
      <Box id='loginButton' onClick={handleMetamaskAuth} sx={{ color: theme.palette.buttontext }}>
        <Box component='img' src={metaicon} alt='Metamask Icon' sx={{ width: '30px' }} />
      </Box>
    )
  } else {
    ethLoginOpt = (
      <p id='metamaskLink'>
        To login with Ethereum
        <MuiLink href='https://metamask.io/' target='_blank'>
          Install Metamask
        </MuiLink>
      </p>
    )
  }

  if (isMobile) {
    return <MobileLogin {...{ toggleSnackbar, setSnackbarMessage, setLoading, toggleTheme, isDarkMode }} />
  }

  return (
    <Box
      sx={{
        zIndex: 2,
        width: '100%',
        maxWidth: '1208px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          margin: 'auto',
          flexDirection: 'column',
          paddingRight: '110px',
          boxSizing: 'content-box'
        }}
      >
        <form onSubmit={onSubmit}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              rowGap: 2,
              width: '71.528vw',
              maxWidth: '1030px',
              minWidth: '742.003px',
              height: '64.258vh',
              maxHeight: '658px',
              minHeight: '600px',
              zIndex: 20,
              borderRadius: '10px',
              position: 'relative',
              backgroundImage: `url(${isDarkMode ? formBackgrounddark : formBackgroundlight})`,
              backgroundRepeat: 'no-repeat',
              backgroundSize: 'cover',
              backgroundPositionY: 'center',
              backgroundPositionX: 'center'
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                width: '28.889vw',
                maxWidth: '416px',
                minWidth: '300px',
                height: '53.613vh',
                maxHeight: '550px',
                minHeight: '500px',
                top: '8.359%',
                right: '-16.893%',
                borderRadius: '30px',
                opacity: '1',
                zIndex: 200,
                backgroundImage: `url(${loginIllustration})`,
                backgroundRepeat: 'no-repeat',
                backgroundSize: 'cover',
                backgroundPositionY: 'center',
                backgroundPositionX: 'center'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', position: 'absolute', bottom: '20px', right: '30px' }}>
                <DayNightToggle onChange={toggleTheme} checked={isDarkMode} size={35} />
              </Box>
            </Box>
            <Box
              sx={{
                width: '5.176vw',
                minWidth: '45px',
                maxWidth: '60px',
                height: '5.176vw',
                minHeight: '45px',
                maxHeight: '60px',
                background: theme.palette.stars,
                zIndex: 20,
                borderRadius: '50%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                position: 'absolute',
                top: -25,
                left: -25
              }}
            >
              <Link to='/feed' style={{ textDecoration: 'none' }}>
                <IconButton sx={{ color: '#fff', zIndex: 30 }}>
                  <CloseIcon />
                </IconButton>
              </Link>
            </Box>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                rowGap: 4,
                width: '37.573%',
                minWidth: '300px',
                maxWidth: '387px',
                height: '77.508%',
                minHeight: '470px',
                maxHeight: '510px',
                textAlign: 'center',
                ml: '202px',
                mt: '72px'
              }}
            >
              <Typography
                variant='h5'
                sx={{ color: theme.palette.darkinputtext, textAlign: 'center', fontWeight: 'bold', fontSize: '2.5rem' }}
              >
                Sign in
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'row', gap: '29px', alignItems: 'center', m: 'auto' }}>
                <MuiLink
                  href={githubUrl}
                  sx={{ color: theme.palette.texts, backgroundColor: theme.palette.formBackground, m: 'auto' }}
                >
                  <GitHubIcon />
                </MuiLink>
                <Box sx={{ color: theme.palette.buttontext, cursor: 'pointer' }}>{ethLoginOpt}</Box>
              </Box>
              <TextField
                {...register('email', {
                  required: 'Email is required',
                  pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Invalid email address' }
                })}
                label={
                  <>
                    <EmailOutlinedIcon sx={{ mr: 1 }} />
                    Email
                  </>
                }
                InputLabelProps={{ sx: { display: 'flex', alignItems: 'center' } }}
                sx={{
                  ...styles.inputField,
                  backgroundColor: theme.palette.formBackground,
                  '& .MuiFilledInput-root': { backgroundColor: theme.palette.formBackground },
                  '& .MuiInputLabel-root': { color: theme.palette.darkinputtext },
                  '& .MuiFilledInput-input': { color: theme.palette.darkinputtext },
                  '& .MuiFilledInput-underline:before': { borderBottomColor: theme.palette.darkinputtext },
                  '& .MuiFilledInput-underline:after': { borderBottomColor: theme.palette.darkinputtext },
                  '& .MuiFormHelperText-root': { color: theme.palette.darkinputtext }
                }}
                fullWidth
                variant='filled'
                type='email'
                helperText={(errors.email?.message as string) || ''}
                error={!!errors.email}
              />
              <TextField
                {...register('password', { required: 'Password is required' })}
                fullWidth
                label={
                  <>
                    <LockOutlinedIcon sx={{ mr: 1 }} />
                    Password
                  </>
                }
                InputLabelProps={{ sx: { display: 'flex', alignItems: 'center' } }}
                sx={{
                  ...styles.inputField,
                  backgroundColor: theme.palette.formBackground,
                  '& .MuiFilledInput-root': { backgroundColor: theme.palette.formBackground },
                  '& .MuiInputLabel-root': { color: theme.palette.darkinputtext },
                  '& .MuiFilledInput-input': { color: theme.palette.darkinputtext },
                  '& .MuiFilledInput-underline:before': { borderBottomColor: theme.palette.darkinputtext },
                  '& .MuiFilledInput-underline:after': { borderBottomColor: theme.palette.darkinputtext },
                  '& .MuiFormHelperText-root': { color: theme.palette.darkinputtext }
                }}
                variant='filled'
                type='password'
                helperText={(errors.password?.message as string) || ''}
                error={!!errors.password}
              />
              <Box sx={{ width: '50%', m: 'auto', mt: '2em' }}>
                <Button
                  sx={{
                    width: '100%',
                    color: theme.palette.buttontext,
                    backgroundColor: theme.palette.buttons,
                    '&:hover': { backgroundColor: theme.palette.buttonHover },
                    borderRadius: '80px'
                  }}
                  type='submit'
                  variant='contained'
                  size='medium'
                >
                  Sign in
                </Button>
              </Box>
              <Typography variant='body1' sx={{ color: theme.palette.texts }}>
                Click here to
                <Typography
                  component='span'
                  onClick={() => navigate('/register')}
                  sx={{ color: theme.palette.maintext, display: 'inline', cursor: 'pointer', ml: 1 }}
                >
                  REGISTER
                </Typography>
              </Typography>
              <Typography
                variant='body1'
                sx={{ color: theme.palette.darkinputtext, textDecoration: 'underline', cursor: 'pointer' }}
              >
                forgot your password?
              </Typography>
            </Box>
          </Box>
        </form>
      </Box>
    </Box>
  )
}

export default Login
