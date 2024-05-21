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
          backgroundColor: '#0a1c1d',
          color: '#fff',
          marginTop: '64px'
        }
      }}
    >
      <List>
        <ListItemButton sx={{ gap: '1rem' }} onClick={toggleSidebar} onClickCapture={() => navigate('/feed')}>
          <Home sx={{ color: '#fff' }} />
          <ListItemText primary='Home' />
        </ListItemButton>
        <ListItemButton sx={{ gap: '1rem' }} onClick={toggleSidebar} onClickCapture={() => navigate('/search')}>
          <Search sx={{ color: '#fff' }} />
          <ListItemText primary='Search' />
        </ListItemButton>
        {isAuth ? (
          <ListItemButton sx={{ gap: '1rem' }} onClick={handleLogout}>
            <Button
              sx={{
                width: '100%',
                color: '#fff',
                backgroundColor: 'primary.main',
                '&:hover': {
                  backgroundColor: '#00695f'
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
                  backgroundColor: '#009688',
                  borderRadius: '30px',
                  width: '100%',
                  maxwidth: isSmallScreen ? '100%' : '16vw',
                  '&:hover': {
                    backgroundColor: '#00796b'
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
                  backgroundColor: '#009688',
                  borderRadius: '30px',
                  width: '100%',
                  maxwidth: isSmallScreen ? '100%' : '16vw',
                  '&:hover': {
                    backgroundColor: '#00796b'
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
              backgroundColor: '#009688',
              borderRadius: '30px',
              width: '100%',
              maxwidth: isSmallScreen ? '16vw' : '100%',
              gap: '1rem',
              '&:hover': {
                backgroundColor: '#00796b'
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
