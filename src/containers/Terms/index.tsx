import React from 'react'
import { Box, Typography } from '@mui/material'
import { BookOutlined } from '@mui/icons-material'

const Terms: React.FC = () => {
  return (
    <Box sx={{ padding: '2rem', color: 'white' }}>
      <BookOutlined sx={{ fontSize: '2rem' }} />
      <Typography variant='h4'>Terms of Service</Typography>
      <Typography variant='body1'>Terms of Service content</Typography>
    </Box>
  )
}

export default Terms
