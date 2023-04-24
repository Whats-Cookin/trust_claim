import { useNavigate } from 'react-router-dom'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import ProfileDropdown from '../profileDropDown/index'

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
                  <Button color='inherit' onClick={() => navigate('/search')}>
                    {' '}
                    Search{' '}
                  </Button>
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
