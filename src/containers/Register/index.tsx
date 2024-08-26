import React, { useEffect, useCallback } from 'react'
import axios from '../../axiosInstance'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import Typography from '@mui/material/Typography'
import IRegisterProps from './types'
import styles from './styles'
import { TextField, Box, Button, useTheme, IconButton, useMediaQuery } from '@mui/material'
import DayNightToggle from 'react-day-and-night-toggle'
import CloseIcon from '@mui/icons-material/Close'
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import RegisterIllustration from '../../assets/images/RegisterIllustration.svg'
import formBackgrounddark from '../../assets/images/formBackgrounddark.svg'
import formBackgroundlight from '../../assets/images/formBackgroundlight.svg'
import MobileRegister from './MobileRegister'

const Register = ({ toggleSnackbar, setSnackbarMessage, setLoading, toggleTheme, isDarkMode }: IRegisterProps) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const {
    register,
    handleSubmit,
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

  if (isMobile) {
    return <MobileRegister {...{ toggleSnackbar, setSnackbarMessage, setLoading, toggleTheme, isDarkMode }} />
  }

  return (
    <Box
      sx={{
        zIndex: 2,
        width: '100%',
        maxWidth: '1208px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          margin: 'auto',
          flexDirection: 'column',
          paddingRight: '110px',
          boxSizing: 'content-box'
        }}
      >
        <form onSubmit={onSubmit}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              rowGap: 2,
              width: '71.528vw',
              maxWidth: '1030px',
              minWidth: '742.003px',
              height: '64.258vh',
              maxHeight: '658px',
              minHeight: '600px',
              zIndex: 20,
              borderRadius: '10px',
              position: 'relative',
              backgroundImage: `url(${isDarkMode ? formBackgrounddark : formBackgroundlight})`,
              backgroundRepeat: 'no-repeat',
              backgroundSize: 'cover',
              backgroundPositionY: 'center',
              backgroundPositionX: 'center'
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                width: '28.889vw',
                maxWidth: '416px',
                minWidth: '300px',
                height: '53.613vh',
                maxHeight: '550px',
                minHeight: '500px',
                top: '8.359%',
                right: '-16.893%',
                borderRadius: '30px',
                opacity: '1',
                zIndex: 200,
                backgroundImage: `url(${RegisterIllustration})`,
                backgroundRepeat: 'no-repeat',
                backgroundSize: 'cover',
                backgroundPositionY: 'center',
                backgroundPositionX: 'center'
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  position: 'absolute',
                  bottom: '20px',
                  right: '30px'
                }}
              >
                <DayNightToggle onChange={toggleTheme} checked={isDarkMode} size={35} />
              </Box>
            </Box>
            <Box
              sx={{
                width: '5.176vw',
                minWidth: '45px',
                maxWidth: '60px',
                height: '5.176vw',
                minHeight: '45px',
                maxHeight: '60px',
                background: theme.palette.stars,
                zIndex: 20,
                borderRadius: '50%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                position: 'absolute',
                top: -25,
                left: -25
              }}
            >
              <Link to='/feed' style={{ textDecoration: 'none' }}>
                <IconButton
                  sx={{
                    color: '#fff',
                    zIndex: 30
                  }}
                >
                  <CloseIcon />
                </IconButton>
              </Link>
            </Box>

            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                rowGap: 4,
                width: '37.573%',
                minWidth: '300px',
                maxWidth: '387px',
                height: '77.508%',
                minHeight: '470px',
                maxHeight: '510px',
                textAlign: 'center',
                ml: '202px',
                mt: '72px'
              }}
            >
              <Typography
                variant='h5'
                sx={{
                  color: theme.palette.darkinputtext,
                  textAlign: 'center',
                  fontWeight: 'bold',
                  fontSize: '2.5rem'
                }}
              >
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
                  backgroundColor: theme.palette.formBackground,
                  '& .MuiFilledInput-root': {
                    backgroundColor: theme.palette.formBackground
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
                  backgroundColor: theme.palette.formBackground,
                  '& .MuiFilledInput-root': {
                    backgroundColor: theme.palette.formBackground
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
              />

              <Box
                sx={{
                  width: '50%',
                  m: 'auto',
                  mt: '2em'
                }}
              >
                <Button
                  sx={{
                    width: '100%',
                    color: theme.palette.buttontext,
                    backgroundColor: theme.palette.buttons,
                    '&:hover': { backgroundColor: theme.palette.buttonHover },
                    borderRadius: '80px'
                  }}
                  type='submit'
                  variant='contained'
                  size='medium'
                >
                  SIGN UP
                </Button>
              </Box>

              <Typography variant='body1' sx={{ color: theme.palette.texts }}>
                Click here to
                <Typography
                  component='span'
                  onClick={() => navigate('/login')}
                  sx={{ color: theme.palette.maintext, display: 'inline', cursor: 'pointer', ml: 1 }}
                >
                  LOGIN
                </Typography>
              </Typography>
            </Box>
          </Box>
        </form>
      </Box>
    </Box>
  )
}

export default Register
