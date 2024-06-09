import axios from '../../axiosInstance'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import Typography from '@mui/material/Typography'
import IRegisterProps from './types'
import { TextField, Box, Button } from '@mui/material'
import BackgroundImages from '../BackgroundImags'
import { useTheme } from '@mui/material'

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
      <Box sx={{ zIndex: 2, width: '100%', maxWidth: '430px', margin: '0 auto' }}>
        <form onSubmit={onSubmit}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              rowGap: 2,
              padding: '2rem',
              maxWidth: '430px',
              margin: '0 auto',
              marginTop: 2,
              boxShadow: '0px 1px 20px #00000040',
              zIndex: 20,
              borderRadius: '10px'
            }}
          >
            <Typography variant='h5' align='center' sx={{ color: theme.palette.maintext }}>
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
              variant='filled'
              type='email'
              helperText={(errors.email?.message as string) || ''}
              error={!!errors.email}
              sx={{
                bgcolor: '#fff',
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
            />
            <TextField
              {...register('password', {
                required: 'Password is required'
              })}
              fullWidth
              label='Password'
              variant='filled'
              type='password'
              helperText={(errors.password?.message as string) || ''}
              error={!!errors.password}
              sx={{
                bgcolor: '#fff',
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
            />
            <Box sx={{ marginTop: 2 }}>
              <Button
                type='submit'
                variant='contained'
                size='medium'
                sx={{
                  width: '100%',
                  backgroundColor: theme.palette.buttons,
                  color: theme.palette.buttontext,
                  '&:hover': {
                    backgroundColor: theme.palette.buttonHover
                  }
                }}
              >
                Register
              </Button>
            </Box>
            <Typography variant='body1' sx={{ color: '#fff', marginTop: 2 }}>
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
      </Box>
    </>
  )
}

export default Register
