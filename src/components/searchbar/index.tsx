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
  const query = new URLSearchParams(search).get('query')
  const [searchVal, setSearchVal] = useState<string>(query ?? '')
  const [isExpanded, setIsExpanded] = useState(false)
  const searchRef = useRef<HTMLDivElement | null>(null)

  const isSmallScreen = useMediaQuery('(max-width: 900px)')

  useEffect(() => {
    if (location.pathname === '/feed') {
      navigate({
        pathname: '/feed',
        search: `?query=${searchVal}`
      })
    }
  }, [searchVal, navigate, location.pathname])

  const handleSearch = () => {
    if (isExpanded) {
      window.localStorage.removeItem('claims')
      if (searchVal.trim() !== '') {
        navigate({
          pathname: '/search',
          search: `?query=${searchVal}`
        })
      }
    } else {
      setIsExpanded(true)
    }
  }

  const handleSearchKeypress = (event: any) => {
    if (event.key === 'Enter' && isExpanded) {
      handleSearch()
    } else if (!isExpanded) {
      setIsExpanded(true)
    }
  }

  const handleClickOutside = (event: MouseEvent) => {
    if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
      setIsExpanded(false)
    }
  }

  useEffect(() => {
    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside)
    } else {
      document.removeEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isExpanded])

  return (
    <Box
      ref={searchRef}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
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
        onChange={e => setSearchVal(e.target.value)}
        onKeyUp={handleSearchKeypress}
        onFocus={() => setIsExpanded(true)}
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
          width: isExpanded ? (isSmallScreen ? '45vw' : '23vw') : '0px',
          transition: 'width 0.4s ease',
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
