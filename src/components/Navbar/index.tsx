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
import Sidebar from '../Sidebar'

interface NavbarProps {
  isAuth: boolean
}

const Navbar: React.FC<NavbarProps> = ({ isAuth }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const theme = useTheme()
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'))

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const getPageName = () => {
    switch (location.pathname) {
      case '/feed':
        return 'Feed of Claims'
      case '/create-claim':
        return 'Create Claim'
      case '/explore':
        return 'Explore'
      default:
        return ''
    }
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position='fixed' sx={{ backgroundColor: '#0a1c1d', color: '#ffffff' }}>
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton edge='start' color='inherit' aria-label='menu' onClick={toggleSidebar}>
              <MenuIcon />
            </IconButton>
            <Typography
              variant='h6'
              component='div'
              sx={{ color: '#009688', fontWeight: 'bold', cursor: 'pointer' }}
              onClick={() => navigate('/feed')}
            >
              Trust Claims
            </Typography>
          </Box>
          <Typography variant='h6' component='div' sx={{ flexGrow: 1, textAlign: 'center', color: '#ffffff' }}>
            {getPageName()}
          </Typography>
          {!isSmallScreen && <SearchBar />}
        </Toolbar>
        {isSmallScreen && (
          <Toolbar sx={{ display: 'flex', justifyContent: 'center', backgroundColor: '#1a1a1a' }}>
            <SearchBar />
          </Toolbar>
        )}
      </AppBar>
      <Sidebar isAuth={isAuth} isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
    </Box>
  )
}

export default Navbar
