import React, {useEffect, useState} from 'react'
import {
    Menu,
    IconButton,
    Button,
    Box,
    Fade,
    Tooltip
} from '@mui/material'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import {useNavigate} from "react-router-dom"
import PropTypes from 'prop-types'
const ProfileDropdown = ({isAuth} : any) => {
    const navigate = useNavigate();
    const handleLogout = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        navigate("/login");
    };

    const [disableTooltip, setDisableTooltip] = useState(false)
    const [open, setOpen] = useState(false)
    const [anchorEl, setAnchorEl] = React.useState(null)
    const openMenu = Boolean(anchorEl)
    useEffect(() => {
        setDisableTooltip(openMenu)
    }, [openMenu, setDisableTooltip])
    const handleClick = event => {
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
        <Box id="menu">
            <Tooltip title={
                    <h2>menu</h2>
                }
                disableFocusListener
                disableHoverListener={disableTooltip}
                disableTouchListener
                placement="bottom-start"
                open={open}
                onClose={
                    () => {
                        setOpen(false)
                    }
                }
                onOpen={
                    () => {
                        setOpen(true)
                    }
                }
                arrow>
                <IconButton sx={
                        {
                            height: '100%',
                            alignSelf: 'center',
                            '&:hover': {
                                backgroundColor: '3e2d5d'
                            }
                        }
                    }
                    aria-controls={
                        open ? 'profile menu' : undefined
                    }
                    aria-haspopup="true"
                    onClick={handleClick}
                    size="large">
                    <AccountCircleIcon fontSize="large"
                        sx={
                            {color: '#2f0101'}
                        }/>
                </IconButton>
            </Tooltip>

            <Menu anchorEl={anchorEl}
                open={openMenu}
                onClose={handleClose}
                TransitionComponent={Fade}>
                <Box sx={
                    {textAlign: 'center'}
                }>
                     <Button  sx={
                            {
                                width: '85%',
                                marginBottom: '1em',
                                color: '#2f0101',
                                backgroundColor: 'FAFAFA',
                                boxShadow: 'none',
                                border: 'none'
                            }
                    } onClick={() => navigate("/search")}>
                  Search
                </Button>
                    <Button disableRipple={true}
                        color="inherit"
                        onClick={
                            () => navigate("/")
                        }
                        sx={
                            {
                                width: '85%',
                                marginBottom: '1em',
                                color: '#2f0101',
                                backgroundColor: 'FAFAFA',
                                boxShadow: 'none',
                                border: 'none'
                            }
                    }>
                        Create Claim
                    </Button>

                    <Button onClick={handleLogout}
                        disableRipple={true}
                        color="error"
                        size="large">
                        Logout
                    </Button>
                </Box>
            </Menu>
        </Box>

    )

}


export default ProfileDropdown;
