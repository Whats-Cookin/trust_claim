import React from 'react'
import { Drawer, List, ListItemText, ListItemButton, Button, Box, useMediaQuery, useTheme } from '@mui/material'
import { Home, Create, Search } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'

interface SidebarProps {
  isAuth: boolean
  isOpen: boolean
  toggleSidebar: () => void
}

const Sidebar: React.FC<SidebarProps> = ({ isAuth, isOpen, toggleSidebar }) => {
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
          backgroundColor: theme.palette.formBackground,
          color: theme.palette.textc,
          marginTop: '64px'
        }
      }}
    >
      <List>
        <ListItemButton sx={{ gap: '1rem' }} onClick={toggleSidebar} onClickCapture={() => navigate('/feed')}>
          <Home sx={{ color: theme.palette.textc }} />
          <ListItemText primary='Home' />
        </ListItemButton>
        <ListItemButton sx={{ gap: '1rem' }} onClick={toggleSidebar} onClickCapture={() => navigate('/search')}>
          <Search sx={{ color: theme.palette.textc }} />
          <ListItemText primary='Search' />
        </ListItemButton>
        {isAuth ? (
          <ListItemButton sx={{ gap: '1rem' }} onClick={handleLogout}>
            <Button
              sx={{
                width: '100%',
                color: theme.palette.textc,
                backgroundColor: 'primary.main',
                '&:hover': {
                  backgroundColor: theme.palette.button
                }
              }}
            >
              Logout
            </Button>
          </ListItemButton>
        ) : (
          <>
            <ListItemButton sx={{ gap: '1rem' }} onClick={toggleSidebar} onClickCapture={() => navigate('/login')}>
              <Button
                variant='contained'
                color='primary'
                component='button'
                onClick={() => navigate('/')}
                sx={{
                  backgroundColor: theme.palette.icons,
                  borderRadius: '30px',
                  width: '100%',
                  maxwidth: isSmallScreen ? '100%' : '16vw',
                  '&:hover': {
                    backgroundColor: theme.palette.buttonHover
                  }
                }}
              >
                Login
              </Button>
            </ListItemButton>
            <ListItemButton sx={{ gap: '1rem' }} onClick={toggleSidebar} onClickCapture={() => navigate('/register')}>
              <Button
                variant='contained'
                color='primary'
                component='button'
                onClick={() => navigate('/')}
                sx={{
                  backgroundColor: theme.palette.icons,
                  borderRadius: '30px',
                  width: '100%',
                  maxwidth: isSmallScreen ? '100%' : '16vw',
                  '&:hover': {
                    backgroundColor: theme.palette.buttonHover
                  }
                }}
              >
                Register
              </Button>
            </ListItemButton>
          </>
        )}
      </List>
      {isAuth && (
        <Box sx={{ p: 2, mt: 'auto', mb: '64px', display: 'flex', justifyContent: 'center' }}>
          <Button
            variant='contained'
            color='primary'
            component='button'
            startIcon={<Create />}
            onClick={() => navigate('/')}
            sx={{
              backgroundColor: theme.palette.icons,
              borderRadius: '30px',
              width: '100%',
              maxwidth: isSmallScreen ? '16vw' : '100%',
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
