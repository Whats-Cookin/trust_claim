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

  // One content column for every page: page-background behind, cards carry their own surface.
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: flexRowOnDesktop && !isMobile ? 'row' : 'column',
        justifyContent: flexRowOnDesktop && !isMobile ? 'flex-end' : 'center',
        width: '100%',
        maxWidth: theme.breakpoints.values.md,
        mx: 'auto',
        px: { xs: 2, md: 3 },
        py: { xs: 2, md: 3 },
        boxSizing: 'border-box',
        ...(sx ?? {})
      }}
    >
      {children}
    </Box>
  )
}

export default MainContainer
