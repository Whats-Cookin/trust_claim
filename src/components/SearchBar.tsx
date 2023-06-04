import { Paper } from '@mui/material'
import { InputBase } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import { IconButton } from '@mui/material'
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useMediaQuery } from '@mui/material'
import { useTheme } from '@mui/material'

const SearchBar = () => {
  const navigate = useNavigate()
  const search = useLocation().search
  const query = new URLSearchParams(search).get('query')
  const [searchVal, setSearchVal] = useState<string>(query || '')
  const theme = useTheme()

  const handleSearch = async () => {
    window.localStorage.removeItem('claims')
    if (searchVal.trim() !== '') {
      navigate({
        pathname: '/search',
        search: `?query=${searchVal}`
      })
    }
  }

  const handleSearchKeypress = async (event: any) => {
    if (event.key === 'Enter') {
      handleSearch()
    }
  }
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'))

  return (
    <>
      {' '}
      <Paper
        component='div'
        sx={{
          display: 'flex',
          zIndex: 1,
          m: isSmallScreen ? '80px auto 80px' : '0',
          p: '0 4px',
          alignItems: 'center',
          width: '100%',
          maxWidth: '395px',
          border: `1px solid ${theme.palette.primary.main}`,
          borderRadius: '50px'
        }}
      >
        <InputBase
          type='search'
          value={searchVal}
          placeholder='Search a Claim'
          onChange={e => setSearchVal(e.target.value)}
          onKeyUp={handleSearchKeypress}
          sx={{
            ml: 1,
            flex: 1
          }}
        />
        <IconButton type='button' sx={{ p: '10px' }} aria-label='search' onClick={handleSearch}>
          <SearchIcon />
        </IconButton>
      </Paper>
    </>
  )
}

export default SearchBar
