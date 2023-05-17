import { useEffect, useState, useCallback } from 'react'
import axios from '../../axiosInstance'
import { useNavigate, Link } from 'react-router-dom'
import { getAccountId } from '@didtools/pkh-ethereum'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import MuiLink from '@mui/material/Link'
import GitHubIcon from '@mui/icons-material/GitHub'
import metaicon from './metamask-icon.svg'
import polygon1 from '../../assets/circle.png'
import polygon2 from '../../assets/Polygon 2.png'
import polygon3 from '../../assets/Polygon 3.png'
import styles from './styles'
import ILoginProps from './types'
import { useCeramicContext, authenticateCeramic } from '../../composedb'
import { useQueryParams } from '../../hooks'
import { GITHUB_CLIENT_ID } from '../../utils/settings'
import { useForm } from 'react-hook-form'
import { useTheme } from '@mui/material'

const githubUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}`

const Login = ({ toggleSnackbar, setSnackbarMessage, setLoading }: ILoginProps) => {
  const theme = useTheme()
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm()

  const [windowWidth, setWindowWidth] = useState(window.innerWidth)

  const handleResize = () => {
    setWindowWidth(window.innerWidth)
  }

  useEffect(() => {
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  const loginButton = document.getElementById('loginButton')
  const metamaskLink = document.getElementById('metamaskLink')

  const ceramicClients = useCeramicContext()

  const handleAuth = useCallback(
    (accessToken: string, refreshToken: string) => {
      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('refreshToken', refreshToken)
      setLoading(false)
      navigate('/')
    },
    [setLoading]
  )

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
    const ethProvider = window.ethereum // import/get your web3 eth provider
    const addresses = await ethProvider.request({
      method: 'eth_requestAccounts'
    })
    const accountId = await getAccountId(ethProvider, addresses[0])

    if (accountId) {
      // User address is found, store and navigate to home page
      localStorage.setItem('ethAddress', accountId.address)
      try {
        const { ceramic, composeClient } = ceramicClients
        await authenticateCeramic(ceramic, composeClient)
      } catch (e) {
        console.log(`Error trying to authenticate ceramic: ${e}`)
      }
      navigate('/')
    } else {
      // User address is not found, navigate to login page
      navigate('/login')
    }
  }

  const onSubmit = handleSubmit(async ({ email, password, ethAccountId }) => {
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
        onClick={handleWalletAuth}
        variant='contained'
        size='medium'
        startIcon={<img src={metaicon} alt='' style={{ width: '30px' }} />}
        sx={styles.authbtn}
      >
        Metamask
      </Button>
    )
  } else {
    ethLoginOpt = (
      <Typography id='metamaskLink' variant='body2'>
        To login with Ethereum{' '}
        <MuiLink href='https://metamask.io/' target='_blank' color='primary'>
          Install Metamask
        </MuiLink>
      </Typography>
    )
  }

  return (
    <Box display='flex' justifyContent='center' alignItems='center' minHeight='100vh' bgcolor='#f5f5f5'>
      <>
        <img src={polygon1} alt='' style={{ position: 'absolute', top: '3%', left: '-10%' }} />
        <img src={polygon2} alt='' style={{ position: 'absolute', top: '50%', right: '20%' }} />
        <img src={polygon3} alt='' style={{ position: 'absolute', right: '20%', top: '5%', width: '200px' }} />
        <form onSubmit={onSubmit} style={{ zIndex: 1 }}>
          <Box sx={styles.authContainer}>
            <Typography
              variant='h4'
              sx={{
                color: theme.palette.primary.main,
                textAlign: 'center',
                fontWeight: 'bold'
              }}
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
            <Button
              type='submit'
              variant='contained'
              size='large'
              sx={styles.authbtn}
              disabled={!!errors.email || !!errors.password}
            >
              Login
            </Button>
            {ethLoginOpt}
            <Typography variant='body2'>
              Don't have an account?{' '}
              <MuiLink component={Link} to='/signup' color='primary'>
                Sign Up
              </MuiLink>
            </Typography>
            <Typography variant='body2'>
              Or login with{' '}
              <MuiLink href={githubUrl} color='primary'>
                <GitHubIcon /> GitHub
              </MuiLink>
            </Typography>
          </Box>
        </form>
      </>
    </Box>
  )
}

export default Login
