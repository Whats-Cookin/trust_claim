import { useLocation, useNavigate } from 'react-router-dom'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import ProfileDropdown from '../profileDropDown/index'
import { IconButton, InputBase, Paper, TextField } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import { useState, useRef, useMemo, useEffect } from 'react'
import Search from '../../containers/Search'

const Navbar = ({ isAuth }: any) => {
  const navigate = useNavigate()
  const search = useLocation().search
  const ref = useRef<any>(null)
  const query = new URLSearchParams(search).get('query')
  const [searchVal, setSearchVal] = useState<string>(query || '')
  const page = useRef(1)

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
      <Box
        sx={{
          flexGrow: 1,
          width: '100%',
          overflow: 'hidden'
        }}
      >
        <AppBar
          position='fixed'
          sx={{
            backgroundColor: '#eeeeee',
            color: '#280606',
            top: 0,
            width: '100%'
          }}
        >
          <Toolbar>
            <Typography
              variant='h5'
              component='div'
              sx={{
                flexGrow: 1,
                fontWeight: 'bold'
              }}
            >
              Trust Claims
            </Typography>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                columnGap: 3
              }}
            >
              {isAuth ? (
                <>
                  <ProfileDropdown />
                </>
              ) : (
                <>
                  <Paper
                    component='div'
                    sx={{
                      p: '2px 4px',
                      display: 'flex',
                      alignItems: 'center',
                      width: 400
                    }}
                  >
                    <InputBase
                      type='search'
                      value={searchVal}
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

                  <Button color='inherit' onClick={() => navigate('/login')}>
                    Login
                  </Button>
                  <Button color='inherit' onClick={() => navigate('/register')}>
                    Register
                  </Button>
                </>
              )}{' '}
            </Box>
          </Toolbar>
        </AppBar>
      </Box>
    </>
  )
}

export default Navbar
