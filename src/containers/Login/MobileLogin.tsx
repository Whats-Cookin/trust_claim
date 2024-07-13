import React from 'react'
import axios from '../../axiosInstance'
import { useLocation, useNavigate } from 'react-router-dom'
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
import { getAccountId } from '@didtools/pkh-ethereum'
import { authenticateCeramic, ceramic, composeClient } from '../../composedb'
import LogoutIcon from '@mui/icons-material/Logout'
import circles from '../../assets/images/Circles.svg'
import Ellipse from '../../assets/images/Ellipse.svg'

const githubUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.REACT_APP_GITHUB_CLIENT_ID}`

const MobileLogin = ({ toggleSnackbar, setSnackbarMessage, setLoading, toggleTheme, isDarkMode }: ILoginProps) => {
  const theme = useTheme()
  const location = useLocation()
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm()
  const navigate = useNavigate()

  const handleAuth = (accessToken: string, refreshToken: string) => {
    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', refreshToken)
    setLoading(false)
    navigate('/')
  }

  const onSubmit = handleSubmit(async ({ email, password }) => {
    try {
      if (!email || !password) {
        toggleSnackbar(true)
        setSnackbarMessage('Both email and password are required fields.')
      } else {
        setLoading(true)
        const loginUrl = '/auth/login'
        const data = { email, password }
        const {
          data: { accessToken, refreshToken }
        } = await axios.post(loginUrl, data)
        handleAuth(accessToken, refreshToken)
        if (location.state?.from) {
          navigate(location.state?.from)
        }
      }
    } catch (err: any) {
      setLoading(false)
      toggleSnackbar(true)
      setSnackbarMessage('User not Found!')
      console.error('Error: ', err?.message)
    }
  })

  const handleWalletAuth = async () => {
    const ethProvider = window.ethereum
    const addresses = await ethProvider.request({ method: 'eth_requestAccounts' })
    const accountId = await getAccountId(ethProvider, addresses[0])
    if (accountId) {
      localStorage.setItem('ethAddress', accountId.address)
      try {
        await authenticateCeramic(ceramic, composeClient)
        navigate('/')
      } catch (e) {
        console.log(`Error trying to authenticate ceramic: ${e}`)
      }
      if ((location as any).state?.from) {
        navigate((location as any).state.from)
      }
    } else {
      navigate('/login')
    }
  }

  const handleMetamaskAuth = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault()
    handleWalletAuth()
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
      <p id='metamaskLink'>
        To login with Ethereum
        <MuiLink href='https://metamask.io/' target='_blank'>
          Install Metamask
        </MuiLink>
      </p>
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
              minWidth: '433px',
              maxWidth: '533px',
              height: '49.844vh',
              minHeight: '538px',
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
                alignItems: 'center'
              }}
            >
              <img src={Ellipse} alt='' />
            </Box>
            <Box
              sx={{
                position: 'absolute',
                top: '40px',
                right: '15px',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <DayNightToggle onChange={toggleTheme} checked={isDarkMode} size={35} />
            </Box>
            <Typography
              variant='h5'
              sx={{
                color: theme.palette.darkinputtext,
                textAlign: 'center',
                fontWeight: '600',
                fontSize: '2.5rem',
                fontFamily: 'montserrat',
                marginBottom: '20px'
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
                marginBottom: '20px'
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
                <MuiLink
                  href={githubUrl}
                  sx={{
                    color: theme.palette.texts
                  }}
                >
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
        <Typography
          variant='body1'
          sx={{
            color: theme.palette.darkinputtext,
            textDecoration: 'underline',
            cursor: 'pointer',
            marginTop: '10px'
          }}
        >
          forgot your password?
        </Typography>
      </Box>
    </Box>
  )
}

export default MobileLogin
