import { useTheme } from '@mui/material/styles'
import React from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { Link } from 'react-router-dom'

const FeedFooter: React.FC = () => {
  const theme = useTheme()
  return (
    <Box
      sx={{
        width: '23vw',
        position: 'fixed',
        right: 0,
        bottom: 0,
        backgroundColor: theme.palette.footerBackground,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '1rem 0',
        zIndex: 1000
      }}
    >
      <Typography sx={{ color: theme.palette.maintext, marginBottom: '0.5rem' }}>
        © {new Date().getFullYear()} LinkedTrust
      </Typography>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          maxWidth: '23vw',
          textAlign: 'center'
        }}
      >
        <Typography sx={{ marginLeft: '0.5rem', marginRight: '0.5rem' }}>
          <Link to='/terms' style={{ textDecoration: 'none' }}>
            <Typography sx={{ color: theme.palette.footerText }}>Terms of Service</Typography>
          </Link>
        </Typography>
        <Typography sx={{ marginLeft: '0.5rem', marginRight: '0.5rem' }}>
          <Link to='/privacy' style={{ textDecoration: 'none' }}>
            <Typography sx={{ color: theme.palette.footerText }}>Privacy Policy</Typography>
          </Link>
        </Typography>
        <Typography sx={{ marginLeft: '0.5rem', marginRight: '0.5rem' }}>
          <Link to='/cookie' style={{ textDecoration: 'none' }}>
            <Typography sx={{ color: theme.palette.footerText }}>Cookie Policy</Typography>
          </Link>
        </Typography>
      </Box>
    </Box>
  )
}

export default FeedFooter
