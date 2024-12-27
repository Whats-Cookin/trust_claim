import React from 'react'
import { Drawer, List, ListItemText, ListItemButton, Box, useTheme, Typography, useMediaQuery } from '@mui/material'
import { Home, DarkMode, Logout, Login, Search } from '@mui/icons-material'
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight'
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft'
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined'
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import BottomNav from './BottomNav'
import { clearAuth } from '../../utils/authUtils'


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
    clearAuth()
    navigate('/login')
  }

  const iconStyle = { color: theme.palette.sidecolor, width: '1.25rem', height: '1.25rem' }

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
          borderRadius: '0 20px 40px 0',
          marginTop: isNavbarVisible && !isAuthPage ? '64px' : '0',
          height: isNavbarVisible && !isAuthPage ? 'calc(100vh - 64px)' : '100vh'
        }
      }}
    >
      <List sx={{ paddingTop: '0px' }}>
        <ListItemButton sx={{ gap: '20px', transition: 'all 0.3s', minHeight: '65px' }} onClick={toggleSidebar}>
          {isOpen ? <KeyboardDoubleArrowLeftIcon sx={iconStyle} /> : <KeyboardDoubleArrowRightIcon sx={iconStyle} />}
          <ListItemText
            primary='Close'
            sx={{
              display: isOpen ? 'block' : 'none'
            }}
            primaryTypographyProps={{
              variant: 'body2'
            }}
          />
        </ListItemButton>
        <ListItemButton sx={{ gap: '20px', ...getActiveStyle('/feed') }} onClick={() => navigate('/feed')}>
          <Home sx={iconStyle} />
          <ListItemText
            primary='Home'
            sx={{ display: isOpen ? 'block' : 'none', transition: 'all 0.3s' }}
            primaryTypographyProps={{
              variant: 'body2'
            }}
          />
        </ListItemButton>
        {isAuth && (
          <ListItemButton sx={{ gap: '20px', ...getActiveStyle('/claim') }} onClick={() => navigate('/claim')}>
            <AddCircleOutlineOutlinedIcon sx={iconStyle} />
            <ListItemText
              primary='Claim'
              sx={{ display: isOpen ? 'block' : 'none', transition: 'all 0.3s' }}
              primaryTypographyProps={{
                variant: 'body2'
              }}
            />
          </ListItemButton>
        )}
        <ListItemButton sx={{ gap: '20px', transition: 'all 0.3s', minHeight: '65px' }} onClick={toggleTheme}>
          {isDarkMode ? <LightModeOutlinedIcon sx={iconStyle} /> : <DarkMode sx={iconStyle} />}
          <ListItemText
            primary={isDarkMode ? 'Light' : 'Dark'}
            sx={{ display: isOpen ? 'block' : 'none' }}
            primaryTypographyProps={{
              variant: 'body2'
            }}
          />
        </ListItemButton>
        {isAuth ? (
          <ListItemButton sx={{ gap: '20px', transition: 'all 0.3s', minHeight: '65px' }} onClick={handleLogout}>
            <Logout sx={iconStyle} />
            <ListItemText
              primary='Log out'
              sx={{ display: isOpen ? 'block' : 'none' }}
              primaryTypographyProps={{
                variant: 'body2'
              }}
            />
          </ListItemButton>
        ) : (
          <>
            <ListItemButton sx={{ gap: '20px', ...getActiveStyle('/login') }} onClick={() => navigate('/login')}>
              <Login sx={iconStyle} />
              <ListItemText
                primary='Login'
                sx={{ display: isOpen ? 'block' : 'none', transition: 'all 0.3s' }}
                primaryTypographyProps={{
                  variant: 'body2'
                }}
              />
            </ListItemButton>
          </>
        )}
      </List>
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
        padding: '0.5rem',
        width: '100%'
      }}
    >
      <Box
        sx={{
          display: 'flex',
          gap: '10px',
          textAlign: 'left',
          justifyContent: 'flex-start',
          flexDirection: 'row',
          alignItems: 'center'
        }}
      >
        <Link to='/terms' style={{ color: theme.palette.texts, textDecoration: 'none' }}>
          <Typography variant='body2'>Terms of Service</Typography>
        </Link>
        <Link to='/privacy' style={{ color: theme.palette.texts, textDecoration: 'none' }}>
          <Typography variant='body2'>Privacy Policy</Typography>
        </Link>
      </Box>
      <Box
        sx={{
          marginTop: '8px',
          display: 'flex',
          justifyContent: 'flex-start'
        }}
      >
        <Link to='https://linkedtrust.us/' style={{ color: theme.palette.texts, textDecoration: 'none' }}>
          <Typography variant='body2'>© {new Date().getFullYear()} LinkedTrust</Typography>
        </Link>
      </Box>
    </Box>
  )
}

export default Sidebar
