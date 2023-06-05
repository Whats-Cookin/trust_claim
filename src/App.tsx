import { useState, useEffect } from 'react'
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import Loader from './components/Loader'
import Snackbar from './components/Snackbar'
import Navbar from './components/Navbar'
import Login from './containers/Login'
import Register from './containers/Register'
import Form from './containers/Form'
import Search from './containers/Search'
import './App.css'
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'
import Box from '@mui/material/Box'
import FeedClaim from './containers/feedOfClaim/index'

const App = () => {
  const [loading, setLoading] = useState(false)
  const [isSnackbarOpen, toggleSnackbar] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [metaNav, setMetaNav] = useState(false)

  const location = useLocation()
  const navigate = useNavigate()

  console.log('Hello, world')

  const checkAuth = () => {
    const accessToken = localStorage.getItem('accessToken')
    const refreshToken = localStorage.getItem('refreshToken')
    const ethAddress = localStorage.getItem('ethAddress')
    console.log('In check auth now')
    if (ethAddress || (accessToken && refreshToken)) return true
    return false
  }

  useEffect(() => {
    const isAuthenticated = checkAuth()
    if (!isAuthenticated && location.pathname === '/') {
      navigate('/feed')
    }
  }, [])

  const commonProps = {
    toggleSnackbar,
    setSnackbarMessage,
    setLoading,
    setMetaNav
  }
  const isLoginPage = window.location.pathname === '/login'
  const isRegisterPage = window.location.pathname === '/register'

  const theme = createTheme({
    palette: {
      primary: {
        main: '#009688'
      },
      secondary: {
        main: '#FFFFFF'
      }
    },
    breakpoints: {
      values: {
        xs: 0,
        sm: 600,
        md: 800,
        lg: 1280,
        xl: 1920
      }
    }
  })

  return (
    <>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {/* Render the navigation component only if the user is not on the login or register page */}
        <Navbar isAuth={checkAuth()} />

        <Box
          sx={{
            position: 'relative',
            backgroundColor: '#eeeeee',
            minHeight: '100vh',
            display: 'flex',
            width: '100%',
            flexDirection: 'column',
            alignItems: 'center',
            fontSize: 'calc(3px + 2vmin)',
            color: 'rgb(37, 3, 3)',
            overflow: 'hidden',
            [theme.breakpoints.up('md')]: {
              justifyContent: 'center'
            }
          }}
        >
          <Snackbar snackbarMessage={snackbarMessage} isSnackbarOpen={isSnackbarOpen} toggleSnackbar={toggleSnackbar} />
          <Loader open={loading} />
          <Routes>
            <Route path='feed' element={<FeedClaim {...commonProps} />} />
            <Route path='search' element={<Search {...commonProps} />} />
            <Route path='/' element={<Form {...commonProps} />} />
            <Route path='login' element={<Login {...commonProps} />} />
            <Route path='register' element={<Register {...commonProps} />} />
          </Routes>
        </Box>
      </ThemeProvider>
    </>
  )
}

export default App
