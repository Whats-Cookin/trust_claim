import React from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { Link } from 'react-router-dom'

const FeedFooter: React.FC = () => {
  return (
    <Box
      sx={{
        width: '23vw',
        position: 'fixed',
        right: 0,
        bottom: 0,
        backgroundColor: '#0A1C1D00',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '1rem 0',
        zIndex: 1000
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column-reverse',
          alignItems: 'center',
          width: '90%',
          maxWidth: '23vw',
          color: '#ffffff',
          textAlign: 'center'
        }}
      >
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
        <Typography sx={{ marginTop: '0.5rem' }}>© {new Date().getFullYear()} LinkedTrust</Typography>
      </Box>
    </Box>
  )
}

export default FeedFooter
