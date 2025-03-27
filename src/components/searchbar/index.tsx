import { useTheme } from '@mui/material/styles'
import { Box, TextField, IconButton, useMediaQuery } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined'

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
    <Box
      ref={searchRef}
      sx={{
        display: 'flex',
        alignItems: 'center',
        width: 'clamp(155px, 25vw, 400px)',
        height: 'clamp(25px, 2.08vw, 40px)',
        backgroundColor: 'transparent',
        border: '1px solid #DEE2E6',
        borderRadius: '6px',
        p: 0,
        ':hover': {
          border: '1px solid #5DAE7B'
        },
        ':focus-within': {
          border: '1px solid #5DAE7B'
        }
      }}
    >
      <IconButton
        type='button'
        sx={{
          ml: '12px',
          p: 0,
          color: '#495057',
          borderRadius: 0
        }}
        aria-label='search'
        onClick={handleSearch}
      >
        <SearchIcon />
      </IconButton>

      <TextField
        value={searchVal}
        onChange={handleInputChange}
        onKeyUp={handleSearchKeypress}
        variant='standard'
        placeholder='search for Claims, Credentials...'
        sx={{
          flex: 1,
          ml: 1,
          input: {
            fontSize: isSmallScreen ? '11px' : '14px',
            fontWeight: 500,
            color: '#495057',
            letterSpacing: '1px',
            fontFamily: 'Roboto'
          },
          '& .MuiInputBase-input::placeholder': {
            color: '#868e96',
            opacity: 1
          },
          '& .MuiInput-underline:before': {
            borderBottom: 'none !important'
          },
          '& .MuiInput-underline:after': {
            borderBottom: 'none !important'
          },
          '& .MuiInput-underline:hover:before': {
            borderBottom: 'none !important'
          },
          '& .MuiInput-underline.Mui-focused:after': {
            borderBottom: 'none !important'
          }
        }}
      />
      <IconButton
        type='button'
        sx={{
          p: 0,
          color: '#495057',
          borderRadius: 0
        }}
        aria-label='filter'
        onClick={handleSearch}
      >
        <FilterAltOutlinedIcon />
      </IconButton>
    </Box>
  )
}

export default SearchBar
