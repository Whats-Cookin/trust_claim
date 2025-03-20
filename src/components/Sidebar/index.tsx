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

  const getIconStyle = (path: string) => ({
    color: location.pathname === path ? '#FFFFFF' : theme.palette.text.primary,
    width: '1.5rem',
    height: '1.5rem'
  });
  const getActiveStyle = (path: string) => ({
    backgroundColor: location.pathname === path ? theme.palette.greenColor : '#FFFFFF',
    transition: 'background-color 0.3s, box-shadow 0.3s',
    minHeight: '65px',
  color: location.pathname === path ? '#FFFFFF' : theme.palette.text.primary,
  borderRadius: '8px'
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
          minWidth: isOpen ? 200 : 40,
          boxSizing: 'border-box',
          backgroundColor:'#FFFFFF',
          color: '#212529',
          transition: 'width 0.3s, opacity 0.3s, margin-top 0.3s',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          overflow: 'hidden',
          borderRight: 'none',
          borderRadius: '0 20px 40px 0',
          marginTop: isNavbarVisible && !isAuthPage ? '150px' : '0',
          height: isNavbarVisible && !isAuthPage ? 'calc(100vh - 150px)' : '100vh',
              boxShadow: '1px 1px 10px rgba(0, 0, 0, 0.25)',
              
        }
      }}
    >
      <List sx={{ padding: '30px' }}>
        <ListItemButton sx={{ gap: '20px', transition: 'all 0.3s', minHeight: '65px' }} onClick={toggleSidebar}>
          {isOpen ? <KeyboardDoubleArrowLeftIcon sx={getIconStyle('')} /> : <KeyboardDoubleArrowRightIcon sx={getIconStyle('')} />}
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
          <Home sx={getIconStyle('/feed')} />
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
            <AddCircleOutlineOutlinedIcon sx={getIconStyle('/claim')} />
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
          {isDarkMode ? <LightModeOutlinedIcon sx={getIconStyle('/theme')} /> : <DarkMode sx={getIconStyle('/theme')} />}
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
            <Logout sx={getIconStyle('/logout')} />
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
              <Login sx={getIconStyle('/login')} />
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
        padding: '0.9em',
        width: '100%',
        position:'relative',
        bottom:'9%'
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
        <Link to='/terms' style={{ color: "#212529", textDecoration: 'none' }}>
          <Typography variant='body2'>Terms of Service</Typography>
        </Link>
        <Link to='/privacy' style={{ color: "#212529", textDecoration: 'none' }}>
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
        <Link to='https://linkedtrust.us/' style={{ color: '#212529', textDecoration: 'none' }}>
          <Typography variant='body2'>© {new Date().getFullYear()} LinkedTrust</Typography>
        </Link>
      </Box>
    </Box>
  )
}

export default Sidebar
