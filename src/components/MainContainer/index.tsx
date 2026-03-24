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

        paddingTop: isMobile ? '20px' : '41px',
        paddingBottom: '20px',
        paddingLeft: isMobile ? '16px' : '30px',
        paddingRight: isMobile ? '16px' : '30px',

        maxWidth: '100%',
        width: '95%',
        boxSizing: 'border-box',
        backgroundColor: theme.palette.menuBackground,
        borderRadius: '20px',
        ...(sx ?? {})
      }}
    >
      {children}
    </Box>
  )
}

export default MainContainer
