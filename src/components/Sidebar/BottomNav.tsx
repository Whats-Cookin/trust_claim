import React from 'react'
import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material'
import {
  Home,
  AddCircleOutlineOutlined,
  LightModeOutlined,
  DarkMode,
  Logout,
  Login,
  FavoriteBorder
} from '@mui/icons-material'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTheme } from '@mui/material/styles'
import { clearAuth } from '../../utils/authUtils'

interface BottomNavProps {
  isAuth: boolean
  toggleTheme: () => void
  isDarkMode: boolean
  onOpenEndorseUs: () => void
}

const BottomNav: React.FC<BottomNavProps> = ({ isAuth, toggleTheme, isDarkMode, onOpenEndorseUs }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const theme = useTheme()

  const handleLogout = () => {
    clearAuth()
    navigate('/login')
  }

  // MUI pattern: BottomNavigation inside a fixed Paper; the current route is the selected value.
  return (
    <Paper
      elevation={3}
      square
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: theme.zIndex.appBar,
        pb: 'env(safe-area-inset-bottom)',
        backgroundColor: theme.palette.menuBackground,
        backgroundImage: 'none'
      }}
    >
      <BottomNavigation
        showLabels
        value={location.pathname}
        sx={{
          height: theme.mixins.bottomNav.height,
          backgroundColor: 'transparent',
          '& .MuiBottomNavigationAction-root': { color: theme.palette.sidecolor, minWidth: 0 },
          '& .Mui-selected': { color: theme.palette.primary.main }
        }}
      >
        <BottomNavigationAction label='Home' value='/feed' icon={<Home />} onClick={() => navigate('/feed')} />
        {isAuth && (
          <BottomNavigationAction
            label='Claim'
            value='/claim'
            icon={<AddCircleOutlineOutlined />}
            onClick={() => navigate('/claim')}
          />
        )}
        <BottomNavigationAction label='Endorse Us' icon={<FavoriteBorder />} onClick={onOpenEndorseUs} />
        <BottomNavigationAction
          label={isDarkMode ? 'Light' : 'Dark'}
          icon={isDarkMode ? <LightModeOutlined /> : <DarkMode />}
          onClick={toggleTheme}
        />
        {isAuth ? (
          <BottomNavigationAction label='Logout' icon={<Logout />} onClick={handleLogout} />
        ) : (
          <BottomNavigationAction label='Login' value='/login' icon={<Login />} onClick={() => navigate('/login')} />
        )}
      </BottomNavigation>
    </Paper>
  )
}

export default BottomNav
