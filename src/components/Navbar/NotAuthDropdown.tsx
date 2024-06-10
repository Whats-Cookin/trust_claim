import { useNavigate } from 'react-router-dom'
import React, { useEffect, useState } from 'react'
import { Menu, IconButton, Button, Box, Fade, Tooltip, Paper } from '@mui/material'
import MenuOpenIcon from '@mui/icons-material/MenuOpen'

const Responsive = () => {
  const navigate = useNavigate()
  const [disableTooltip, setDisableTooltip] = useState(false)
  const [open, setOpen] = useState(false)
  const [anchorEl, setAnchorEl] = React.useState(null)
  const openMenu = Boolean(anchorEl)

  const handleNavigate = (path: string) => {
    setOpen(false)
    setAnchorEl(null)
    navigate(path)
  }

  useEffect(() => {
    setDisableTooltip(openMenu)
  }, [openMenu, setDisableTooltip])

  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  useEffect(() => {
    if (disableTooltip) {
      setOpen(false)
    }
  }, [disableTooltip])

  return (
    <Paper id='menu' elevation={0}>
      <Tooltip
        title={<h2>menu</h2>}
        disableFocusListener
        disableHoverListener={disableTooltip}
        disableTouchListener
        placement='bottom-start'
        open={open}
        onClose={() => {
          setOpen(false)
        }}
        onOpen={() => {
          setOpen(true)
        }}
        arrow
      >
        <IconButton
          sx={{
            height: '100%',
            alignSelf: 'center',
            '&:hover': {
              backgroundColor: '3e2d5d'
            }
          }}
          aria-controls={open ? 'profile menu' : undefined}
          aria-haspopup='true'
          onClick={handleClick}
          size='large'
        >
          <MenuOpenIcon fontSize='large' sx={{ color: 'primary.main' }} />
        </IconButton>
      </Tooltip>

      <Menu anchorEl={anchorEl} open={openMenu} onClose={handleClose} TransitionComponent={Fade}>
        <Box sx={{ textAlign: 'center', width: '300px' }}>
          <Button
            sx={{
              width: '85%',
              marginBottom: '1em',
              color: 'primary.main',
              backgroundColor: 'FAFAFA',
              boxShadow: 'none',
              border: 'none'
            }}
            onClick={() => handleNavigate('/login')}
          >
            login
          </Button>
          <Button
            disableRipple={true}
            color='inherit'
            onClick={() => handleNavigate('register')}
            sx={{
              width: '85%',
              marginBottom: '1em',
              color: 'primary.main',
              backgroundColor: 'FAFAFA',
              boxShadow: 'none',
              border: 'none'
            }}
          >
            register
          </Button>
        </Box>
      </Menu>
    </Paper>
  )
}

export default Responsive
