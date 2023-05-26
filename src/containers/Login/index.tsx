import { useEffect, useState, useCallback } from 'react'
import axios from '../../axiosInstance'
import { useNavigate } from 'react-router-dom'
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
import { useLocation } from 'react-router-dom'
import { useQueryParams } from '../../hooks'
import { GITHUB_CLIENT_ID } from '../../utils/settings'
import { useForm } from 'react-hook-form'
import { useMediaQuery, Grid, TextField, useTheme } from '@mui/material'
import SearchBar from '../../components/SearchBar'
import BackgroundImages from '../BackgroundImags'

const githubUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}`

const Login = ({ toggleSnackbar, setSnackbarMessage, setLoading }: ILoginProps) => {
  const theme = useTheme()

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
    const ethProvider = window.ethereum // import/get your web3 eth provider
    const addresses = await ethProvider.request({
      method: 'eth_requestAccounts'
    })
    const accountId = await getAccountId(ethProvider, addresses[0])

    if (accountId) {
      // User address is found, store and navigate to home page
      localStorage.setItem('ethAddress', accountId.address)
      try {
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

  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'))

  return (
    <>
      {isSmallScreen && <SearchBar />}

      <BackgroundImages />
      <form onSubmit={onSubmit} style={{ zIndex: 1 }}>
        <Box sx={styles.authContainer}>
          <Typography
            sx={{ color: 'primary.main' }}
            style={{
              textAlign: 'center',
              fontWeight: 'bold',
              fontSize: '2.5rem'
            }}
          >
            Login
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
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
            </Grid>
            <Grid item xs={12}>
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
            </Grid>
            <Grid item xs={12}>
              <Button sx={{ width: '100%' }} type='submit' variant='contained' size='medium'>
                Login
              </Button>
            </Grid>
            <Grid item xs={12}>
              <Box display='flex' justifyContent='center' alignItems='center' gap={2}>
                <span style={{ height: '1px', width: '100px', backgroundColor: 'black' }}></span>
                <Typography>Or, Login with </Typography>
                <span style={{ height: '1px', width: '100px', backgroundColor: 'black' }}></span>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Box display='flex' justifyContent='center'>
                <MuiLink
                  href={githubUrl}
                  sx={styles.authLinkButton}
                  style={{ border: `1px solid ${theme.palette.primary.main}` }}
                >
                  <GitHubIcon sx={styles.authIcon} />
                  Github
                </MuiLink>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Box sx={styles.ETHButton} style={{ border: `1px solid ${theme.palette.primary.main}` }}></Box>
            </Grid>
            <Grid item xs={12}>
              <Typography variant='body1' style={{ color: 'black' }}>
                Click here to{' '}
                <Typography
                  onClick={() => navigate('/register')}
                  sx={{ color: 'primary.main', display: 'inline', cursor: 'pointer' }}
                >
                  Register
                </Typography>
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </form>
    </>
  )
}

export default Login
