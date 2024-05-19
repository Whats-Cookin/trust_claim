import React from 'react'
import { Box, Typography, useMediaQuery, useTheme } from '@mui/material'
import { Link } from 'react-router-dom'

const Footer: React.FC = () => {
  const theme = useTheme()
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'))

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: isSmallScreen ? 'center' : 'space-between',
        padding: '1rem',
        backgroundColor: '#1a1a1a',
        color: '#ffffff',
        position: 'fixed',
        bottom: 0,
        width: '100%'
      }}
    >
      <Link to='/' style={{ color: '#ffffff', textDecoration: 'none' }}>
        <Typography>© {new Date().getFullYear()} LinkedTrust</Typography>
      </Link>
      <Box sx={{ display: 'flex', gap: '1rem' }}>
        <Typography>
          <Link to='/terms' style={{ color: '#ffffff', textDecoration: 'none' }}>
            Terms of Service
          </Link>
        </Typography>
        <Typography>
          <Link to='/privacy' style={{ color: '#ffffff', textDecoration: 'none' }}>
            Privacy Policy
          </Link>
        </Typography>
        <Typography>
          <Link to='/cookie' style={{ color: '#ffffff', textDecoration: 'none' }}>
            Cookie Policy
          </Link>
        </Typography>
      </Box>
    </Box>
  )
}

export default Footer
