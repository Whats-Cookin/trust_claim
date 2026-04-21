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
import Endorse from './components/Endorse'
import RequestEndorsement from './containers/RequestEndorsement'
import ClaimReport from './components/ClaimReport'
import Sidebar from './components/Sidebar'
import ClaimDetails from './containers/ClaimDetails'
import Terms from './containers/Terms'
// import Cookie from './containers/Cookie'
import Privacy from './containers/Privacy'
import { ClaimCredential } from './containers/ClaimCredential'
import { checkAuth, AUTH_STATE_CHANGED_EVENT } from './utils/authUtils'
import CertificateView from './components/ClaimCertificate/CertificateView'
import Present from './components/Present'
import RequestRating from './components/RequestRating'
import BadgeEmbed from './components/BadgeEmbed'
import BadgeView from './components/BadgeView'
import Wall from './containers/Wall'
import BadgeEmbedPage from './containers/BadgeEmbed2'
import BadgePage from './containers/BadgePage'
import AtprotoFeed from './containers/AtprotoFeed'
import { PlatformFeedbackForm } from './containers/PlatformFeedback'
import './App.css'

const App = () => {
  const [loading, setLoading] = useState(false)
  const [isSnackbarOpen, toggleSnackbar] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isNavbarVisible, setIsNavbarVisible] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(checkAuth())

  const location = useLocation()
  const navigate = useNavigate()
  const theme = useTheme()
  const isMediumScreen = useMediaQuery(theme.breakpoints.down('md'))

  // Check auth status when location changes
  useEffect(() => {
    setIsAuthenticated(checkAuth())
  }, [location])

  // Listen for auth state changes (e.g. QuickAuth inline login)
  useEffect(() => {
    const handler = () => setIsAuthenticated(checkAuth())
    window.addEventListener(AUTH_STATE_CHANGED_EVENT, handler)
    return () => window.removeEventListener(AUTH_STATE_CHANGED_EVENT, handler)
  }, [])

  useEffect(() => {
    if (location.pathname === '/') {
      navigate('/feed') // Redirect to /feed
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
  const isEmbedPage = location.pathname.startsWith('/embed/')

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

      {!isLoginPage && !isRegisterPage && !isEmbedPage && (
        <Navbar
          isAuth={isAuthenticated}
          toggleTheme={toggleTheme}
          isDarkMode={isDarkMode}
          isSidebarOpen={isSidebarOpen}
          setIsNavbarVisible={setIsNavbarVisible}
        />
      )}
      <Box sx={{ display: 'flex' }}>
        {!isLoginPage && !isRegisterPage && !isEmbedPage && (
          <Sidebar
            isAuth={isAuthenticated}
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
            flex: 1,
            minHeight: '100vh',
            backgroundColor: theme => theme.palette.pageBackground,
            fontSize: 'calc(3px + 2vmin)',
            overflow: 'auto',
            width: '100%',
            boxSizing: 'border-box'
          }}
        >
          <Snackbar snackbarMessage={snackbarMessage} isSnackbarOpen={isSnackbarOpen} toggleSnackbar={toggleSnackbar} />
          <Loader open={loading} />
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: isMediumScreen || isLoginPage || isRegisterPage ? 'center' : 'stretch',
              justifyContent: 'flex-start',
              width: '100%',
              paddingTop: isNavbarVisible && !isLoginPage && !isRegisterPage ? '64px' : '0'
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
                  isAuthenticated ? (
                    <Form {...commonProps} />
                  ) : (
                    <Navigate to='/login' replace state={{ from: location }} />
                  )
                }
              />
              <Route
                path='/rate'
                element={
                  isAuthenticated ? (
                    <Rate {...commonProps} />
                  ) : (
                    <Navigate to='/login' replace state={{ from: location }} />
                  )
                }
              />
              <Route
                path='/validate'
                element={
                  isAuthenticated ? (
                    <Validate {...commonProps} />
                  ) : (
                    <Navigate to='/login' replace state={{ from: location }} />
                  )
                }
              />
              <Route
                path='/endorse/:claimId'
                element={<Endorse {...commonProps} isAuthenticated={isAuthenticated} />}
              />
              <Route path='/endorse' element={<Endorse {...commonProps} isAuthenticated={isAuthenticated} />} />
              <Route
                path='/request-endorsement/:claimId'
                element={<RequestEndorsement {...commonProps} isAuthenticated={isAuthenticated} />}
              />
              <Route
                path='/request-endorsement'
                element={<RequestEndorsement {...commonProps} isAuthenticated={isAuthenticated} />}
              />
              <Route
                path='claim-credential'
                element={
                  isAuthenticated ? <ClaimCredential /> : <Navigate to='/login' replace state={{ from: location }} />
                }
              />
              <Route path='/certificate/:id' element={<CertificateView />} />
              <Route path='/certificatet/:id' element={<CertificateView />} /> {/* Alias for common typo */}
              <Route path='/present/:id' element={<Present />} />
              <Route path='/badge-embed/:id' element={<BadgeEmbed />} />
              <Route path='/badge' element={<BadgeView />} />
              <Route path='/wall' element={<Wall />} />
              <Route path='/embed/:claimId' element={<BadgeEmbedPage />} />
              <Route path='/badge/:claimId' element={<BadgePage />} />
              <Route path='/at' element={<AtprotoFeed />} />
              <Route
                path='/request-rating'
                element={
                  isAuthenticated ? <RequestRating /> : <Navigate to='/login' replace state={{ from: location }} />
                }
              />
              <Route
                path='/feedback/rating'
                element={<PlatformFeedbackForm {...commonProps} mode='rating' isAuthenticated={isAuthenticated} />}
              />
              <Route
                path='/feedback/endorsement'
                element={<PlatformFeedbackForm {...commonProps} mode='endorsement' isAuthenticated={isAuthenticated} />}
              />
              {/* Catch-all to avoid blank pages */}
              <Route path='*' element={<Navigate to='/feed' replace />} />
            </Routes>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  )
}

export default App
