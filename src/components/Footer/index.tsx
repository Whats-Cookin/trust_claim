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
        textAlign: 'center',
        alignItems: 'center',
        gap: '1rem',
        backgroundColor: theme.palette.footerBackground,
        color: theme.palette.footerText,
        bottom: 0,
        width: '100%'
      }}
    >
      <Link to='/' style={{ color: theme.palette.maintext, textDecoration: 'none' }}>
        <Typography>© {new Date().getFullYear()} LinkedTrust</Typography>
      </Link>
      <Box sx={{ display: 'flex', gap: '1rem' }}>
        <Typography>
          <Link to='/terms' style={{ color: theme.palette.footerText, textDecoration: 'none' }}>
            Terms of Service
          </Link>
        </Typography>
        <Typography>
          <Link to='/privacy' style={{ color: theme.palette.footerText, textDecoration: 'none' }}>
            Privacy Policy
          </Link>
        </Typography>
        <Typography>
          <Link to='/cookie' style={{ color: theme.palette.footerText, textDecoration: 'none' }}>
            Cookie Policy
          </Link>
        </Typography>
      </Box>
    </Box>
  )
}

export default Footer
