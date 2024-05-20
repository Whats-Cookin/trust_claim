import React from 'react'
import Box from '@mui/material/Box'

const RightSideComponent: React.FC = () => {
  return (
    <Box
      sx={{
        width: '25%',
        height: 'calc(100vh - 64px)',
        position: 'fixed',
        right: 0,
        top: '64px',
        backgroundColor: '#0A1C1D'
      }}
    ></Box>
  )
}

export default RightSideComponent
