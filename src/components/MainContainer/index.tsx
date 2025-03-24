import React from 'react'
import { Box, BoxProps, useTheme, useMediaQuery } from '@mui/material'

interface Props {
  children: React.ReactNode
  flexRowOnDesktop?: boolean
  sx?: BoxProps['sx']
}

const MainContainer: React.FC<Props> = ({ children, flexRowOnDesktop, sx }) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: flexRowOnDesktop && !isMobile ? 'row' : 'column',
        justifyContent: flexRowOnDesktop && !isMobile ? 'flex-end' : 'center',
        height: 'auto',

        mt: '64px',
        mb: isMobile ? '77px' : '28px',

        paddingTop: isMobile ? '0px' : '41px',
        paddingBottom: isMobile ? '0px' : '0px',
        paddingLeft: isMobile ? '16px' : '30px',
        paddingRight: isMobile ? '16px' : '30px',

        width: '95%',
        backgroundColor: '#FFFFFF',
        borderRadius: '20px',
        padding: '20px',
        ...(sx ?? {})
      }}
    >
      {children}
    </Box>
  )
}

export default MainContainer
