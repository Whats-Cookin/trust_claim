import React, { useState } from 'react'
import { TextField, Box, useMediaQuery, useTheme } from '@mui/material'
import RenderClaims from './RenderClaims'
import { ImportedClaim } from './types'

const SearchFeed = ({
  claims,
  handleValidation,
  handleMenuClick,
  handleClose,
  anchorEl,
  selectedIndex,
  handleschema
}: any) => {
  const [search, setSearch] = useState('')
  const theme = useTheme()
  const isMediumScreen = useMediaQuery(theme.breakpoints.down(800))

  const filteredClaims = claims.filter((claim: ImportedClaim) =>
    Object.values(claim).some(value =>
      value && typeof value === 'string' ? value.toLowerCase().includes(search.toLowerCase()) : false
    )
  )

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          mt: '20px'
        }}
      >
        <TextField
          variant='outlined'
          placeholder='Search claims...'
          value={search}
          onChange={e => setSearch(e.target.value)}
          sx={{ width: isMediumScreen ? '100%' : '50%' }}
        />
      </Box>
      <RenderClaims
        claims={filteredClaims}
        search={search}
        handleValidation={handleValidation}
        handleMenuClick={handleMenuClick}
        handleClose={handleClose}
        anchorEl={anchorEl}
        selectedIndex={selectedIndex}
        handleschema={handleschema}
      />
    </Box>
  )
}

export default SearchFeed
