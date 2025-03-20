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
        width: '400px',
        height: '40px',
        position: 'relative',
        backgroundColor: 'transparent',
        border: '1px solid #DEE2E6',
        borderRadius: '6px',
        ':hover': {
          border: '1px solid #5DAE7B'
        },
        ':focus': {
          border: '1px solid #5DAE7B'
        }
      }}
    >
      <IconButton
        type='button'
        sx={{ color: '#495057', zIndex: 1 }}
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
        placeholder='search for Claims, Credentials...'
        sx={{
          flex: 1,
          input: {
            fontSize: isSmallScreen ? '12px' : '14px',
            fontWeight: 500,
            textAlign: 'left',
            color: '#495057',
            letterSpacing: '1px'
          },
          minWidth: isSmallScreen ? '155px' : '180px',
          maxWidth: isSmallScreen ? '260px' : '360px',
          width: isSmallScreen ? '35vw' : '25vw',
          overflow: 'hidden',
          position: 'absolute',
          right: 0,
          '& .MuiInput-underline:before': {
            borderBottom: 'none'
          },
          '& .MuiInput-underline:after': {
            borderBottom: 'none'
          },
          '& .MuiInput-underline:hover:before': {
            borderBottom: 'none'
          },
          '& .MuiInput-underline.Mui-focused:after': {
            borderBottom: 'none'
          }
        }}
        className='search-txt'
      />
      <Box sx={{ position: 'absolute', right: 0, top: 0, bottom: 0, display: 'flex', alignItems: 'center' }}>
        <IconButton
          type='button'
          sx={{ color: '#495057', zIndex: 1 }}
          aria-label='search'
          onClick={handleSearch}
          className='search-btn'
        >
          <FilterAltOutlinedIcon />
        </IconButton>
      </Box>
    </Box>
  )
}

export default SearchBar
