import { useNavigate } from 'react-router-dom'
import { Button, Typography } from '@mui/material'
import { Box } from '@mui/system'
import { Link } from 'react-router-dom'

const Nav2 = () => {
  const navigate = useNavigate()
  const isSearch = window.location.pathname === '/search'
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '2rem',
        zIndex: 10,
        position: 'fixed',
        width: '100%'
      }}
    >
      <Typography
        onClick={() => navigate('/login')}
        variant='h5'
        component='div'
        sx={{
          cursor: 'pointer',
          textDecorationLine: 'none',
          color: 'primary.main',
          fontWeight: 'bold',
          fontSize: '30px'
        }}
      >
        Trust Claims
      </Typography>
      <Box
        sx={{
          display: 'flex',
          columnGap: 3
        }}
      >
        <Button color='inherit' onClick={() => navigate('/login')}>
          Login
        </Button>
        <Button color='inherit' onClick={() => navigate('/register')}>
          Register
        </Button>
      </Box>
    </Box>
  )
}

export default Nav2
