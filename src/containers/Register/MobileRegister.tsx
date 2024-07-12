import React from 'react'
import axios from '../../axiosInstance'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import Typography from '@mui/material/Typography'
import IRegisterProps from './types'
import { TextField, Box, Button, useTheme, IconButton } from '@mui/material'
import DayNightToggle from 'react-day-and-night-toggle'
import styles from './styles'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import loginIllustrationPhone from '../../assets/images/loginIllustrationPhone.svg'
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined'
import formBackgrounddark from '../../assets/images/formBackgrounddark.svg'
import formBackgroundlight from '../../assets/images/formBackgroundlight.svg'
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
    <Box
      sx={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Box
        sx={{
          width: '11.528vw',
          minWidth: '83px',
          maxWidth: '97px',
          height: '11.528vw',
          minHeight: '88px',
          maxHeight: '100px',
          bottom: '2.344vh',
          left: '4.306vw',
          position: 'absolute'
        }}
      >
        <img src={circles} alt='' style={{ width: '100%' }} />
      </Box>
      <Box
        sx={{
          width: '100%',
          height: '61.25vh',
          minHeight: '400px',
          backgroundImage: `url(${loginIllustrationPhone})`,
          backgroundRepeat: 'no-repeat',
          borderRadius: '0 0 20px 20px',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          bottom: '152px'
        }}
      >
        <form onSubmit={onSubmit}>
          <Box
            sx={{
              width: '74.028vw',
              minWidth: '433px',
              maxWidth: '533px',
              height: '49.844vh',
              minHeight: '538px',
              maxHeight: '638px',
              padding: '20px',
              borderRadius: '20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              position: 'relative',
              backgroundColor: theme.palette.pageBackground,
              backgroundRepeat: 'no-repeat',
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: '0px',
                right: '0px',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <img src={Ellipse} alt='' />
            </Box>
            <Box
              sx={{
                position: 'absolute',
                top: '40px',
                right: '15px',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <DayNightToggle onChange={toggleTheme} checked={isDarkMode} size={35} />
            </Box>
            <Typography
              variant='h5'
              sx={{
                color: theme.palette.darkinputtext,
                textAlign: 'center',
                fontWeight: '600',
                fontSize: '2.5rem',
                fontFamily: 'montserrat',
                marginBottom: '20px'
              }}
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
                },
                paddingBottom: '53px'
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
                width: '31.528vw',
                minWidth: '200px',
                maxWidth: '227px',
                height: '72px',
                color: theme.palette.buttontext,
                backgroundColor: theme.palette.buttons,
                '&:hover': { backgroundColor: theme.palette.buttonHover },
                borderRadius: '80px',
                fontWeight: 'bold',
                fontSize: '20px',
                marginTop: '20px'
              }}
              type='submit'
              variant='contained'
              size='medium'
            >
              Register <LogoutIcon sx={{ ml: 2 }} />
            </Button>
          </Box>
        </form>
      </Box>
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          position: 'relative',
          bottom: '102px'
        }}
      >
        <Typography variant='body1' sx={{ color: theme.palette.texts, marginTop: '20px' }}>
          Click here to
          <Typography
            component='span'
            onClick={() => navigate('/login')}
            sx={{ color: theme.palette.maintext, display: 'inline', cursor: 'pointer', ml: 1 }}
          >
            Login
          </Typography>
        </Typography>
        <Typography
          variant='body1'
          sx={{
            color: theme.palette.darkinputtext,
            textDecoration: 'underline',
            cursor: 'pointer',
            marginTop: '10px'
          }}
        >
          forgot your password?
        </Typography>
      </Box>
    </Box>
  )
}

export default MobileRegister
