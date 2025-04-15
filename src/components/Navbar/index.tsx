import { useState, useEffect } from 'react'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
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
  return (
    <AppBar
      position='fixed'
      sx={{
        backgroundColor: '#FFFFFF',
        color: theme.palette.texts,
        backgroundImage: 'none',
        boxShadow: '0 0.1rem 0.6rem rgba(209, 213, 219, 0.5)',
        width: '100%',
        // height: { xs: '70px', md: '100px' },
        zIndex: 999,
        transform: isVisible ? 'translateY(0)' : 'translateY(-100%)',
        transition: 'transform 0.3s ease-in-out',
        display: 'flex',
        flexDirection: 'row',
        height: '6.146vw',
        minHeight: '50px',
        maxHeight: '118px',
        pr: { xs: '2.24vw', md: '86px' },
        pl: { xs: '2.24vw', md: '86px' }
      }}
    >
      <Box sx={{ display: 'flex', width: '100%' }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-start',
            alignItems: 'center',
            width: 'auto',
            flexWrap: 'wrap'
          }}
        >
          <Box
            component='img'
            src={Logo}
            alt='LinkedTrust Logo'
            sx={{
              width: 'auto',
              height: '2.604vw',
              minHeight: '24px',
              maxHeight: '45px',
              objectFit: 'contain',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              mr: '8px'
            }}
          />
          <Typography
            sx={{
              color: '#2D6A4F',
              fontSize: { xs: 'clamp(16px, 4vw, 30px)!important', md: '30px' },
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
      </Box>
    </AppBar>
  )
}

export default Navbar
