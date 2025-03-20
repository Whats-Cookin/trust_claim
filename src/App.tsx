import { useState, useEffect } from 'react'
import { Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom'
import { CssBaseline, ThemeProvider, GlobalStyles, Box, useTheme, useMediaQuery } from '@mui/material'
import { darkModeTheme, lightModeTheme } from './Theme'
import Loader from './components/Loader'
import Snackbar from './components/Snackbar'
import Navbar from './components/Navbar'
import Login from './containers/Login'
import Register from './containers/Register'
import Form from './containers/Form'
import Explore from './containers/Explore'
import FeedClaim from './containers/feedOfClaim/index'
import Rate from './components/Rate'
import Validate from './components/Validate'
import ClaimReport from './components/ClaimReport'
import Sidebar from './components/Sidebar'
import ClaimDetails from './containers/ClaimDetails'
import Terms from './containers/Terms'
// import Cookie from './containers/Cookie'
import Privacy from './containers/Privacy'
import { checkAuth } from './utils/authUtils'
import './App.css'

const App = () => {
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

  useEffect(() => {
    if (location.pathname === '/') {
      navigate('/feed') // Redirect to /feed
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

  const globalStyles = (
    <GlobalStyles
      styles={{
        '::-webkit-scrollbar': {
          width: '0',
          height: '0'
        },
        body: {
          msOverflowStyle: 'none',
          scrollbarWidth: 'none'
        }
      }}
    />
  )

  return (
    <ThemeProvider theme={isDarkMode ? darkModeTheme : lightModeTheme}>
      <CssBaseline />
      {globalStyles}

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
            overflow: 'auto',
            marginLeft: isMediumScreen || isLoginPage || isRegisterPage ? '0' : isSidebarOpen ? '14.4vw' : '1.0vw',
            width:
              isMediumScreen || isLoginPage || isRegisterPage
                ? '100%'
                : `calc(100% - ${isSidebarOpen ? '14.4vw' : '1.0vw'})`,
            transition: 'margin-left 0.3s, width 0.3s'
          }}
        >
          <Snackbar snackbarMessage={snackbarMessage} isSnackbarOpen={isSnackbarOpen} toggleSnackbar={toggleSnackbar} />
          <Loader open={loading} />
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: isMediumScreen || isLoginPage || isRegisterPage ? 'center' : 'flex-end',
              justifyContent: 'center',
              width: '100%'
            }}
          >
            <Routes>
              <Route path='feed' element={<FeedClaim {...commonProps} />} />
              <Route path='report/:claimId' element={<ClaimReport />} />
              <Route path='claims/:claimId' element={<ClaimDetails {...commonProps} />} />
              <Route path='explore/:nodeId' element={<Explore {...commonProps} />} />
              <Route path='register' element={<Register {...commonProps} />} />
              <Route path='login' element={<Login {...commonProps} />} />
              <Route path='terms' element={<Terms />} />
              <Route path='privacy' element={<Privacy />} />
              {/* <Route path='cookie' element={<Cookie />} /> */}
              <Route
                path='claim'
                element={
                  checkAuth() ? <Form {...commonProps} /> : <Navigate to='/login' replace state={{ from: location }} />
                }
              />
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
