import React from 'react'
import Box from '@mui/material/Box'
import Footer from '../Footer'

const RightSideComponent: React.FC = () => {
  return (
    <Box
      sx={{
        width: '30%',
        height: 'calc(100vh - 64px)',
        position: 'fixed',
        right: 0,
        top: '64px',
        backgroundColor: '#0A1C1D',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
      }}
    >
      <Footer />
    </Box>
  )
}

export default RightSideComponent
