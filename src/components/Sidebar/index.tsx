import React from 'react'
import {
  Drawer,
  List,
  ListItemText,
  ListItemButton,
  Button,
  Box,
  useMediaQuery,
  useTheme,
  IconButton,
  Grow
} from '@mui/material'
import { Home, Create, Search, Brightness7, DarkMode } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'

interface SidebarProps {
  isAuth: boolean
  isOpen: boolean
  toggleSidebar: () => void
  toggleTheme: () => void
  isDarkMode: boolean
}

const Sidebar: React.FC<SidebarProps> = ({ isAuth, isOpen, toggleSidebar, toggleTheme, isDarkMode }) => {
  const navigate = useNavigate()
  const theme = useTheme()
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'))

  const handleLogout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('did')
    localStorage.removeItem('ethAddress')

    navigate('/login')
  }

  return (
    <Drawer
      variant='temporary'
      open={isOpen}
      onClose={toggleSidebar}
      sx={{
        '& .MuiDrawer-paper': {
          width: 240,
          boxSizing: 'border-box',
          backgroundColor: theme.palette.footerBackground,
          color: theme.palette.texts,
          marginTop: '64px'
        }
      }}
    >
      <List>
        <Grow in={isOpen} timeout={600}>
          <ListItemButton sx={{ gap: '1rem' }} onClick={toggleSidebar} onClickCapture={() => navigate('/feed')}>
            <Home sx={{ color: theme.palette.texts }} />
            <ListItemText primary='Home' sx={{ color: theme.palette.texts }} />
          </ListItemButton>
        </Grow>
        <Grow in={isOpen} timeout={700}>
          <ListItemButton sx={{ gap: '1rem' }} onClick={toggleSidebar} onClickCapture={() => navigate('/search')}>
            <Search sx={{ color: theme.palette.texts }} />
            <ListItemText primary='Search' sx={{ color: theme.palette.texts }} />
          </ListItemButton>
        </Grow>
        <Grow in={isOpen} timeout={800}>
          <ListItemButton
            sx={{
              gap: '1rem',
              width: '100%',
              justifyContent: 'center',
              '&:hover': {
                backgroundColor: theme.palette.action.hover
              }
            }}
            onClick={toggleTheme}
          >
            <IconButton
              sx={{
                color: theme.palette.texts,
                '&:hover': {
                  backgroundColor: 'transparent'
                }
              }}
              aria-label='toggle theme'
              disableRipple
            >
              {isDarkMode ? <Brightness7 /> : <DarkMode />}
            </IconButton>
            <ListItemText primary={isDarkMode ? 'Light' : 'Dark'} />
          </ListItemButton>
        </Grow>
        {isAuth ? (
          <Grow in={isOpen} timeout={900}>
            <ListItemButton sx={{ gap: '1rem' }} onClick={handleLogout}>
              <Button
                sx={{
                  width: '100%',
                  color: theme.palette.buttontext,
                  backgroundColor: theme.palette.buttons,
                  '&:hover': {
                    backgroundColor: theme.palette.buttonHover
                  }
                }}
              >
                Logout
              </Button>
            </ListItemButton>
          </Grow>
        ) : (
          <>
            <Grow in={isOpen} timeout={1000}>
              <ListItemButton sx={{ gap: '1rem' }} onClick={toggleSidebar} onClickCapture={() => navigate('/login')}>
                <Button
                  variant='contained'
                  onClick={() => navigate('/')}
                  sx={{
                    color: theme.palette.buttontext,
                    backgroundColor: theme.palette.buttons,
                    borderRadius: '30px',
                    width: '100%',
                    maxWidth: isSmallScreen ? '100%' : '16vw',
                    '&:hover': {
                      backgroundColor: theme.palette.buttonHover
                    }
                  }}
                >
                  Login
                </Button>
              </ListItemButton>
            </Grow>
            <Grow in={isOpen} timeout={1100}>
              <ListItemButton sx={{ gap: '1rem' }} onClick={toggleSidebar} onClickCapture={() => navigate('/register')}>
                <Button
                  variant='contained'
                  onClick={() => navigate('/')}
                  sx={{
                    color: theme.palette.buttontext,
                    backgroundColor: theme.palette.buttons,
                    borderRadius: '30px',
                    width: '100%',
                    maxWidth: isSmallScreen ? '100%' : '16vw',
                    '&:hover': {
                      backgroundColor: theme.palette.buttonHover
                    }
                  }}
                >
                  Register
                </Button>
              </ListItemButton>
            </Grow>
          </>
        )}
      </List>
      {isAuth && (
        <Box sx={{ p: 2, mt: 'auto', mb: '64px', display: 'flex', justifyContent: 'center' }}>
          <Button
            variant='contained'
            startIcon={<Create />}
            onClick={() => navigate('/')}
            sx={{
              color: theme.palette.buttontext,
              backgroundColor: theme.palette.buttons,
              borderRadius: '30px',
              width: '100%',
              maxWidth: isSmallScreen ? '16vw' : '100%',
              minWidth: '175px',
              gap: '1rem',
              '&:hover': {
                backgroundColor: theme.palette.buttonHover
              }
            }}
          >
            Create Claim
          </Button>
        </Box>
      )}
    </Drawer>
  )
}

export default Sidebar
