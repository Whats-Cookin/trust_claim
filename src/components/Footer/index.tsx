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
        flexDirection: 'column',
        marginLeft: '9em',
        padding: '1rem',
        color: '#ffffff',
        width: '100%',
        height: '100%',
        mt: '50em'
      }}
    >
      <Box sx={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'flex-start' }}>
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
      <Box>
        <Link to='/' style={{ color: '#ffffff', textDecoration: 'none' }}>
          <Typography>© {new Date().getFullYear()} LinkedTrust.</Typography>
        </Link>
      </Box>
    </Box>
  )
}

export default Footer
