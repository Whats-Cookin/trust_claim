import axios from '../../axiosInstance'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import Typography from '@mui/material/Typography'
import IRegisterProps from './types'
import { TextField, Box, Button, useTheme } from '@mui/material'
import BackgroundImages from '../BackgroundImags'

const Register = ({ toggleSnackbar, setSnackbarMessage, setLoading }: IRegisterProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm()

  const navigate = useNavigate()
  const theme = useTheme()

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
            background: theme.palette.pageBackground,
            boxShadow: '0px 1px 20px theme.pallete.shadows',
            zIndex: 20,
            borderRadius: '10px'
          }}
        >
          <Typography
            variant='h5'
            sx={{ color: theme.palette.maintext, textAlign: 'center', fontWeight: 'bold', fontSize: '2.5rem' }}
          >
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
            sx={{
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
              type='submit'
              variant='contained'
              size='medium'
              sx={{
                width: '100%',
                color: theme.palette.buttontext,
                backgroundColor: theme.palette.buttons,
                '&:hover': { backgroundColor: theme.palette.buttonHover }
              }}
            >
              Register
            </Button>
          </Box>
          <Typography variant='body1' sx={{ color: theme.palette.texts }}>
            Click here to
            <Typography
              onClick={() => navigate('/login')}
              sx={{ color: theme.palette.maintext, display: 'inline', cursor: 'pointer' }}
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
