import React, { useState } from 'react'
import { Box, InputBase, useMediaQuery, useTheme, Paper, Typography } from '@mui/material'
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
        <Paper
          component='div'
          sx={{
            display: 'flex',
            alignItems: 'center',
            height: '45px',
            width: '100%',
            maxWidth: isMediumScreen ? '80vw' : '50%',
            borderRadius: '25px',
            backgroundColor: theme.palette.searchBarBackground,
            padding: '0 8px',
            boxShadow: theme.shadows[1]
          }}
        >
          <InputBase
            type='search'
            value={search}
            placeholder='Search claims...'
            onChange={e => setSearch(e.target.value)}
            sx={{
              ml: 1,
              flex: 1,
              color: theme.palette.searchBarText,
              fontFamily: 'Roboto'
            }}
          />
        </Paper>
      </Box>
      {filteredClaims.length > 0 ? (
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
      ) : (
        <Typography variant='h6' sx={{ textAlign: 'center', mt: '20px', color: theme.palette.texts }}>
          No results found for "{search}"
        </Typography>
      )}
    </Box>
  )
}

export default SearchFeed
