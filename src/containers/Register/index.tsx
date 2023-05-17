import { useState } from 'react'
import axios from '../../axiosInstance'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import Typography from '@mui/material/Typography'
import IRegisterProps from './types'
import styles from './styles'
import polygon1 from '../../assets/circle.png'
import polygon2 from '../../assets/Polygon 2.png'
import polygon3 from '../../assets/Polygon 3.png'
import { TextField, Box, Button, FormControlLabel, Checkbox } from '@mui/material'
import { IconButton, useTheme } from '@mui/material'
import { useMediaQuery } from '@mui/material'
import { InputBase, Paper } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import { useLocation } from 'react-router-dom'

const Register = ({ toggleSnackbar, setSnackbarMessage, setLoading }: IRegisterProps) => {
  const search = useLocation().search
  const query = new URLSearchParams(search).get('query')
  const [searchVal, setSearchVal] = useState<string>(query || '')
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm()

  const handleSearch = async () => {
    window.localStorage.removeItem('claims')
    if (searchVal.trim() !== '') {
      navigate({
        pathname: '/search',
        search: `?query=${searchVal}`
      })
    }
  }

  const handleSearchKeypress = async (event: any) => {
    if (event.key === 'Enter') {
      handleSearch()
    }
  }

  const navigate = useNavigate()

  const onSubmit = handleSubmit(async ({ email, password }) => {
    try {
      if (!email || !password) {
        toggleSnackbar(true)
        setSnackbarMessage('Both email and password are required fields.')
      } else {
        const signupUrl = '/auth/signup'
        const data = { email, password }
        await axios.post(signupUrl, data)
        setLoading(false)
        navigate('/login')
      }
    } catch (err: any) {
      setLoading(false)
      toggleSnackbar(true)
      setSnackbarMessage(err.response.data.message)
      console.error('err', err.response.data.message)
    }
  })
  const isSmallScreen = useMediaQuery('(max-width:1099px)')
  return (
    <>
      <img src={polygon1} alt='' style={{ position: 'absolute', top: '3%', left: '-10%' }} />
      <img src={polygon2} alt='' style={{ position: 'absolute', top: '50%', right: '20%' }} />
      <img src={polygon3} alt='' style={{ position: 'absolute', right: '20%', top: '5%', width: '200px' }} />
      {isSmallScreen ? (
        <>
          {' '}
          <Paper
            component='div'
            sx={{
              zIndex: 1,
              mt: '80px',
              p: '2px 4px',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <InputBase
              type='search'
              value={searchVal}
              placeholder='Search a Claim'
              onChange={e => setSearchVal(e.target.value)}
              onKeyUp={handleSearchKeypress}
              sx={{
                ml: 1,
                flex: 1
              }}
            />
            <IconButton
              type='button'
              sx={{ p: '10px', color: 'primary.main' }}
              aria-label='search'
              onClick={handleSearch}
            >
              <SearchIcon />
            </IconButton>
          </Paper>
        </>
      ) : null}
      <form onSubmit={onSubmit} style={{ zIndex: 2, width: '430px' }}>
        <Box sx={styles.authContainer}>
          <Typography variant='h5' style={{ textAlign: 'center' }} sx={{ color: 'primary.main' }}>
            Register
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
          <Box sx={styles.submitButtonWrap}>
            <Button type='submit' variant='contained' size='medium' sx={styles.submitButton}>
              Register
            </Button>
          </Box>
          <Typography variant='body1' style={{ color: 'black' }}>
            Click here to{' '}
            <Typography
              onClick={() => navigate('/login')}
              sx={{ color: 'primary.main', display: 'inline', cursor: 'pointer' }}
            >
              Login
            </Typography>
          </Typography>
        </Box>
      </form>
    </>
  )
}
export default Register
