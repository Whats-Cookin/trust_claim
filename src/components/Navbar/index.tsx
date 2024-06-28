import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import { useMediaQuery, useTheme } from '@mui/material'
import SearchBar from '../searchbar'
import Logo from '../../assets/logolinkedtrust.svg'

interface NavbarProps {
  isAuth: boolean
  toggleTheme: () => void
  isDarkMode: boolean
  isSidebarOpen: boolean
  setIsNavbarVisible: (isVisible: boolean) => void
}

const Navbar: React.FC<NavbarProps> = ({ isAuth, toggleTheme, isDarkMode, isSidebarOpen, setIsNavbarVisible }) => {
  const location = useLocation()
  const theme = useTheme()
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'))
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollTop, setLastScrollTop] = useState(0)

  const getPageName = () => {
    const path = location.pathname

    if (/^\/report\/\d+$/.test(path)) {
      return 'Claim Report'
    }

    switch (path) {
      case '/':
        return 'Create Claims'
      case '/explore':
        return 'Explore'
      case '/search':
        return 'Search claims'
      case '/terms':
        return 'Terms of Service'
      case '/privacy':
        return 'Privacy policy'
      case '/cookie':
        return 'Cookies policy'
      case '/validate':
        return 'Validate Claim'
      default:
        return ''
    }
  }

  const handleScroll = () => {
    const currentScrollTop = window.scrollY || document.documentElement.scrollTop

    if (currentScrollTop > lastScrollTop && currentScrollTop > 100) {
      setIsVisible(false)
      setIsNavbarVisible(false)
    } else {
      setIsVisible(true)
      setIsNavbarVisible(true)
    }

    setLastScrollTop(currentScrollTop <= 0 ? 0 : currentScrollTop)
  }

  useEffect(() => {
    window.addEventListener('scroll', handleScroll)

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [lastScrollTop])

  return (
    <AppBar
      position='fixed'
      sx={{
        backgroundColor: theme.palette.pageBackground,
        color: theme.palette.texts,
        backgroundImage: 'none',
        boxShadow: 'none',
        width: '100%',
        zIndex: 1400,
        transform: isVisible ? 'translateY(0)' : 'translateY(-100%)',
        transition: 'transform 0.3s ease-in-out'
      }}
    >
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <img src={Logo} alt='LinkedTrust Logo' style={{ width: '28px', height: '28px', marginRight: '8px' }} />
          <Typography
            variant='h6'
            component='div'
            sx={{
              color: theme.palette.maintext,
              fontWeight: 'bold',
              fontSize: '30px',
              transition: 'opacity 0.3s'
            }}
          >
            Trust Claims
          </Typography>
        </Box>
        <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
          <Typography
            variant='h6'
            component='div'
            sx={{
              color: theme.palette.texts,
              textAlign: 'center',
              marginLeft: isSmallScreen ? '0' : '1rem'
            }}
          >
            {getPageName()}
            <Box
              sx={{
                height: '4px',
                backgroundColor: theme.palette.maintext,
                marginTop: '4px',
                borderRadius: '2px',
                width: '100%'
              }}
            />
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', width: '25%' }}>
          <SearchBar />
        </Box>
      </Toolbar>
    </AppBar>
  )
}

export default Navbar
