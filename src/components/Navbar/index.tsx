import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import MenuIcon from '@mui/icons-material/Menu'
import SearchBar from '../searchbar'
import { useMediaQuery, useTheme } from '@mui/material'

const Navbar: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const theme = useTheme()
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'))

  const getPageName = () => {
    switch (location.pathname) {
      case '/feed':
        return 'Feed of Claims'
      case '/':
        return 'Create Claims'
      case '/create-claim':
        return 'Create Claim'
      case '/explore':
        return 'Explore'
      case '/search':
        return 'Search claims'
      case '/terms':
        return 'Terms of Service'
      case '/privacy':
        return 'Privacy policy'
      case '/cookie':
        return 'Cookies policy'
      default:
        return ''
    }
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position='fixed' sx={{ backgroundColor: '#0a1c1d', color: '#ffffff' }} elevation={0}>
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              minWidth: '23vw',
              maxWidth: isSmallScreen ? '80vw' : '23vw'
            }}
          >
            <Typography
              variant='h4'
              component='div'
              sx={{
                color: '#009688',
                fontWeight: 'bold',
                cursor: 'pointer',
                maxWidth: '10em',
                textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)'
              }}
              onClick={() => navigate('/feed')}
            >
              Trust Claims
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center', flexGrow: 1 }}>
            <Box sx={{ display: 'inline-block', textAlign: 'center' }}>
              <Typography variant='h6' component='div' sx={{ color: '#ffffff' }}>
                {getPageName()}
              </Typography>
              <Box
                sx={{
                  height: '4px',
                  backgroundColor: '#009688',
                  marginTop: '4px',
                  borderRadius: '2px',
                  width: '100%'
                }}
              />
            </Box>
          </Box>
          {!isSmallScreen && <SearchBar />}
        </Toolbar>
        {isSmallScreen && (
          <Toolbar sx={{ display: 'flex', justifyContent: 'center', backgroundColor: '#1a1a1a' }}>
            <SearchBar />
          </Toolbar>
        )}
      </AppBar>
    </Box>
  )
}

export default Navbar
