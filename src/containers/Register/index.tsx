import axios from '../../axiosInstance'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import Typography from '@mui/material/Typography'
import IRegisterProps from './types'
import styles from './styles'
import polygon1 from '../../assets/circle.png'
import polygon2 from '../../assets/Polygon 2.png'
import polygon3 from '../../assets/Polygon 3.png'
import { TextField, Box, Button } from '@mui/material'
import { useMediaQuery } from '@mui/material'
import SearchBar from '../SearchBar'

const Register = ({ toggleSnackbar, setSnackbarMessage, setLoading }: IRegisterProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm()

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
  const isSmallScreen = useMediaQuery('(max-width:819px)')
  return (
    <>
      <img src={polygon1} alt='' style={{ position: 'absolute', top: '3%', left: '-10%' }} />
      <img src={polygon2} alt='' style={{ position: 'absolute', top: '50%', right: '20%' }} />
      <img src={polygon3} alt='' style={{ position: 'absolute', right: '20%', top: '5%', width: '200px' }} />
      {isSmallScreen && <SearchBar />}
      <form onSubmit={onSubmit} style={{ zIndex: 2, width: '100%' }}>
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
