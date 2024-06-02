import React from 'react'
import { Box, Typography } from '@mui/material'
import { PrivacyTipOutlined } from '@mui/icons-material'
import { useTheme } from '@mui/material/styles'

const Privacy: React.FC = () => {
  const theme = useTheme()
  return (
    <Box sx={{ padding: '2rem', color: theme.palette.maintext }}>
      <PrivacyTipOutlined sx={{ fontSize: '2rem' }} />
      <Typography variant='h4'>Privacy Policy</Typography>
      <Typography variant='body1'>Privacy Policy content</Typography>
    </Box>
  )
}

export default Privacy
