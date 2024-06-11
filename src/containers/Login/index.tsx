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
import { useTheme, TextField } from '@mui/material'
import BackgroundImages from '../BackgroundImags'

const githubUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}`

const Login = ({ toggleSnackbar, setSnackbarMessage, setLoading }: ILoginProps) => {
  const theme = useTheme()
  const location = useLocation()

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm()

  const loginButton = document.getElementById('loginButton')
  const metamaskLink = document.getElementById('metamaskLink')

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
      <Button
        id='loginButton'
        onClick={handleMetamaskAuth}
        sx={{
          ...styles.ETHButton,
          backgroundColor: theme.palette.buttons,
          color: theme.palette.buttontext,
          '&:hover': {
            backgroundColor: theme.palette.buttonHover
          }
        }}
      >
        <Box component='img' src={metaicon} alt='' sx={{ width: '30px' }} />
        Metamask
      </Button>
    )
  } else {
    ethLoginOpt = (
      <p id='metamaskLink'>
        To login with Ethereum{' '}
        <Link to='https://metamask.io/' target='_blank'>
          Install Metamask
        </Link>
      </p>
    )
  }

  return (
    <>
      <BackgroundImages />
      <Box sx={{ zIndex: 2, width: '100%', maxWidth: '430px', margin: '0 auto' }}>
        <form onSubmit={onSubmit}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              rowGap: 2,
              width: '100%',
              padding: '2rem',
              maxWidth: '430px',
              marginTop: { xs: 15, md: 8 },
              background: theme.palette.pageBackground,
              boxShadow: '0px 1px 20px #00000040',
              zIndex: 20,
              borderRadius: '10px'
            }}
          >
            <Typography
              variant='h5'
              style={{
                textAlign: 'center',
                fontWeight: 'bold',
                fontSize: '2.5rem'
              }}
              sx={{ color: theme.palette.maintext }}
            >
              Login
            </Typography>
            <TextField
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address'
                }
              })}
              fullWidth
              label='Email'
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
              type='email'
              helperText={(errors.email?.message as string) || ''}
              error={!!errors.email}
            />

            <TextField
              {...register('password', {
                required: 'Password is required'
              })}
              fullWidth
              label='Password'
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
            <Box>
              <Button
                sx={{
                  width: '100%',
                  color: theme.palette.buttontext,
                  backgroundColor: theme.palette.buttons,
                  '&:hover': { backgroundColor: theme.palette.buttonHover }
                }}
                type='submit'
                variant='contained'
                size='medium'
              >
                Login
              </Button>
            </Box>
            <Box display='flex' justifyContent='center' alignItems='center' gap={2}>
              <Box sx={{ height: '1px', width: '100px', backgroundColor: theme.palette.divider }}></Box>
              <Typography sx={{ color: theme.palette.texts }}>Or, login with </Typography>
              <Box sx={{ height: '1px', width: '100px', backgroundColor: theme.palette.divider }}></Box>
            </Box>
            <Box>
              <MuiLink
                href={githubUrl}
                sx={{
                  ...styles.authLinkButton,
                  backgroundColor: theme.palette.buttons,
                  color: theme.palette.buttontext,
                  '&:hover': {
                    backgroundColor: theme.palette.buttonHover
                  }
                }}
              >
                <GitHubIcon sx={styles.authIcon} />
                Github
              </MuiLink>
            </Box>
            <Box
              sx={{
                ...styles.ETHButton,
                backgroundColor: theme.palette.buttons,
                color: theme.palette.buttontext,
                '&:hover': {
                  backgroundColor: theme.palette.buttonHover
                }
              }}
            >
              {ethLoginOpt}
            </Box>

            <Typography variant='body1' style={{ color: theme.palette.texts }}>
              Click here to{' '}
              <Typography
                component='span'
                onClick={() => navigate('/register')}
                sx={{ color: theme.palette.maintext, display: 'inline', cursor: 'pointer' }}
              >
                Register
              </Typography>
            </Typography>
          </Box>
        </form>
      </Box>
    </>
  )
}

export default Login
