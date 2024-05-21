import React from 'react'
import { Box, Typography } from '@mui/material'
import { PrivacyTipOutlined } from '@mui/icons-material'

const Privacy: React.FC = () => {
  return (
    <Box sx={{ padding: '2rem', color: 'white' }}>
      <PrivacyTipOutlined sx={{ fontSize: '2rem' }} />
      <Typography variant='h4'>Privacy Policy</Typography>
      <Typography variant='body1'>Privacy Policy content</Typography>
    </Box>
  )
}

export default Privacy
