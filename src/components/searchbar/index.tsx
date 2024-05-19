import { Paper, InputBase, IconButton } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

const SearchBar = () => {
  const navigate = useNavigate()
  const search = useLocation().search
  const query = new URLSearchParams(search).get('query')
  const [searchVal, setSearchVal] = useState<string>(query ?? '')

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
    <Paper
      component='div'
      sx={{
        display: 'flex',
        zIndex: 1,
        alignItems: 'center',
        height: '45px',
        width: '100%',
        maxWidth: '395px',
        borderRadius: '50px',
        backgroundColor: '#2b4745',
        padding: '0 8px',
        boxShadow: 'none'
      }}
    >
      <InputBase
        type='search'
        value={searchVal}
        placeholder='Search'
        onChange={e => setSearchVal(e.target.value)}
        onKeyUp={handleSearchKeypress}
        sx={{
          ml: 1,
          flex: 1,
          color: '#dfdfdf'
        }}
      />
      <IconButton type='button' sx={{ p: '10px', color: '#dfdfdf' }} aria-label='search' onClick={handleSearch}>
        <SearchIcon />
      </IconButton>
    </Paper>
  )
}

export default SearchBar
