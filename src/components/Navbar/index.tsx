import { useNavigate } from 'react-router-dom'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import ProfileDropdown from '../profileDropDown/index'
import Paper from '@mui/material/Paper'
import InputBase from '@mui/material/InputBase'
import IconButton from '@mui/material/IconButton'
import SearchIcon from '@mui/icons-material/Search'

const Navbar = ({ isAuth }: any) => {
  const navigate = useNavigate()

  return (
    <>
      <Box sx={{ flexGrow: 1, width: '100%', overflow: 'hidden' }}>
        <AppBar position='fixed' sx={{ backgroundColor: '#eeeeee', color: '#280606', top: 0, width: '100%' }}>
          <Toolbar>
            <Typography variant='h5' component='div' sx={{ flexGrow: 1, fontWeight: 'bold' }}>
              Trust Claims
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', columnGap: 3 }}>
              {isAuth ? (
                <>
                  <ProfileDropdown />
                </>
              ) : (
                <>
                  <Paper component='form' sx={{ p: '2px 4px', display: 'flex', alignItems: 'center', width: 400 }}>
                    <IconButton sx={{ p: '10px' }} aria-label='menu'></IconButton>
                    <InputBase
                      sx={{ ml: 1, flex: 1 }}
                      placeholder='Search Claim'
                      inputProps={{ 'aria-label': 'search claim ' }}
                    />
                    <IconButton type='button' sx={{ p: '10px' }} aria-label='search'>
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
              )}
            </Box>
          </Toolbar>
        </AppBar>
      </Box>
    </>
  )
}

export default Navbar
