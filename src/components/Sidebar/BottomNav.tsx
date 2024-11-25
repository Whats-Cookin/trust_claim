import React from 'react'
import { BottomNavigation, BottomNavigationAction } from '@mui/material'
import { Home, Search, AddCircleOutlineOutlined, LightModeOutlined, DarkMode, Logout, Login } from '@mui/icons-material'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTheme } from '@mui/material/styles'

interface BottomNavProps {
  isAuth: boolean
  toggleTheme: () => void
  isDarkMode: boolean
}

const BottomNav: React.FC<BottomNavProps> = ({ isAuth, toggleTheme, isDarkMode }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const theme = useTheme()

  const handleLogout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('did')
    localStorage.removeItem('ethAddress')
    navigate('/login')
  }

  const getActiveStyle = (path: string) => ({
    backgroundColor: location.pathname === path ? theme.palette.pageBackground : 'transparent',
    borderRadius: '0 0 50% 50%',
    transition: 'background-color 0.3s',
    marginBottom: '4px',
    maxWidth: '52px'
  })

  return (
    <BottomNavigation
      sx={{
        position: 'fixed',
        height: '60px',
        width: '100%',
        backgroundColor: theme.palette.menuBackground,
        color: theme.palette.sidecolor,
        zIndex: 10
      }}
      showLabels
    >
      <BottomNavigationAction
        label='Home'
        icon={<Home />}
        onClick={() => navigate('/feed')}
        sx={{ ...getActiveStyle('/feed'), color: theme.palette.sidecolor }}
      />
      {isAuth && (
        <BottomNavigationAction
          label='Claim'
          icon={<AddCircleOutlineOutlined />}
          onClick={() => navigate('/claim')}
          sx={{ ...getActiveStyle('/claim'), color: theme.palette.sidecolor }}
        />
      )}
      <BottomNavigationAction
        label={isDarkMode ? 'Light' : 'Dark'}
        icon={isDarkMode ? <LightModeOutlined /> : <DarkMode />}
        onClick={toggleTheme}
        sx={{
          transition: 'background-color 0.3s',
          maxWidth: '52px',
          marginBottom: '4px',
          color: theme.palette.sidecolor
        }}
      />
      {isAuth ? (
        <BottomNavigationAction
          label='Logout'
          icon={<Logout />}
          onClick={handleLogout}
          sx={{
            transition: 'background-color 0.3s',
            maxWidth: '52px',
            marginBottom: '4px',
            color: theme.palette.sidecolor
          }}
        />
      ) : (
        <BottomNavigationAction
          label='Login'
          icon={<Login />}
          onClick={() => navigate('/login')}
          sx={{
            ...getActiveStyle('/login'),
            color: theme.palette.sidecolor
          }}
        />
      )}
    </BottomNavigation>
  )
}

export default BottomNav
