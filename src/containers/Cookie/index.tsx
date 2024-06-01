import React from 'react'
import { Box, Typography } from '@mui/material'
import { CookieOutlined } from '@mui/icons-material'
import { useTheme } from '@mui/material/styles'

const Cookie: React.FC = () => {
  const theme = useTheme()
  return (
    <Box sx={{ padding: '2rem', color: theme.palette.maintext }}>
      <CookieOutlined sx={{ fontSize: '2rem' }} />
      <Typography variant='h4'>Cookie Policy</Typography>
      <Typography variant='body1'>Cookie Policy content</Typography>
    </Box>
  )
}

export default Cookie
