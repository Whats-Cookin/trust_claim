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
        mt: '56px',
        mb: isMobile ? '77px' : '28px',
        ml: '4.2vw',

        mr: {
          xs: 'auto',
          md: 'auto',
          lg: 'auto'
        },
        paddingTop: isMobile ? '0px' : '30px',
        paddingBottom: 0,
        paddingLeft: isMobile ? '16px' : '30px',
        paddingRight: isMobile ? '16px' : '30px',
        width: {
          xs: '97%',
          md: 'calc(100% - 4.2vw)',
          lg: 'calc(100% - 4.2vw )'
        },
        backgroundColor: '#F8F9FA',
        borderRadius: '8px',
        // padding: '20px',
        ...(sx ?? {})
      }}
    >
      {children}
    </Box>
  )
}

export default MainContainer
