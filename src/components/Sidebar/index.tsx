import React from 'react'
import { Drawer, List, ListItemText, ListItemButton, Box, useTheme, Typography, useMediaQuery, SvgIcon } from '@mui/material'
import { Home, DarkMode, Logout, Login } from '@mui/icons-material'
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight'
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft'
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined'
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined'
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';
import { useNavigate, Link, useLocation } from 'react-router-dom'
import BottomNav from './BottomNav'
import { clearAuth } from '../../utils/authUtils'

function AtSymbolIcon(props: any) {
  return (
    <SvgIcon {...props} viewBox="0 0 1200 1200">
      <path d="m600 9.9844c-182.72 0.09375-355.08 84.797-466.78 229.4-111.66 144.61-150.05 332.81-103.92 509.63 46.172 176.76 171.61 322.22 339.71 393.79 168.14 71.625 359.9 61.266 519.37-27.984 14.438-8.1094 19.594-26.391 11.484-40.828-8.1094-14.484-26.391-19.641-40.875-11.531-136.31 76.406-299.44 88.688-445.69 33.656-146.26-55.031-260.76-171.79-312.94-319.08-52.219-147.32-36.703-310.13 42.281-444.98 79.031-134.81 213.52-227.9 367.5-254.39 154.03-26.484 311.86 16.359 431.39 117.05 119.48 100.69 188.44 249 188.48 405.28v125.11c0 68.297-55.359 123.66-123.66 123.66-68.297 0-123.66-55.359-123.66-123.66v-125.11c0-175.5-126.84-318.24-282.71-318.24s-282.71 142.74-282.71 318.24 126.71 318.24 282.71 318.24c96.094-2.0625 184.18-54.094 232.31-137.29 17.766 56.062 61.406 100.17 117.28 118.59 55.875 18.375 117.19 8.8125 164.81-25.734 47.621-34.547 75.75-89.859 75.609-148.69v-125.11c-0.1875-156.42-62.391-306.37-173.02-417s-260.58-172.82-417-173.02zm0 848.26c-122.81 0-222.71-116.02-222.71-258.24s99.891-258.24 222.71-258.24 222.71 116.02 222.71 258.24-99.891 258.24-222.71 258.24z" />
    </SvgIcon>
  )
}

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

  const iconStyle = { color: theme.palette.sidecolor, width: '1.5rem', height: '1.5rem' }

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
        width: isOpen ? 200 : 40,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: isOpen ? 200 : 40,
          position: 'relative',
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
          height: isNavbarVisible && !isAuthPage ? 'calc(100vh - 64px)' : '100vh',
          overflowX: 'hidden'
        }
      }}
    >
      <List sx={{ paddingTop: '0px' }}>
        <ListItemButton sx={{ gap: '20px', transition: 'all 0.3s', minHeight: '65px' }} onClick={toggleSidebar}>
          {isOpen ? <KeyboardDoubleArrowLeftIcon sx={iconStyle} /> : <KeyboardDoubleArrowRightIcon sx={iconStyle} />}
          <ListItemText
            primary='Close'
            sx={{ display: isOpen ? 'block' : 'none' }}
            primaryTypographyProps={{ variant: 'body2' }}
          />
        </ListItemButton>

        <ListItemButton sx={{ gap: '20px', ...getActiveStyle('/feed') }} onClick={() => navigate('/feed')}>
          <Home sx={iconStyle} />
          <ListItemText
            primary='Home'
            sx={{ display: isOpen ? 'block' : 'none', transition: 'all 0.3s' }}
            primaryTypographyProps={{ variant: 'body2' }}
          />
        </ListItemButton>

        {isAuth && (
          <ListItemButton sx={{ gap: '20px', ...getActiveStyle('/claim') }} onClick={() => navigate('/claim')}>
            <AddCircleOutlineOutlinedIcon sx={iconStyle} />
            <ListItemText
              primary='Claim'
              sx={{ display: isOpen ? 'block' : 'none', transition: 'all 0.3s' }}
              primaryTypographyProps={{ variant: 'body2' }}
            />
          </ListItemButton>
        )}

        <ListItemButton sx={{ gap: '20px', transition: 'all 0.3s', minHeight: '65px' }} onClick={toggleTheme}>
          {isDarkMode ? <LightModeOutlinedIcon sx={iconStyle} /> : <DarkMode sx={iconStyle} />}
          <ListItemText
            primary={isDarkMode ? 'Light' : 'Dark'}
            sx={{ display: isOpen ? 'block' : 'none' }}
            primaryTypographyProps={{ variant: 'body2' }}
          />
        </ListItemButton>
        <ListItemButton sx={{ gap: '20px', ...getActiveStyle('/at') }} onClick={() => navigate('/at')}>
          <AtSymbolIcon sx={iconStyle} />
          <ListItemText
            primary='ATProto'
            sx={{ display: isOpen ? 'block' : 'none', transition: 'all 0.3s' }}
            primaryTypographyProps={{ variant: 'body2' }}
          />
        </ListItemButton>

        {isAuth ? (
          <ListItemButton sx={{ gap: '20px', transition: 'all 0.3s', minHeight: '65px' }} onClick={handleLogout}>
            <Logout sx={iconStyle} />
            <ListItemText
              primary='Log out'
              sx={{ display: isOpen ? 'block' : 'none' }}
              primaryTypographyProps={{ variant: 'body2' }}
            />
          </ListItemButton>
        ) : (
          <ListItemButton sx={{ gap: '20px', ...getActiveStyle('/login') }} onClick={() => navigate('/login')}>
            <Login sx={iconStyle} />
            <ListItemText
              primary='Login'
              sx={{ display: isOpen ? 'block' : 'none', transition: 'all 0.3s' }}
              primaryTypographyProps={{ variant: 'body2' }}
            />
          </ListItemButton>
        )}
      </List>
      <Footer isOpen={isOpen} />
    </Drawer>
  )
}

const Footer: React.FC<{ isOpen: boolean }> = ({ isOpen }) => {
  const theme = useTheme()

  return (
    <Box sx={{ display: isOpen ? 'flex' : 'none', flexDirection: 'column', padding: '0.5rem', width: '100%' }}>
      <Box sx={{ display: 'flex', gap: '10px', textAlign: 'left', justifyContent: 'flex-start', flexDirection: 'row', alignItems: 'center' }}>
        <Link to='/terms' style={{ color: theme.palette.texts, textDecoration: 'none' }}>
          <Typography variant='body2'>Terms of Service</Typography>
        </Link>
        <Link to='/privacy' style={{ color: theme.palette.texts, textDecoration: 'none' }}>
          <Typography variant='body2'>Privacy Policy</Typography>
        </Link>
      </Box>
      <Box sx={{ marginTop: '8px', display: 'flex', justifyContent: 'flex-start' }}>
        <Link to='https://linkedtrust.us/' style={{ color: theme.palette.texts, textDecoration: 'none' }}>
          <Typography variant='body2'>© {new Date().getFullYear()} LinkedTrust</Typography>
        </Link>
      </Box>
    </Box>
  )
}

export default Sidebar