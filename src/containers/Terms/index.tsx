import React from 'react'
import { Box, Typography } from '@mui/material'
import { BookOutlined } from '@mui/icons-material'
import { useTheme } from '@mui/material/styles'

const Terms: React.FC = () => {
  const theme = useTheme()
  return (
    <Box
      sx={{
        padding: '2rem',
        color: theme.palette.maintext,
        width: '100%',
        height: '80%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <BookOutlined sx={{ fontSize: '2rem' }} />
      <Typography variant='h4'>Terms of Service</Typography>
      <Typography variant='body1'>Terms of Service content</Typography>
    </Box>
  )
}

export default Terms
