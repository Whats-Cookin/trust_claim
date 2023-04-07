import { useEffect, useState, useCallback } from 'react'
import axios from 'axios'
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
import { BACKEND_BASE_URL, GITHUB_CLIENT_ID } from '../../utils/settings'

const githubUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}`

const Login = ({ toggleSnackbar, setSnackbarMessage, setLoading }: ILoginProps) => {
  const [emailLogin, setEmailLogin] = useState('')
  const [passwordLogin, setPasswordLogin] = useState('')
  const [ethAccountId, setEthAccountId] = useState('')

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
      const githubAuthUrl = `${BACKEND_BASE_URL}/auth/github`
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
        const clients = useCeramicContext()
        const { ceramic, composeClient } = clients
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

  const handleLogin = async () => {
    try {
      if (!emailLogin || !passwordLogin) {
        toggleSnackbar(true)
        setSnackbarMessage('Both email and password are required fields.')
      } else {
        setLoading(true)
        const loginUrl = `${BACKEND_BASE_URL}/auth/login`
        const data = { email: emailLogin, password: passwordLogin }
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
  }

  // Check if Metamask is installed
  let ethLoginOpt
  if (typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask) {
    ethLoginOpt = (
      <button id='loginButton' onClick={handleWalletAuth} style={styles.authbtn}>
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
      <img src={polygon1} alt='' className='absolute top-[3%] left-[-10%]' />
      <img src={polygon2} alt='' className='absolute top-[50%] right-[20%]' />
      <img src={polygon3} alt='' className='absolute right-[20%] top-[5%] w-[200px]' />
      <Box sx={styles.authContainer}>
        <p className='text-center text-[#80B8BD] font-bold text-2xl'>Login</p>
        <TextField
          value={emailLogin}
          fullWidth
          label='Email'
          sx={styles.inputField}
          variant='filled'
          onChange={(e: any) => setEmailLogin(e.currentTarget.value)}
          type='email'
        />
        <TextField
          value={passwordLogin}
          fullWidth
          label='Password'
          sx={styles.inputField}
          variant='filled'
          onChange={(e: any) => setPasswordLogin(e.currentTarget.value)}
          type='password'
        />
        <Box sx={styles.submitButtonWrap}>
          <Button onClick={handleLogin} variant='contained' size='medium' sx={styles.submitButton}>
            Login
          </Button>
        </Box>
        <div className='flex items-center justify-center gap-2'>
          <span className='h-[1px] w-[100px] bg-[black]'></span>
          <Typography component='div'>Or, Login with </Typography>{' '}
          <span className='h-[1px] w-[100px] bg-[black]'></span>
        </div>
        <Box>
          <MuiLink href={githubUrl} sx={styles.authLinkButton}>
            <GitHubIcon sx={styles.authIcon} />
            Github
          </MuiLink>
        </Box>
        <Box sx={styles.ETHButton}>{ethLoginOpt}</Box>

        <Link to='/register' style={{ textDecoration: 'none' }}>
          <Typography variant='body1' color='black'>
            Click here to register
          </Typography>
        </Link>
      </Box>
    </>
  )
}
export default Login
