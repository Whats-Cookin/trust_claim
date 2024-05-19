import React from 'react'
import { Box, Drawer, List, ListItemText, IconButton, Typography, ListItemButton, Button } from '@mui/material'
import { Home, Explore, Create, ArrowBack, Search } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'

interface SidebarProps {
  isAuth: boolean
  isOpen: boolean
  toggleSidebar: () => void
}

const Sidebar: React.FC<SidebarProps> = ({ isAuth, isOpen, toggleSidebar }) => {
  const navigate = useNavigate()

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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 1rem' }}>
        <Typography variant='h6'>Menu</Typography>
        {isOpen && (
          <IconButton onClick={toggleSidebar}>
            <ArrowBack sx={{ color: '#fff' }} />
          </IconButton>
        )}
      </Box>
      <List>
        <ListItemButton onClick={toggleSidebar} onClickCapture={() => navigate('/feed')}>
          <Home sx={{ color: '#fff' }} />
          <ListItemText primary='Home (Feed of Claims)' />
        </ListItemButton>
        <ListItemButton onClick={toggleSidebar} onClickCapture={() => navigate('/search?query=.')}>
          <Explore sx={{ color: '#fff' }} />
          <ListItemText primary='Explore' />
        </ListItemButton>
        {isAuth ? (
          <>
            <ListItemButton onClick={toggleSidebar} onClickCapture={() => navigate('/')}>
              <Create sx={{ color: '#fff' }} />
              <ListItemText primary='Create Claim' />
            </ListItemButton>
            <ListItemButton onClick={toggleSidebar} onClickCapture={() => navigate('/search')}>
              <Search sx={{ color: '#fff' }} />
              <ListItemText primary='Search' />
            </ListItemButton>
            <ListItemButton onClick={handleLogout}>
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
          </>
        ) : (
          <>
            <ListItemButton onClick={toggleSidebar} onClickCapture={() => navigate('/login')}>
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
                Login
              </Button>
            </ListItemButton>
            <ListItemButton onClick={toggleSidebar} onClickCapture={() => navigate('/register')}>
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
                Register
              </Button>
            </ListItemButton>
          </>
        )}
      </List>
    </Drawer>
  )
}

export default Sidebar
