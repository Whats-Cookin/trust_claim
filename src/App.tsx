import React, { useState, useEffect } from 'react'
import { Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom'
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
import FeedClaim from './containers/feedOfClaim'
import ListNav from './components/ListNav'
import RightSideComponent from './components/RightSideComponent'
import Rate from './components/Rate'
import Validate from './components/Validate'
import ClaimReport from './components/ClaimReport'
import Terms from './containers/Terms'
import Cookie from './containers/Cookie'
import Privacy from './containers/Privacy'

const App = () => {
  const [loading, setLoading] = useState(false)
  const [isSnackbarOpen, toggleSnackbar] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [metaNav, setMetaNav] = useState(false)

  const location = useLocation()
  const navigate = useNavigate()

  const checkAuth = () => {
    const accessToken = localStorage.getItem('accessToken')
    const refreshToken = localStorage.getItem('refreshToken')
    const ethAddress = localStorage.getItem('ethAddress')
    const did = localStorage.getItem('did')
    return !!((did && ethAddress) || (accessToken && refreshToken))
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
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {!isLoginPage && !isRegisterPage && <Navbar />}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          minHeight: '100vh',
          width: '100%'
        }}
      >
        <Box
          sx={{
            width: '30%',
            bgcolor: '#0a1c1d'
          }}
        >
          <ListNav />
        </Box>
        <Box
          sx={{
            width: '40%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            overflow: 'auto',
            backgroundColor: '#0A1C1D'
          }}
        >
          <Snackbar snackbarMessage={snackbarMessage} isSnackbarOpen={isSnackbarOpen} toggleSnackbar={toggleSnackbar} />
          <Loader open={loading} />
          <Routes>
            <Route path='feed' element={<FeedClaim {...commonProps} />} />
            <Route path='report/:claimId' element={<ClaimReport />} />
            <Route path='search' element={<Search {...commonProps} />} />
            <Route path='/' element={<Form {...commonProps} />} />
            <Route path='register' element={<Register {...commonProps} />} />
            <Route path='login' element={<Login {...commonProps} />} />
            <Route path='terms' element={<Terms />} />
            <Route path='privacy' element={<Privacy />} />
            <Route path='cookie' element={<Cookie />} />
            <Route
              path='/rate'
              element={
                checkAuth() ? <Rate {...commonProps} /> : <Navigate to='/login' replace state={{ from: location }} />
              }
            />
            <Route
              path='/validate'
              element={
                checkAuth() ? (
                  <Validate {...commonProps} />
                ) : (
                  <Navigate to='/login' replace state={{ from: location }} />
                )
              }
            />
          </Routes>
        </Box>
        <Box
          sx={{
            width: '30%',
            bgcolor: '#0a1c1d'
          }}
        >
          <RightSideComponent />
        </Box>
      </Box>
    </ThemeProvider>
  )
}

export default App
