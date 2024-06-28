import { useTheme } from '@mui/material/styles'
import { Box, InputBase, IconButton, useMediaQuery } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

const SearchBar = () => {
  const theme = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const search = location.search
  const query = new URLSearchParams(search).get('query')
  const [searchVal, setSearchVal] = useState<string>(query ?? '')

  const isSmallScreen = useMediaQuery('(max-width: 600px)')
  useEffect(() => {
    if (location.pathname === '/feed') {
      navigate({
        pathname: '/feed',
        search: `?query=${searchVal}`
      })
    }
  }, [searchVal, navigate, location.pathname])

  const handleSearch = () => {
    window.localStorage.removeItem('claims')
    if (searchVal.trim() !== '') {
      navigate({
        pathname: '/search',
        search: `?query=${searchVal}`
      })
    }
  }

  const handleSearchKeypress = (event: any) => {
    if (event.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <Box
      component='div'
      sx={{
        display: 'flex',
        alignItems: 'center',
        height: '45px',
        width: '100%',
        maxWidth: isSmallScreen ? '80vw' : '23vw',
        borderBottom: `2px solid ${theme.palette.searchBarText}`,
        backgroundColor: 'transparent',
        padding: '0 8px'
      }}
    >
      <InputBase
        type='search'
        value={searchVal}
        placeholder='Type to search...'
        onChange={e => setSearchVal(e.target.value)}
        onKeyUp={handleSearchKeypress}
        sx={{
          ml: 1,
          flex: 1,
          color: theme.palette.searchBarText,
          fontSize: '17px'
        }}
      />

      <IconButton
        type='button'
        sx={{ p: '10px', color: theme.palette.searchBarText }}
        aria-label='search'
        onClick={handleSearch}
      >
        <SearchIcon />
      </IconButton>
    </Box>
  )
}

export default SearchBar
