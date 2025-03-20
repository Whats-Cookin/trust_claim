import { useState, useEffect } from 'react'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import { useMediaQuery, useTheme } from '@mui/material'
import SearchBar from '../searchbar'
import Logo from '../../assets/logolinkedtrust.svg'
import { bool } from 'prop-types'

interface NavbarProps {
  isAuth: boolean
  toggleTheme: () => void
  isDarkMode: boolean
  isSidebarOpen: boolean
  setIsNavbarVisible: (isVisible: boolean) => void
}

const Navbar: React.FC<NavbarProps> = ({ isAuth, toggleTheme, isDarkMode, isSidebarOpen, setIsNavbarVisible }) => {
  const theme = useTheme()
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'))
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollTop, setLastScrollTop] = useState(0)

  const handleScroll = () => {
    const currentScrollTop = window.scrollY || document.documentElement.scrollTop

    if (currentScrollTop > lastScrollTop && currentScrollTop > 100 && isSmallScreen) {
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
  }, [lastScrollTop, isSmallScreen])
  const displayValue = isVisible ? 'block' : 'none'
  return (
    <AppBar
      position='fixed'
      sx={{
        backgroundColor: '#FFFFFF',
        color: theme.palette.texts,
        backgroundImage: 'none',
        boxShadow: '1px 1px 10px rgba(209, 213, 219, 0.5)',
        width: '100%',
        height: '100px',
        zIndex: 999,
        transform: isVisible ? 'translateY(0)' : 'translateY(-100%)',
        transition: 'transform 0.3s ease-in-out',
        flexDirection: 'row',
        display: isSmallScreen ? displayValue : 'block',
        p: '20px '
      }}
    >
      <Toolbar sx={{ display: 'flex' }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-start',
            alignItems: 'center',
            width: '50%',
            textWrap: 'wrap'
          }}
        >
          <img src={Logo} alt='LinkedTrust Logo' style={{ width: '28px', height: '28px', marginRight: '10px' }} />
          <Typography
            variant='body1'
            sx={{
              color: '#2D6A4F',
              flexWrap: 'wrap',
              fontSize: isSmallScreen ? '20px' : '20px',
              transition: 'opacity 0.3s',
              fontFamily: 'Montserrat',
              fontWeight: 'bold'
            }}
          >
            LinkedTrust
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', marginLeft: 'auto' }}>
          <SearchBar />
        </Box>
      </Toolbar>
    </AppBar>
  )
}

export default Navbar
