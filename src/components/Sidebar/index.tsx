import React from 'react'
import { Drawer, List, ListItemText, ListItemButton, Box, useTheme, Typography, useMediaQuery } from '@mui/material'
import {
  Home,
  Search,
  DarkMode,
  Logout,
  Login
  //  HowToReg
} from '@mui/icons-material'
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight'
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft'
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined'
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import BottomNav from './BottomNav'

interface SidebarProps {
  isAuth: boolean
  isOpen: boolean
  toggleSidebar: () => void
  toggleTheme: () => void
  isDarkMode: boolean
  isNavbarVisible: boolean
}

const Sidebar: React.FC<SidebarProps> = ({
  isAuth,
  isOpen,
  toggleSidebar,
  toggleTheme,
  isDarkMode,
  isNavbarVisible
}) => {
  const navigate = useNavigate()
  const theme = useTheme()
  const location = useLocation()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const handleLogout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('did')
    localStorage.removeItem('ethAddress')
    navigate('/login')
  }

  const iconStyle = { color: theme.palette.sidecolor, width: '28px', height: '28px' }

  const getActiveStyle = (path: string) => ({
    backgroundColor: location.pathname === path ? theme.palette.pageBackground : 'transparent',
    transition: 'background-color 0.3s, box-shadow 0.3s',
    minHeight: '65px'
  })

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register'

  if (isMobile) {
    return <BottomNav isAuth={isAuth} toggleTheme={toggleTheme} isDarkMode={isDarkMode} />
  }

  return (
    <Drawer
      variant='permanent'
      sx={{
        '& .MuiDrawer-paper': {
          width: isOpen ? '19.6vw' : '4.8vw',
          minWidth: isOpen ? 200 : 40,
          boxSizing: 'border-box',
          backgroundColor: theme.palette.menuBackground,
          color: theme.palette.sidecolor,
          transition: 'width 0.3s, opacity 0.3s, margin-top 0.3s',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          overflow: 'hidden',
          borderRight: 'none',
          borderRadius: '0 10px 10px 0',
          marginTop: isNavbarVisible && !isAuthPage ? '64px' : '0',
          height: isNavbarVisible && !isAuthPage ? 'calc(100vh - 64px)' : '100vh'
        }
      }}
    >
      <Box>
        <List>
          <ListItemButton
            sx={{ gap: '32px', justifyContent: 'center', transition: 'all 0.3s', minHeight: '65px' }}
            onClick={toggleSidebar}
          >
            {isOpen ? <KeyboardDoubleArrowLeftIcon sx={iconStyle} /> : <KeyboardDoubleArrowRightIcon sx={iconStyle} />}
            <ListItemText primary='Close' sx={{ display: isOpen ? 'block' : 'none' }} />
          </ListItemButton>
          <ListItemButton
            sx={{ gap: '32px', justifyContent: 'center', ...getActiveStyle('/feed') }}
            onClick={() => navigate('/feed')}
          >
            <Home sx={iconStyle} />
            <ListItemText primary='Home' sx={{ display: isOpen ? 'block' : 'none', transition: 'all 0.3s' }} />
          </ListItemButton>
          {/* <ListItemButton
            sx={{ gap: '32px', justifyContent: 'center', ...getActiveStyle('/search') }}
            onClick={() => navigate('/search')}
          >
            <Search sx={iconStyle} />
            <ListItemText primary='Search' sx={{ display: isOpen ? 'block' : 'none', transition: 'all 0.3s' }} />
          </ListItemButton> */}
          <ListItemButton
            sx={{ gap: '32px', justifyContent: 'center', ...getActiveStyle('/') }}
            onClick={() => navigate('/')}
          >
            <AddCircleOutlineOutlinedIcon sx={iconStyle} />
            <ListItemText primary='Claim' sx={{ display: isOpen ? 'block' : 'none', transition: 'all 0.3s' }} />
          </ListItemButton>
          <ListItemButton
            sx={{ gap: '32px', justifyContent: 'center', transition: 'all 0.3s', minHeight: '65px' }}
            onClick={toggleTheme}
          >
            {isDarkMode ? <LightModeOutlinedIcon sx={iconStyle} /> : <DarkMode sx={iconStyle} />}
            <ListItemText primary={isDarkMode ? 'Light' : 'Dark'} sx={{ display: isOpen ? 'block' : 'none' }} />
          </ListItemButton>
          {isAuth ? (
            <ListItemButton
              sx={{ gap: '32px', justifyContent: 'center', transition: 'all 0.3s', minHeight: '65px' }}
              onClick={handleLogout}
            >
              <Logout sx={iconStyle} />
              <ListItemText primary='Log out' sx={{ display: isOpen ? 'block' : 'none' }} />
            </ListItemButton>
          ) : (
            <>
              <ListItemButton
                sx={{ gap: '32px', justifyContent: 'center', ...getActiveStyle('/login') }}
                onClick={() => navigate('/login')}
              >
                <Login sx={iconStyle} />
                <ListItemText primary='Login' sx={{ display: isOpen ? 'block' : 'none', transition: 'all 0.3s' }} />
              </ListItemButton>
              {/* <ListItemButton
                sx={{ gap: '32px', justifyContent: 'center', ...getActiveStyle('/register') }}
                onClick={() => navigate('/register')}
              >
                <HowToReg sx={iconStyle} />
                <ListItemText primary='Register' sx={{ display: isOpen ? 'block' : 'none', transition: 'all 0.3s' }} />
              </ListItemButton> */}
            </>
          )}
        </List>
      </Box>
      <Footer isOpen={isOpen} />
    </Drawer>
  )
}

const Footer: React.FC<{ isOpen: boolean }> = ({ isOpen }) => {
  const theme = useTheme()

  return (
    <Box
      sx={{
        display: isOpen ? 'flex' : 'none',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '1rem',
        width: '100%'
      }}
    >
      <Link to='https://linkedtrust.us/' style={{ color: theme.palette.texts, textDecoration: 'none' }}>
        <Typography>© {new Date().getFullYear()} LinkedTrust</Typography>
      </Link>
      <Box
        sx={{
          display: 'flex',
          gap: '5px',
          textAlign: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          fontSize: '15px'
        }}
      >
        <Link to='/terms' style={{ color: theme.palette.texts, textDecoration: 'none' }}>
          Terms of Service
        </Link>
        <Link to='/privacy' style={{ color: theme.palette.texts, textDecoration: 'none' }}>
          Privacy Policy
        </Link>
        <Link to='/cookie' style={{ color: theme.palette.texts, textDecoration: 'none' }}>
          Cookie Policy
        </Link>
      </Box>
    </Box>
  )
}

export default Sidebar
