import React, { useState, useEffect, FC } from 'react'
import { Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom'
import { CssBaseline, ThemeProvider, GlobalStyles, Box, useTheme, useMediaQuery } from '@mui/material'
import { darkModeTheme, lightModeTheme } from './Theme'
import Loader from './components/Loader'
import Snackbar from './components/Snackbar'
import Navbar from './components/Navbar'
import Login from './containers/Login'
import Register from './containers/Register'
import Form from './containers/Form'
import Search from './containers/Search'
import FeedClaim from './containers/feedOfClaim/index'
import Rate from './components/Rate'
import Validate from './components/Validate'
import ClaimReport from './components/ClaimReport'
import Sidebar from './components/Sidebar'
import Terms from './containers/Terms'
import AuthCallback from './utils/AuthCallback'
import Privacy from './containers/Privacy'
import './App.css'

const App: FC = () => {
  const [loading, setLoading] = useState(false)
  const [isSnackbarOpen, toggleSnackbar] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [windowWidth, setWindowWidth] = useState(window.innerWidth)
  const [isNavbarVisible, setIsNavbarVisible] = useState(true)

  const location = useLocation()
  const navigate = useNavigate()
  const theme = useTheme()
  const isMediumScreen = useMediaQuery(theme.breakpoints.down('md'))

  const checkAuth = (): boolean => {
    const accessToken = localStorage.getItem('accessToken')
    const refreshToken = localStorage.getItem('refreshToken')
    const ethAddress = localStorage.getItem('ethAddress')
    const did = localStorage.getItem('did')
    return !!((did && ethAddress) || (accessToken && refreshToken))
  }

  useEffect(() => {
    const isAuthenticated = checkAuth()
    if (!isAuthenticated && location.pathname === '/') {
      navigate('/feed') // Redirect to /feed if not authenticated
    }

    const handleResize = () => {
      setWindowWidth(window.innerWidth)
    }

    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [location.pathname, navigate])

  const toggleTheme = () => {
    setIsDarkMode(prevMode => !prevMode)
  }

  const commonProps = {
    toggleSnackbar,
    setSnackbarMessage,
    setLoading,
    toggleTheme,
    isDarkMode
  }

  const isLoginPage = location.pathname === '/login'
  const isRegisterPage = location.pathname === '/register'

  return (
    <ThemeProvider theme={isDarkMode ? darkModeTheme : lightModeTheme}>
      <CssBaseline />
      <GlobalStyles
        styles={{
          '::-webkit-scrollbar': {
            width: '0',
            height: '0'
          },
          body: {
            '-ms-overflow-style': 'none',
            'scrollbar-width': 'none'
          }
        }}
      />
      {!isLoginPage && !isRegisterPage && (
        <Navbar
          isAuth={checkAuth()}
          toggleTheme={toggleTheme}
          isDarkMode={isDarkMode}
          isSidebarOpen={isSidebarOpen}
          setIsNavbarVisible={setIsNavbarVisible}
        />
      )}
      <Box sx={{ display: 'flex' }}>
        {!isLoginPage && !isRegisterPage && (
          <Sidebar
            isAuth={checkAuth()}
            isOpen={isSidebarOpen}
            toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            toggleTheme={toggleTheme}
            isDarkMode={isDarkMode}
            isNavbarVisible={isNavbarVisible}
          />
        )}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100vh',
            backgroundColor: theme => theme.palette.pageBackground,
            fontSize: 'calc(3px + 2vmin)',
            overflow: 'hidden',
            marginLeft: isMediumScreen || isLoginPage || isRegisterPage ? '0' : isSidebarOpen ? '19.6vw' : '4.8vw',
            width:
              isMediumScreen || isLoginPage || isRegisterPage
                ? '100%'
                : `calc(100% - ${isSidebarOpen ? '19.6vw' : '4.8vw'})`,
            transition: 'margin-left 0.3s, width 0.3s',
            marginBottom: isMediumScreen || isLoginPage || isRegisterPage ? '0' : '60px'
          }}
        >
          <Snackbar snackbarMessage={snackbarMessage} isSnackbarOpen={isSnackbarOpen} toggleSnackbar={toggleSnackbar} />
          <Loader open={loading} />
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%'
            }}
          >
            <Routes>
              <Route path='feed' element={<FeedClaim {...commonProps} />} />
              <Route path='report/:claimId' element={<ClaimReport />} />
              <Route path='search' element={<Search {...commonProps} />} />
              <Route path='claim' element={<Form {...commonProps} />} />
              <Route path='register' element={<Register {...commonProps} />} />
              <Route path='login' element={<Login {...commonProps} />} />
              <Route path='terms' element={<Terms />} />
              <Route path='privacy' element={<Privacy />} />
              <Route path='/auth/callback' element={<AuthCallback {...commonProps} />} />
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
        </Box>
      </Box>
    </ThemeProvider>
  )
}

export default App
