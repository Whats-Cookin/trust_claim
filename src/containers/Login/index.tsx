import { useEffect, useCallback } from 'react'
import axios from '../../axiosInstance'
import { useLocation, useNavigate } from 'react-router-dom'
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
import { useTheme } from '@mui/material'
import { TextField } from '@mui/material'
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
    console.log('in handle auth, You have a token: ' + accessToken)
    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', refreshToken)
    setLoading(false)
    navigate('/')
  }, [])

  const navigate = useNavigate()
  const queryParams = useQueryParams()
  const githubAuthCode = queryParams.get('code')

  console.log('Hi this is Login comonent')

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
      } catch (e) {
        console.log(`Error trying to authenticate ceramic: ${e}`)
      }
      if (location.state?.from) {
        navigate(location.state.from)
      } else {
        navigate('/')
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
    console.log('You pressed submit, congratulations')
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
      <button id='loginButton' onClick={handleMetamaskAuth} style={styles.authbtn}>
        <span>
          <img src={metaicon} alt='' style={{ width: '30px' }} />
        </span>
        Metamask{' '}
      </button>
    )
  } else {
    ethLoginOpt = (
      <p id='metamaskLink'>
        To login with Ethereum{' '}
        <a href='https://metamask.io/' target='_blank'>
          Install Metamask
        </a>
      </p>
    )
  }

  return (
    <>
      <BackgroundImages />
      <form onSubmit={onSubmit} style={{ zIndex: 2, width: '100%', maxWidth: '430px', margin: '0 auto' }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            rowGap: 2,
            width: '100%',
            padding: '2rem',
            maxWidth: '430px',
            marginTop: { xs: 15, md: 8 },
            background: '#FFFFFF',
            boxShadow: '0px 1px 20px rgba(0, 0, 0, 0.25)',
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
            sx={{ color: 'primary.main' }}
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
            sx={styles.inputField}
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
            sx={styles.inputField}
            variant='filled'
            type='password'
            helperText={(errors.password?.message as string) || ''}
            error={!!errors.password}
          />
          <Box>
            <Button sx={{ width: '100%' }} type='submit' variant='contained' size='medium'>
              Login
            </Button>
          </Box>
          <Box display='flex' justifyContent='center' alignItems='center' gap={2}>
            <span style={{ height: '1px', width: '100px', backgroundColor: 'black' }}></span>
            <Typography>Or, login with </Typography>
            <span style={{ height: '1px', width: '100px', backgroundColor: 'black' }}></span>
          </Box>
          <Box>
            <MuiLink
              href={githubUrl}
              sx={styles.authLinkButton}
              style={{ border: `1px solid ${theme.palette.primary.main}` }}
            >
              <GitHubIcon sx={styles.authIcon} />
              Github
            </MuiLink>
          </Box>
          <Box sx={styles.ETHButton} style={{ border: `1px solid ${theme.palette.primary.main}` }}>
            {ethLoginOpt}
          </Box>

          <Typography variant='body1' style={{ color: 'black' }}>
            Click here to{' '}
            <Typography
              onClick={() => navigate('/register')}
              sx={{ color: 'primary.main', display: 'inline', cursor: 'pointer' }}
            >
              Register
            </Typography>
          </Typography>
        </Box>
      </form>
    </>
  )
}
export default Login
