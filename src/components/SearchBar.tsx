import { Paper } from '@mui/material'
import { InputBase } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import { IconButton } from '@mui/material'
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useMediaQuery } from '@mui/material'

const SearchBar = () => {
  const navigate = useNavigate()
  const search = useLocation().search
  const query = new URLSearchParams(search).get('query')
  const [searchVal, setSearchVal] = useState<string>(query || '')

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
  const isSmallScreen = useMediaQuery('(max-width:819px)')

  return (
    <>
      {' '}
      <Paper
        component='div'
        sx={{
          display: 'flex',
          zIndex: 1,
          m: isSmallScreen ? '80px auto 80px' : '0',
          p: '2px 4px',
          alignItems: 'center',
          width: '395px'
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
        <IconButton type='button' sx={{ p: '10px', color: 'primary.main' }} aria-label='search' onClick={handleSearch}>
          <SearchIcon />
        </IconButton>
      </Paper>
    </>
  )
}

export default SearchBar
