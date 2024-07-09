import React, { useEffect, useCallback } from 'react'
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
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
// import BackgroundImages from '../BackgroundImags'
import CloseIcon from '@mui/icons-material/Close'
import loginIllustration from '../../assets/images/loginIllustration.svg'
import formBackgrounddark from '../../assets/images/formBackgrounddark.svg'
import formBackgroundlight from '../../assets/images/formBackgroundlight.svg'
import DayNightToggle from 'react-day-and-night-toggle'

const githubUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}`

const Login = ({ toggleSnackbar, setSnackbarMessage, setLoading, toggleTheme, isDarkMode }: ILoginProps) => {
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
          // paddingRight: '171px',
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
              <Box
                sx={{
                  display: 'flex',
                  // gap: '5px',
                  alignItems: 'center',
                  position: 'absolute',
                  bottom: '20px',
                  right: '30px'
                }}
              >
                <DayNightToggle onChange={toggleTheme} checked={isDarkMode} size={35} />{' '}
                {/* <Typography sx={{ color: 'theme.palette.texts', fontSize: '20px', fontWeight: 'bold' }}>
                    {isDarkMode ? 'Dark' : 'Light'}
                  </Typography> */}
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
                sx={{
                  color: theme.palette.darkinputtext,
                  textAlign: 'center',
                  fontWeight: 'bold',
                  fontSize: '2.5rem'
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
                  m: 'auto'
                }}
              >
                <MuiLink
                  href={githubUrl}
                  sx={{
                    color: theme.palette.texts,
                    backgroundColor: theme.palette.formBackground,
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
                  backgroundColor: theme.palette.formBackground,
                  '& .MuiFilledInput-root': {
                    backgroundColor: theme.palette.formBackground
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
                  backgroundColor: theme.palette.formBackground,
                  '& .MuiFilledInput-root': {
                    backgroundColor: theme.palette.formBackground
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

              <Typography variant='body1' sx={{ color: theme.palette.texts }}>
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
                sx={{ color: theme.palette.darkinputtext, textDecoration: 'underline', cursor: 'pointer' }}
              >
                forgot your password?
              </Typography>
            </Box>
          </Box>
        </form>
        {/* <BackgroundImages /> */}
      </Box>
    </Box>
  )
}

export default Login
