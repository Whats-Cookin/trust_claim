import React, { useState } from 'react'
import {
  Drawer,
  List,
  ListItemText,
  ListItemButton,
  Box,
  Button,
  useTheme,
  Typography,
  Toolbar,
  useMediaQuery
} from '@mui/material'
import { Home, DarkMode, Logout, Login } from '@mui/icons-material'
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight'
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft'
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined'
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined'
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail'
import StarOutlineIcon from '@mui/icons-material/StarOutline'
import FormatQuoteIcon from '@mui/icons-material/FormatQuote'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import BottomNav from './BottomNav'
import { clearAuth } from '../../utils/authUtils'
import EndorseUsDialog from '../../containers/PlatformFeedback/EndorseUsDialog'

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
  const [endorseUsOpen, setEndorseUsOpen] = useState(false)
  const navigate = useNavigate()
  const theme = useTheme()
  const location = useLocation()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const handleLogout = () => {
    clearAuth()
    navigate('/login')
  }

  const iconStyle = { color: theme.palette.sidecolor }

  const getActiveStyle = (path: string) => ({
    backgroundColor: location.pathname === path ? theme.palette.pageBackground : 'transparent',
    transition: 'background-color 0.3s, box-shadow 0.3s'
  })

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register'

  if (isMobile) {
    return (
      <>
        <BottomNav
          isAuth={isAuth}
          toggleTheme={toggleTheme}
          isDarkMode={isDarkMode}
          onOpenEndorseUs={() => setEndorseUsOpen(true)}
        />
        <EndorseUsDialog open={endorseUsOpen} onClose={() => setEndorseUsOpen(false)} />
      </>
    )
  }

  const railWidth = isOpen ? theme.spacing(25) : theme.spacing(5)

  // Permanent drawer clipped under the AppBar (MUI pattern): full viewport height, sticky, a
  // Toolbar-height spacer at the top; the page scrolls beside it.
  return (
    <Drawer
      variant='permanent'
      sx={{
        width: railWidth,
        flexShrink: 0,
        position: 'sticky',
        top: 0,
        alignSelf: 'flex-start',
        height: '100vh',
        '& .MuiDrawer-paper': {
          width: railWidth,
          position: 'static',
          height: '100%',
          boxSizing: 'border-box',
          backgroundColor: theme.palette.menuBackground,
          color: theme.palette.sidecolor,
          transition: 'width 0.3s',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          overflowX: 'hidden',
          borderRight: `1px solid ${theme.palette.divider}`,
          // Collapsed the rail is 40px, but a list item's default padding plus
          // a 24px icon needs 56px, so the icons spill over the edge.
          '& .MuiListItemButton-root': {
            px: isOpen ? 2 : 1,
            gap: isOpen ? 2.5 : 0,
            minHeight: theme.spacing(8),
            justifyContent: isOpen ? 'flex-start' : 'center'
          }
        }
      }}
    >
      <Toolbar />
      <List sx={{ pt: 0, flex: 1 }}>
        <ListItemButton sx={{ transition: 'all 0.3s' }} onClick={toggleSidebar}>
          {isOpen ? <KeyboardDoubleArrowLeftIcon sx={iconStyle} /> : <KeyboardDoubleArrowRightIcon sx={iconStyle} />}
          <ListItemText
            primary='Close'
            sx={{ display: isOpen ? 'block' : 'none' }}
            primaryTypographyProps={{ variant: 'body2' }}
          />
        </ListItemButton>

        <ListItemButton sx={{ ...getActiveStyle('/feed') }} onClick={() => navigate('/feed')}>
          <Home sx={iconStyle} />
          <ListItemText
            primary='Home'
            sx={{ display: isOpen ? 'block' : 'none', transition: 'all 0.3s' }}
            primaryTypographyProps={{ variant: 'body2' }}
          />
        </ListItemButton>

        {isAuth && (
          <ListItemButton sx={{ ...getActiveStyle('/claim') }} onClick={() => navigate('/claim')}>
            <AddCircleOutlineOutlinedIcon sx={iconStyle} />
            <ListItemText
              primary='Claim'
              sx={{ display: isOpen ? 'block' : 'none', transition: 'all 0.3s' }}
              primaryTypographyProps={{ variant: 'body2' }}
            />
          </ListItemButton>
        )}

        {isAuth && (
          <ListItemButton sx={{ ...getActiveStyle('/mine') }} onClick={() => navigate('/mine')}>
            <FormatQuoteIcon sx={iconStyle} />
            <ListItemText
              primary='Mine'
              sx={{ display: isOpen ? 'block' : 'none', transition: 'all 0.3s' }}
              primaryTypographyProps={{ variant: 'body2' }}
            />
          </ListItemButton>
        )}

        {isAuth && (
          <ListItemButton
            sx={{ ...getActiveStyle('/request-testimonial') }}
            onClick={() => navigate('/request-testimonial')}
          >
            <StarOutlineIcon sx={iconStyle} />
            <ListItemText
              primary='Request a Rating'
              sx={{ display: isOpen ? 'block' : 'none', transition: 'all 0.3s' }}
              primaryTypographyProps={{ variant: 'body2' }}
            />
          </ListItemButton>
        )}

        <ListItemButton sx={{ transition: 'all 0.3s' }} onClick={toggleTheme}>
          {isDarkMode ? <LightModeOutlinedIcon sx={iconStyle} /> : <DarkMode sx={iconStyle} />}
          <ListItemText
            primary={isDarkMode ? 'Light' : 'Dark'}
            sx={{ display: isOpen ? 'block' : 'none' }}
            primaryTypographyProps={{ variant: 'body2' }}
          />
        </ListItemButton>

        <ListItemButton sx={{ ...getActiveStyle('/at') }} onClick={() => navigate('/at')}>
          <AlternateEmailIcon sx={iconStyle} />
          <ListItemText
            primary='ATProto'
            sx={{ display: isOpen ? 'block' : 'none', transition: 'all 0.3s' }}
            primaryTypographyProps={{ variant: 'body2' }}
          />
        </ListItemButton>

        {isAuth ? (
          <ListItemButton sx={{ transition: 'all 0.3s' }} onClick={handleLogout}>
            <Logout sx={iconStyle} />
            <ListItemText
              primary='Log out'
              sx={{ display: isOpen ? 'block' : 'none' }}
              primaryTypographyProps={{ variant: 'body2' }}
            />
          </ListItemButton>
        ) : (
          <ListItemButton sx={{ ...getActiveStyle('/login') }} onClick={() => navigate('/login')}>
            <Login sx={iconStyle} />
            <ListItemText
              primary='Login'
              sx={{ display: isOpen ? 'block' : 'none', transition: 'all 0.3s' }}
              primaryTypographyProps={{ variant: 'body2' }}
            />
          </ListItemButton>
        )}
      </List>
      <Footer isOpen={isOpen} onOpenEndorseUs={() => setEndorseUsOpen(true)} />
      <EndorseUsDialog open={endorseUsOpen} onClose={() => setEndorseUsOpen(false)} />
    </Drawer>
  )
}

const Footer: React.FC<{ isOpen: boolean; onOpenEndorseUs: () => void }> = ({ isOpen, onOpenEndorseUs }) => {
  const theme = useTheme()

  return (
    <Box sx={{ display: isOpen ? 'flex' : 'none', flexDirection: 'column', p: 1, width: '100%', gap: 1 }}>
      <Button variant='contained' color='primary' fullWidth onClick={onOpenEndorseUs}>
        Endorse Us
      </Button>
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
        <Link to='/terms' style={{ color: theme.palette.texts, textDecoration: 'none' }}>
          <Typography variant='caption'>Terms of Service</Typography>
        </Link>
        <Link to='/privacy' style={{ color: theme.palette.texts, textDecoration: 'none' }}>
          <Typography variant='caption'>Privacy Policy</Typography>
        </Link>
      </Box>
      <Link to='https://linkedtrust.us/' style={{ color: theme.palette.texts, textDecoration: 'none' }}>
        <Typography variant='caption'>© {new Date().getFullYear()} LinkedTrust</Typography>
      </Link>
    </Box>
  )
}

export default Sidebar
