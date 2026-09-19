import { useState, useEffect } from 'react'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import { useMediaQuery, useTheme, Button } from '@mui/material'
import { useNavigate } from 'react-router-dom'
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
  const navigate = useNavigate()
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
      elevation={0}
      sx={{
        backgroundColor: theme.palette.pageBackground,
        color: theme.palette.texts,
        backgroundImage: 'none',
        borderBottom: `1px solid ${theme.palette.divider}`,
        zIndex: theme.zIndex.appBar,
        transform: isVisible ? 'translateY(0)' : 'translateY(-100%)',
        transition: 'transform 0.3s ease-in-out',
        display: isSmallScreen ? displayValue : 'block'
      }}
    >
      <Toolbar sx={{ gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, minWidth: 0 }}>
          <Box component='img' src={Logo} alt='LinkedTrust Logo' sx={{ width: 28, height: 28, flexShrink: 0 }} />
          {/* MUI "App bar with search field": the wordmark yields to the search on phones, the logo stays */}
          <Typography
            variant='h6'
            noWrap
            sx={{ color: theme.palette.maintext, fontWeight: 500, display: { xs: 'none', sm: 'block' } }}
          >
            Linked Trust
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
          <SearchBar />
          {isAuth ? (
            hasIdentity() ? (
              <IdentityButton />
            ) : null
          ) : (
            <Button onClick={() => navigate('/login')} color='inherit' sx={{ color: theme.palette.sidecolor }}>
              Login
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  )
}

export default Navbar
