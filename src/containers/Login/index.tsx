import React from 'react'
import { useEffect, useCallback } from 'react'
import axios from '../../axiosInstance'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { getAccountId } from '@didtools/pkh-ethereum'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import MuiLink from '@mui/material/Link'
import GitHubIcon from '@mui/icons-material/GitHub'
import metaicon from './metamask-icon.svg'
import styles from './styles'
import ILoginProps from './types'
import { authenticateCeramic, ceramic, composeClient } from '../../composedb'
import { useQueryParams } from '../../hooks'
import { GITHUB_CLIENT_ID } from '../../utils/settings'
import { useForm } from 'react-hook-form'
import { useTheme, TextField, IconButton } from '@mui/material'
import EmailIcon from '@mui/icons-material/Email'
import LockIcon from '@mui/icons-material/Lock'
import BackgroundImages from '../BackgroundImags'
import CloseIcon from '@mui/icons-material/Close'
import loginImage from '../../assets/images/login.png'

const githubUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}`

const Login = ({ toggleSnackbar, setSnackbarMessage, setLoading }: ILoginProps) => {
  const theme = useTheme()
  const location = useLocation()

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm()

  const handleAuth = useCallback((accessToken: string, refreshToken: string) => {
    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', refreshToken)
    setLoading(false)
    navigate('/')
  }, [])

  const navigate = useNavigate()
  const queryParams = useQueryParams()
  const githubAuthCode = queryParams.get('code')

  useEffect(() => {
    if (githubAuthCode) {
      const githubAuthUrl = '/auth/github'
      axios
        .post<{ accessToken: string; refreshToken: string }>(githubAuthUrl, {
          githubAuthCode
        })
        .then(res => {
          const { accessToken, refreshToken } = res.data
          handleAuth(accessToken, refreshToken)
        })
        .catch(err => {
          setLoading(false)
          toggleSnackbar(true)
          setSnackbarMessage(err.message)
          console.error(err.message)
        })
    }
  }, [])

  const handleWalletAuth = async () => {
    console.log('Hi this is handle wallet auth nice to meet you')
    const ethProvider = window.ethereum // import/get your web3 eth provider
    const addresses = await ethProvider.request({
      method: 'eth_requestAccounts'
    })
    const accountId = await getAccountId(ethProvider, addresses[0])

    console.log('In handlewalletauth, accountId is ' + accountId)

    if (accountId) {
      // User address is found, store and navigate to home page
      localStorage.setItem('ethAddress', accountId.address)
      try {
        console.log('Trying to authenticate ceramic')
        await authenticateCeramic(ceramic, composeClient)
        navigate('/')
      } catch (e) {
        console.log(`Error trying to authenticate ceramic: ${e}`)
      }
      if (location.state?.from) {
        navigate(location.state.from)
      }
    } else {
      navigate('/login')
    }
  }
  const handleMetamaskAuth = (event: { preventDefault: () => void }) => {
    event.preventDefault()
    handleWalletAuth()
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
        } = await axios.post<{ accessToken: string; refreshToken: string }>(loginUrl, data)

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

  // Check if Metamask is installed
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
        <Box component='img' src={metaicon} alt='' sx={{ width: '30px' }} />
      </Box>
    )
  } else {
    ethLoginOpt = (
      <p id='metamaskLink'>
        To login with Ethereum
        <Link to='https://metamask.io/' target='_blank'>
          Install Metamask
        </Link>
      </p>
    )
  }

  return (
    <>
      <Box
        sx={{
          zIndex: 2,
          width: '100%',
          maxWidth: '750px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh'
        }}
      >
        <form onSubmit={onSubmit}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              rowGap: 2,
              width: '800px',
              hight: '658px',
              background: '#172D2D',
              boxShadow: '0px 1px 20px #00000040',
              zIndex: 20,
              borderRadius: '10px',
              position: 'relative'
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                width: '350px',
                height: '400px',
                top: '25px',
                right: -150,
                borderRadius: '30px',
                opacity: '1',
                zIndex: 200,
                background: '#009688'
              }}
            >
              <Box
                style={{
                  position: 'absolute',
                  bottom: '0', // Adjust this value for positioning
                  left: '0', // Adjust this value for positioning
                  width: '140px', // Diameter of the circle
                  height: '140px', // Diameter of the circle
                  backgroundColor: '#172D2D', // Background color
                  borderRadius: '0 304px 0 30px', // Quarter circle shape
                  transform: 'rotate(0deg)' // Rotate to position correctly
                }}
              />
              <img
                src={loginImage}
                alt='Logo Image'
                style={{
                  width: '100%',
                  height: '85%',
                  borderRadius: '30px'
                }}
              />
            </Box>
            <Box
              sx={{
                width: '45px',
                height: '45px',
                background: '#009688',
                zIndex: 20,
                borderRadius: '50%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                position: 'absolute',
                top: -15,
                left: -15
              }}
            >
              <Link to='/feed' style={{ textDecoration: 'none' }}>
                <IconButton
                  sx={{
                    color: '#fff',
                    zIndex: 30
                  }}
                >
                  <CloseIcon />
                </IconButton>
              </Link>
            </Box>

            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                rowGap: 2,
                width: '387px',
                padding: '2rem',
                textAlign: 'center',
                ml: '7em'
              }}
            >
              <Typography
                variant='h5'
                sx={{ color: '#fff', textAlign: 'center', fontWeight: 'bold', fontSize: '2.5rem' }}
              >
                Sign in
              </Typography>

              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  gap: 5,
                  alignItems: 'center',
                  m: 'auto'
                }}
              >
                <MuiLink
                  href={githubUrl}
                  sx={{
                    color: theme.palette.buttontext,
                    m: 'auto'
                  }}
                >
                  <GitHubIcon sx={styles.authIcon} />
                </MuiLink>

                <Box
                  sx={{
                    color: theme.palette.buttontext,
                    cursor: 'pointer'
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
                    <EmailIcon sx={{ mr: 1 }} />
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
                  backgroundColor: theme.palette.formBackground,
                  '& .MuiFilledInput-root': {
                    backgroundColor: theme.palette.formBackground
                  },
                  '& .MuiInputLabel-root': {
                    color: theme.palette.texts
                  },
                  '& .MuiFilledInput-input': {
                    color: theme.palette.texts
                  },
                  '& .MuiFilledInput-underline:before': {
                    borderBottomColor: theme.palette.texts
                  },
                  '& .MuiFilledInput-underline:after': {
                    borderBottomColor: theme.palette.texts
                  },
                  '& .MuiFormHelperText-root': {
                    color: theme.palette.texts
                  }
                }}
                fullWidth
                variant='filled'
                type='email'
                helperText={(errors.email?.message as string) || ''}
                error={!!errors.email}
              />

              <TextField
                {...register('password', {
                  required: 'Password is required'
                })}
                fullWidth
                label={
                  <React.Fragment>
                    <LockIcon sx={{ mr: 1 }} />
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
                  backgroundColor: theme.palette.formBackground,
                  '& .MuiFilledInput-root': {
                    backgroundColor: theme.palette.formBackground
                  },
                  '& .MuiInputLabel-root': {
                    color: theme.palette.texts
                  },
                  '& .MuiFilledInput-input': {
                    color: theme.palette.texts
                  },
                  '& .MuiFilledInput-underline:before': {
                    borderBottomColor: theme.palette.texts
                  },
                  '& .MuiFilledInput-underline:after': {
                    borderBottomColor: theme.palette.texts
                  },
                  '& .MuiFormHelperText-root': {
                    color: theme.palette.texts
                  }
                }}
                variant='filled'
                type='password'
                helperText={(errors.password?.message as string) || ''}
                error={!!errors.password}
              />

              <Box
                sx={{
                  width: '50%',
                  m: 'auto',
                  mt: '2em'
                }}
              >
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

              <Typography variant='body1' sx={{ color: theme.palette.texts, mt: '5px' }}>
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
            <BackgroundImages />
          </Box>
        </form>
      </Box>
    </>
  )
}

export default Login
