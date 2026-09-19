import React from 'react'
import axios from '../../axiosInstance'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import Typography from '@mui/material/Typography'
import IRegisterProps from './types'
import { TextField, Box, Button, useTheme } from '@mui/material'
import DayNightToggle from 'react-day-and-night-toggle'
import styles from './styles'
import { linkedTrustTheme } from '../../theme/colors'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import RegisterIllustrationPhone from '../../assets/images/RegisterIllustrationPhone.svg'
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined'
import LogoutIcon from '@mui/icons-material/Logout'
import circles from '../../assets/images/Circles.svg'
import Ellipse from '../../assets/images/Ellipse.svg'

const MobileRegister = ({
  toggleSnackbar,
  setSnackbarMessage,
  setLoading,
  toggleTheme,
  isDarkMode
}: IRegisterProps) => {
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
    <Box sx={{ width: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column', overflowX: 'hidden' }}>
      <Box
        sx={{
          width: '11.528vw',
          minWidth: '83px',
          maxWidth: '97px',
          height: '11.528vw',
          minHeight: '88px',
          maxHeight: '100px',
          bottom: theme.spacing(2),
          left: theme.spacing(2),
          position: 'absolute',
          pointerEvents: 'none'
        }}
      >
        <Box component='img' src={circles} alt='' sx={{ width: '100px' }} />
      </Box>
      <Box
        sx={{
          width: '100%',
          height: '61.25vh',
          minHeight: '400px',
          backgroundImage: `url(${RegisterIllustrationPhone})`,
          backgroundRepeat: 'no-repeat',
          borderRadius: `0 0 ${linkedTrustTheme.borderRadius.lg} ${linkedTrustTheme.borderRadius.lg}`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />
      <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', px: 2, mt: -19 }}>
        <form onSubmit={onSubmit} style={{ width: '100%', maxWidth: 533 }}>
          <Box
            sx={{
              p: 3,
              borderRadius: linkedTrustTheme.borderRadius.lg,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              position: 'relative',
              overflow: 'hidden',
              backgroundColor: theme.palette.pageBackground
            }}
          >
            <Box sx={{ position: 'absolute', top: 0, right: 0, display: 'flex', alignItems: 'center' }}>
              <img src={Ellipse} alt='' />
            </Box>
            <Box sx={{ position: 'absolute', top: theme.spacing(2), right: theme.spacing(2), zIndex: 1 }}>
              <DayNightToggle onChange={toggleTheme} checked={isDarkMode} size={30} />
            </Box>
            <Typography variant='h4' sx={{ color: theme.palette.darkinputtext, fontWeight: 500, zIndex: 1 }}>
              Create Account
            </Typography>
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
                '& .MuiFilledInput-root': {
                  backgroundColor: theme.palette.pageBackground
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
              margin='dense'
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
                '& .MuiFilledInput-root': {
                  backgroundColor: theme.palette.pageBackground
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
              margin='dense'
            />
            <Button
              sx={{
                minWidth: 200,
                px: 4,
                color: theme.palette.buttontext,
                backgroundColor: theme.palette.buttons,
                '&:hover': { backgroundColor: theme.palette.buttonHover },
                borderRadius: linkedTrustTheme.borderRadius.full,
                mt: 1
              }}
              type='submit'
              variant='contained'
              size='large'
            >
              SIGN UP <LogoutIcon sx={{ ml: 2 }} />
            </Button>
          </Box>
        </form>
      </Box>
      <Typography variant='body1' sx={{ color: theme.palette.texts, textAlign: 'center', my: 3 }}>
        Click here to
        <Typography
          component='span'
          onClick={() => navigate('/login')}
          sx={{ color: theme.palette.maintext, display: 'inline', cursor: 'pointer', ml: 1 }}
        >
          Login
        </Typography>
      </Typography>
    </Box>
  )
}

export default MobileRegister
