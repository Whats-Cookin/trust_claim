import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import MenuIcon from '@mui/icons-material/Menu'
import { useMediaQuery, useTheme } from '@mui/material'
import SearchBar from '../searchbar'
import Sidebar from '../Sidebar'

interface NavbarProps {
  isAuth: boolean
}

const Navbar: React.FC<NavbarProps> = ({ isAuth }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const theme = useTheme()
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'))
  const isMediumScreen = useMediaQuery(theme.breakpoints.down(800))

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const getPageName = () => {
    switch (location.pathname) {
      case '/feed':
        return 'Feed of Claims'
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
      default:
        return ''
    }
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position='fixed' sx={{ backgroundColor: '#0a1c1d', color: '#ffffff' }}>
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {(location.pathname !== '/feed' || isMediumScreen) && (
              <IconButton edge='start' color='inherit' aria-label='menu' onClick={toggleSidebar}>
                <MenuIcon />
              </IconButton>
            )}
            <Typography
              variant='h6'
              component='div'
              sx={{
                color: '#009688',
                fontWeight: 'bold',
                cursor: 'pointer',
                width: isSmallScreen ? '100%' : '23vw'
              }}
              onClick={() => navigate('/feed')}
            >
              Trust Claims
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography
              variant='h6'
              component='div'
              sx={{
                color: '#ffffff',
                textAlign: 'center',
                flexGrow: isSmallScreen ? 1 : 0
              }}
            >
              {getPageName()}
              <Box
                sx={{
                  height: '4px',
                  backgroundColor: '#009688',
                  marginTop: '4px',
                  borderRadius: '2px',
                  width: '100%'
                }}
              />
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', width: isSmallScreen ? '23%' : '23vw' }}>
            <SearchBar />
          </Box>
        </Toolbar>
      </AppBar>
      <Sidebar isAuth={isAuth} isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
    </Box>
  )
}

export default Navbar
