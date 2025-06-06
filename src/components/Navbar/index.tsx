import { useState, useEffect } from 'react'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import { useMediaQuery, useTheme } from '@mui/material'
import SearchBar from '../searchbar'
import Logo from '../../assets/logolinkedtrust.svg'
import { IdentityButton } from '../IdentityManager'
import { hasIdentity } from '../../utils/web3Auth'

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
        backgroundColor: theme.palette.pageBackground,
        color: theme.palette.texts,
        backgroundImage: 'none',
        boxShadow: 'none',
        width: '100%',
        zIndex: 999,
        transform: isVisible ? 'translateY(0)' : 'translateY(-100%)',
        transition: 'transform 0.3s ease-in-out',
        flexDirection: 'row',
        display: isSmallScreen ? displayValue : 'block'
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
          <img src={Logo} alt='LinkedTrust Logo' style={{ width: '28px', height: '28px', marginRight: '16px' }} />
          <Typography
            variant='body1'
            sx={{
              color: theme.palette.maintext,
              flexWrap: 'wrap',
              fontSize: isSmallScreen ? '20px' : '20px',
              transition: 'opacity 0.3s'
            }}
          >
            Linked Trust
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', marginLeft: 'auto', gap: 2 }}>
          <SearchBar />
          {isAuth && hasIdentity() && <IdentityButton />}
        </Box>
      </Toolbar>
    </AppBar>
  )
}

export default Navbar
