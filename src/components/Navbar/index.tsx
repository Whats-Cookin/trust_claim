import { useLocation, useNavigate } from 'react-router-dom'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import ProfileDropdown from '../profileDropDown/index'
import { IconButton, InputBase, Paper, TextField, useMediaQuery } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import MenuIcon from '@mui/icons-material/Menu'
import { useState, useRef, useMemo, useEffect } from 'react'
import Search from '../../containers/Search'
import Responsive from './Responsive'

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

  const isSmallScreen = useMediaQuery('(max-width:1099px)')
  const windowWidth = window.innerWidth
  const screenHeight = window.innerHeight
  const marginValue = Math.min(windowWidth, screenHeight) * 0.04

  return (
    <>
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position='fixed' sx={{ backgroundColor: '#eeeeee', color: '#280606' }}>
          <Toolbar>
            <Typography
              variant='h5'
              component='div'
              sx={{
                flexGrow: 1,
                fontWeight: 'bold',
                textAlign: { xs: 'left', md: 'left' }
              }}
            >
              Trust Claims
            </Typography>
            {isSmallScreen ? (
              isAuth ? (
                <ProfileDropdown />
              ) : (
                <Responsive />
              )
            ) : (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: { xs: 'center', md: 'flex-end' },
                  alignItems: 'center',
                  columnGap: 3,
                  flexGrow: { xs: 1, md: 0 }
                }}
              >
                <Paper
                  component='div'
                  sx={{
                    p: '2px 4px',
                    display: 'flex',
                    alignItems: 'center',
                    width: '430px',
                    marginRight: marginValue
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

                {isAuth && <ProfileDropdown />}
                {!isAuth && (
                  <>
                    <Button color='inherit' onClick={() => navigate('/login')}>
                      Login
                    </Button>
                    <Button color='inherit' onClick={() => navigate('/register')}>
                      Register
                    </Button>
                  </>
                )}
              </Box>
            )}
          </Toolbar>
        </AppBar>
      </Box>
    </>
  )
}

export default Navbar
