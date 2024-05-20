import React from 'react'
import { Box, List, ListItemButton, ListItemText, Button } from '@mui/material'
import { Home, Explore, Create, Search } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'

const ListNav: React.FC = () => {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('did')
    localStorage.removeItem('ethAddress')
    navigate('/login')
  }

  const isAuthenticated = Boolean(localStorage.getItem('accessToken'))

  return (
    <Box
      sx={{
        width: '10%',
        height: 'calc(100vh - 64px)',
        position: 'fixed',
        left: 0,
        top: '64px',
        backgroundColor: '#0A1C1D',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column', // Make the main box a column flex container
        justifyContent: 'space-between' // Space between nav items and the button
      }}
    >
      <List component='nav'>
        <ListItemButton onClick={() => navigate('/feed')}>
          <Home sx={{ color: '#fff' }} />
          <ListItemText primary='Home' />
        </ListItemButton>
        <ListItemButton onClick={() => navigate('/search?query=.')}>
          <Explore sx={{ color: '#fff' }} />
          <ListItemText primary='Explore' />
        </ListItemButton>
        {isAuthenticated && (
          <>
            <ListItemButton onClick={() => navigate('/')}>
              <Create sx={{ color: '#fff' }} />
              <ListItemText primary='Create Claim' />
            </ListItemButton>
            <ListItemButton onClick={() => navigate('/search')}>
              <Search sx={{ color: '#fff' }} />
              <ListItemText primary='Search' />
            </ListItemButton>
          </>
        )}
      </List>
      {isAuthenticated ? (
        <Button
          onClick={handleLogout}
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
      ) : (
        <Box>
          <Button
            onClick={() => navigate('/login')}
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
        </Box>
      )}
    </Box>
  )
}

export default ListNav
