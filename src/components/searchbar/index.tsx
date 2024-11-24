import { useTheme } from '@mui/material/styles'
import { Box, TextField, IconButton, useMediaQuery } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

const SearchBar = () => {
  const theme = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const search = location.search
  const query = new URLSearchParams(search).get('query') ?? ''
  const [searchVal, setSearchVal] = useState<string>(query)
  const searchRef = useRef<HTMLDivElement | null>(null)

  const isSmallScreen = useMediaQuery('(max-width: 900px)')

  useEffect(() => {
    const currentQuery = new URLSearchParams(location.search).get('query') ?? ''
    setSearchVal(currentQuery)
  }, [location.search])

  const handleSearch = () => {
    if (searchVal) {
      navigate({
        pathname: location.pathname === '/search' ? '/search' : '/feed',
        search: `?query=${searchVal}`
      })
    }
  }

  const handleSearchKeypress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSearch()
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setSearchVal(newValue)
    if (newValue === '') {
      navigate({
        pathname: location.pathname,
        search: ''
      })
    }
  }

  return (
    <Box
      ref={searchRef}
      sx={{
        display: 'flex',
        alignItems: 'center',
        width: 'auto',
        position: 'relative',
        backgroundColor: 'transparent'
      }}
    >
      <IconButton
        type='button'
        sx={{ color: theme.palette.searchBarText, zIndex: 1 }}
        aria-label='search'
        onClick={handleSearch}
        className='search-btn'
      >
        <SearchIcon />
      </IconButton>
      <TextField
        value={searchVal}
        onChange={handleInputChange}
        onKeyUp={handleSearchKeypress}
        variant='standard'
        placeholder='Type to search...'
        InputProps={{
          sx: {
            color: 'white',
            '&::before': {
              borderBottom: `2px solid ${theme.palette.searchBarText}`
            },
            '&:hover:not(.Mui-disabled)::before': {
              borderBottom: `2px solid ${theme.palette.searchBarText}`
            },
            '&.Mui-focused::before': {
              borderBottom: `2px solid ${theme.palette.searchBarText}`
            }
          }
        }}
        sx={{
          flex: 1,
          input: {
            fontSize: isSmallScreen ? '14px' : '17px',
            fontWeight: '600',
            textAlign: 'left',
            color: theme.palette.searchBarText,
            letterSpacing: '1px'
          },
          minWidth: isSmallScreen ? '155px' : '180px',
          maxWidth: isSmallScreen ? '260px' : '360px',
          width: isSmallScreen ? '35vw' : '25vw',
          overflow: 'hidden',
          position: 'absolute',
          right: 0
        }}
        className='search-txt'
      />
    </Box>
  )
}

export default SearchBar
