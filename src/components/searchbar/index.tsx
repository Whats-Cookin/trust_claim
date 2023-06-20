import { Paper } from '@mui/material'
import { InputBase } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import { IconButton } from '@mui/material'
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
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

  return (
    <>
      <Paper
        component='div'
        sx={{
          display: 'flex',
          alignItems: 'center',
          m: '0',
          p: '0 4px',
          width: '100%',
          maxWidth: '395px',
          border: `1px solid ${theme.palette.primary.main}`,
          borderRadius: '50px',
          marginLeft: 'auto',
          margin: '16px',
          '@media (max-width: 768px) and (min-height: 1024px)': {
            margin: '0 auto',
            maxWidth: '395px'
          }
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
