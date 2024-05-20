import React from 'react'
import { List, ListItemText, ListItemButton, Button, Box, useMediaQuery, useTheme } from '@mui/material'
import { Home, Search } from '@mui/icons-material'
import CreateIcon from '@mui/icons-material/Create'
import { useNavigate } from 'react-router-dom'

interface SidebarProps {
  isAuth: boolean
}

const AlwaysOpenSidebar: React.FC<SidebarProps> = ({ isAuth }) => {
  const theme = useTheme()

  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'))

  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('did')
    localStorage.removeItem('ethAddress')
    navigate('/login')
  }

  return (
    <Box
      style={{
        width: '25vw',
        height: '100vh',
        backgroundColor: '#0A1C1D',
        color: '#fff',
        position: 'fixed',
        top: 0,
        left: 0,
        marginTop: '64px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}
    >
      <List sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
        <ListItemButton sx={{ gap: '1rem', width: '100%', justifyContent: 'center' }} onClick={() => navigate('/feed')}>
          <Home sx={{ color: '#fff' }} />
          <ListItemText primary='Home' />
        </ListItemButton>
        <ListItemButton
          sx={{ gap: '1rem', width: '100%', justifyContent: 'center' }}
          onClick={() => navigate('/search')}
        >
          <Search sx={{ color: '#fff' }} />
          <ListItemText primary='Search' />
        </ListItemButton>
        {isAuth ? (
          <ListItemButton sx={{ gap: '1rem', width: '100%', justifyContent: 'center' }} onClick={handleLogout}>
            <Button
              sx={{
                color: '#fff',
                width: '100%',
                maxWidth: '16vw',
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
            <ListItemButton
              sx={{ gap: '1rem', width: '100%', justifyContent: 'center' }}
              onClick={() => navigate('/login')}
            >
              <Button
                sx={{
                  color: '#fff',
                  width: '100%',
                  maxWidth: '16vw',
                  backgroundColor: 'primary.main',
                  '&:hover': {
                    backgroundColor: '#00695f'
                  }
                }}
              >
                Login
              </Button>
            </ListItemButton>
            <ListItemButton
              sx={{ gap: '1rem', width: '100%', justifyContent: 'center' }}
              onClick={() => navigate('/register')}
            >
              <Button
                sx={{
                  color: '#fff',
                  width: '100%',
                  maxWidth: '16vw',
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
      {isAuth && (
        <Box sx={{ p: 2, mt: 'auto', mb: '64px', display: 'flex', justifyContent: 'center' }}>
          <Button
            variant='contained'
            color='primary'
            component='button'
            startIcon={<CreateIcon />}
            onClick={() => navigate('/')}
            sx={{
              backgroundColor: '#009688',
              borderRadius: '30px',
              width: '16vw',
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
    </Box>
  )
}

export default AlwaysOpenSidebar
