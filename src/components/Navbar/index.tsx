import { useLocation, useNavigate } from 'react-router-dom'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import ProfileDropdown from '../profileDropDown/index'
import { useMediaQuery } from '@mui/material'
import { useState, useRef } from 'react'
import Responsive from './NotAuthDropdown'
import SearchBar from '../SearchBar'
import { useTheme } from '@mui/material'

const Navbar = ({ isAuth }: any) => {
  const navigate = useNavigate()
  const search = useLocation().search
  const ref = useRef<any>(null)
  const query = new URLSearchParams(search).get('query')
  const [searchVal, setSearchVal] = useState<string>(query || '')
  const page = useRef(1)
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
      <Box>
        <AppBar position='fixed' sx={{ backgroundColor: '#eeeeee', color: '#280606' }}>
          <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography
              variant='h5'
              component='div'
              onClick={() => navigate('/search')}
              sx={{
                color: 'primary.main',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Trust Claims
            </Typography>
            {isAuth && (
              <>
                {!isSmallScreen && <SearchBar />}
                <ProfileDropdown />
              </>
            )}

            {!isAuth && (
              <>
                {isSmallScreen && <Responsive />}
                {!isSmallScreen && (
                  <>
                    <SearchBar />
                    <Box>
                      <Button
                        sx={{ pr: '30px', color: 'primary.main', fontWeight: 'bold' }}
                        onClick={() => navigate('/login')}
                      >
                        Login
                      </Button>
                      <Button
                        sx={{ pr: '30px', color: 'primary.main', fontWeight: 'bold' }}
                        onClick={() => navigate('/register')}
                      >
                        Register
                      </Button>
                    </Box>
                  </>
                )}
              </>
            )}
          </Toolbar>
          {isSmallScreen && (
            <Toolbar sx={{ display: 'flex', justifyContent: 'center' }}>
              <SearchBar />
            </Toolbar>
          )}
        </AppBar>
      </Box>
    </>
  )
}

export default Navbar
