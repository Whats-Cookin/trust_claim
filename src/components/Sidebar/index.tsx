import React from 'react'
import { Drawer, List, ListItemText, ListItemButton, Box, useTheme, Typography, useMediaQuery } from '@mui/material'
import { DarkMode, Logout, Login, Search } from '@mui/icons-material'
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined'
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import BottomNav from './BottomNav'
import { clearAuth } from '../../utils/authUtils'
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined'
interface SidebarProps {
  isAuth: boolean
  toggleTheme: () => void
  isDarkMode: boolean
  isNavbarVisible: boolean
}

const Sidebar: React.FC<SidebarProps> = ({ isAuth, toggleTheme, isDarkMode, isNavbarVisible }) => {
  const navigate = useNavigate()
  const theme = useTheme()
  const location = useLocation()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const handleLogout = () => {
    clearAuth()
    navigate('/login')
  }

  const getIconStyle = (path: string) => ({
    color: location.pathname === path ? '#FFFFFF' : theme.palette.text.primary,
    width: '1.5rem',
    height: '1.5rem',
    '&:hover': {
      color: '#2D6A4F'
    }
  })

  const getActiveStyle = (path: string) => ({
    backgroundColor: location.pathname === path ? '#2D6A4F' : '#FFFFFF',
    transition: 'background-color 0.3s, box-shadow 0.3s',
    minHeight: '44px',
    color: location.pathname === path ? '#FFFFFF' : theme.palette.text.primary,
    borderRadius: '8px',
    width: '270px',
    maxWidth: '270px',
    pl: '56px',
    '&:hover': {
      color: '#2D6A4F'
    }
  })

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register'

  if (isMobile) {
    return <BottomNav isAuth={isAuth} toggleTheme={toggleTheme} isDarkMode={isDarkMode} />
  }

  return (
    <Drawer
      variant='permanent'
      sx={{
        '& .MuiDrawer-paper': {
          width: 'clamp(294px, 20vw, 320px)',
          boxSizing: 'border-box',
          backgroundColor: '#FFFFFF',
          color: '#212529',
          transition: 'width 0.3s, opacity 0.3s, margin-top 0.3s',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          overflow: 'hidden',
          borderRight: 'none',
          borderRadius: '0 8px 8px 0',
          position: 'fixed',
          bottom: '0',
        marginTop: !isAuthPage ? `calc(clamp(50px, 5.146vw, 103px) + 56px)` : '0',
          height: isNavbarVisible && !isAuthPage ? `calc(100vh - clamp(50px, 6.146vw, 118px))` : '100vh',
          boxShadow: '1px 1px 10px rgba(0, 0, 0, 0.25)'
        }
      }}
    >
      <List sx={{ pt: { xs: theme.spacing(4), md: theme.spacing(5) }, ml: { xs: theme.spacing(2), md: theme.spacing(3) } }}>
        <ListItemButton
          sx={{
            gap: theme.spacing(2),
            ...getActiveStyle('/feed'),
            '&:hover': {
              color: '#2D6A4F',
              '& svg': { color: '#2D6A4F' }
            }
          }}
          onClick={() => navigate('/feed')}
        >
          <HomeOutlinedIcon sx={getIconStyle('/feed')} />
          <ListItemText
            primary='Home'
            primaryTypographyProps={{
      
              fontSize: { xs: '12px', md: '16px' },
              fontFamily: 'Montserrat',
              fontWeight: '600'
            }}
          />
        </ListItemButton>

        <ListItemButton
          sx={{
            gap: theme.spacing(2),
            ...getActiveStyle('/SearchBar'),
            '&:hover': {
              color: '#2D6A4F',
              '& svg': { color: '#2D6A4F' }
            }
          }}
          onClick={() => navigate('/SearchBar')}
        >
          <Search sx={getIconStyle('/SearchBar')} />
          <ListItemText
            primary='Search'
            primaryTypographyProps={{
              fontSize: { xs: '12px', md: '16px' },
              fontFamily: 'Montserrat',
              fontWeight: '600'
            }}
          />
        </ListItemButton>

        {isAuth && (
          <ListItemButton
            sx={{
              gap: theme.spacing(2),
              ...getActiveStyle('/claim'),
              '&:hover': { color: '#2D6A4F', '& svg': { color: '#2D6A4F' } }
            }}
            onClick={() => navigate('/claim')}
          >
            <AddCircleOutlineOutlinedIcon sx={getIconStyle('/claim')} />
            <ListItemText
              primary='Claim'
              primaryTypographyProps={{
                fontSize: { xs: '12px', md: '16px' },
                fontFamily: 'Montserrat',
                fontWeight: '600'
              }}
            />
          </ListItemButton>
        )}

        {/* <ListItemButton sx={{ gap: theme.spacing(2), minHeight: { xs: '50px', md: '65px' } }} onClick={toggleTheme}>
        {isDarkMode ? <LightModeOutlinedIcon sx={getIconStyle('/theme')} /> : <DarkMode sx={getIconStyle('/theme')} />}
        <ListItemText
          primary={isDarkMode ? 'Light' : 'Dark'}
          primaryTypographyProps={{
            variant: 'body1',
            color: '#212529',
            fontSize: { xs: '12px', md: '14px' },
            fontFamily: 'Montserrat'
          }}
        />
      </ListItemButton> */}

        {isAuth ? (
          <ListItemButton
            sx={{
              gap: theme.spacing(2),
              minHeight: '44px',
              '&:hover': { color: '#2D6A4F', '& svg': { color: '#2D6A4F' } },
              borderRadius: '8px',
              height: '44px',
              pl: '56px'
            }}
            onClick={handleLogout}
          >
            <Logout sx={getIconStyle('/logout')} />
            <ListItemText
              primary='Log out'
              primaryTypographyProps={{
                fontSize: { xs: '12px', md: '16px' },
              fontFamily: 'Montserrat',
              fontWeight: '600'
              }}
            />
          </ListItemButton>
        ) : (
          <ListItemButton
            sx={{
              gap: theme.spacing(2),
              ...getActiveStyle('/login'),
              '&:hover': { color: '#2D6A4F', '& svg': { color: '#2D6A4F' } },
              borderRadius: '8px',
              height: '44px'
            }}
            onClick={() => navigate('/login')}
          >
            <Login sx={getIconStyle('/login')} />
            <ListItemText
              primary='Login'
              primaryTypographyProps={{
                variant: 'body1',
                color: '#212529',
                fontSize: { xs: '12px', md: '14px' },
                fontFamily: 'Montserrat'
              }}
            />
          </ListItemButton>
        )}
      </List>

      {/* <Footer /> */}
    </Drawer>
  )
}

// const Footer = () => {
//   return (
//     <Box
//       sx={{
//         display: 'flex',
//         flexDirection: 'column',
//         padding: '0.9em',
//         width: '100%',
//         position: 'relative',
//         bottom: '9%'
//       }}
//     >
//       <Box
//         sx={{
//           display: 'flex',
//           gap: '10px',
//           textAlign: 'left',
//           justifyContent: 'flex-start',
//           flexDirection: 'row',
//           alignItems: 'center'
//         }}
//       >
//         <Link to='/terms' style={{ color: '#212529', textDecoration: 'none' }}>
//           <Typography variant='body1'>Terms of Service</Typography>
//         </Link>
//         <Link to='/privacy' style={{ color: '#212529', textDecoration: 'none' }}>
//           <Typography variant='body1'>Privacy Policy</Typography>
//         </Link>
//       </Box>
//       <Box sx={{ marginTop: '8px', display: 'flex', justifyContent: 'flex-start' }}>
//         <Link to='https://linkedtrust.us/' style={{ color: '#212529', textDecoration: 'none' }}>
//           <Typography variant='body1'>© {new Date().getFullYear()} LinkedTrust</Typography>
//         </Link>
//       </Box>
//     </Box>
//   )
// }

export default Sidebar
