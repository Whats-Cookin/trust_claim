import { useTheme } from '@mui/material/styles'
import { Box, TextField, IconButton } from '@mui/material'
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

  useEffect(() => {
    const currentQuery = new URLSearchParams(location.search).get('query') ?? ''
    setSearchVal(currentQuery)
  }, [location.search])

  const handleSearch = () => {
    // we only search in the feed, we explore the graph by clicking into it
    if (searchVal) {
      navigate({
        pathname: '/feed',
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
    <Box ref={searchRef} sx={{ display: 'flex', alignItems: 'center' }}>
      <IconButton
        type='button'
        sx={{ color: theme.palette.searchBarText }}
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
        placeholder='Search'
        inputProps={{ 'aria-label': 'search' }}
        sx={{
          width: { xs: 120, sm: 200, md: 280 },
          input: { fontSize: theme.typography.body2.fontSize, fontWeight: 500, color: theme.palette.searchBarText }
        }}
        className='search-txt'
      />
    </Box>
  )
}

export default SearchBar
