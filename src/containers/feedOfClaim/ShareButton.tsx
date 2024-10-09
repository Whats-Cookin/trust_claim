import { useState } from 'react'
import {
  Button,
  Typography,
  Popover,
  IconButton,
  Box,
  TextField,
  useMediaQuery,
  useTheme,
  InputAdornment
} from '@mui/material'
import LinkedInIcon from '@mui/icons-material/LinkedIn'
import DriveIcon from '@mui/icons-material/DriveFileRenameOutline' // Placeholder for Google Drive
import EmailIcon from '@mui/icons-material/Email'
import TwitterIcon from '@mui/icons-material/Twitter'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import CloseIcon from '@mui/icons-material/Close'
import './ShareButton.css'
import ScreenShareOutlinedIcon from '@mui/icons-material/ScreenShareOutlined'

function ShareButton() {
  const theme = useTheme()
  const isMediumScreen = useMediaQuery(theme.breakpoints.down('md'))
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null) // Updated type here

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const open = Boolean(anchorEl)
  const id = open ? 'share-popover' : undefined

  return (
    <div className={open ? 'blurred' : ''}>
      {' '}
      {/* Conditionally apply blur */}
      <div>
        <Button
          startIcon={<ScreenShareOutlinedIcon />}
          onClick={handleClick}
          variant='text'
          sx={{
            fontSize: isMediumScreen ? '8px' : '12px',
            marginRight: '10px',
            p: '4px',
            color: theme.palette.sidecolor,
            '&:hover': {
              backgroundColor: theme.palette.cardsbuttons
            }
          }}
        >
          Share
        </Button>

        <Popover
          id={id}
          open={open}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center'
          }}
          sx={{
            '& .MuiPopover-paper': {
              width: '500px', // Adjusted to match the image width
              height: '366px', // Adjusted height
              padding: '20px',
              backgroundColor: '#172D2D',
              borderRadius: '12px',
              position: 'absolute',
              top: '400px',
              left: '470px'
            }
          }}
        >
          <Box display='flex' justifyContent='space-between' alignItems='center' mb={2}>
            <Typography
              variant='body1'
              sx={{
                color: 'white',
                fontWeight: 'bold',
                textAlign: 'left'
              }}
            >
              Share
            </Typography>
            <IconButton onClick={handleClose} sx={{ color: 'white' }}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Box
            sx={{
              border: '1px solid #223B3A', // The border color and thickness
              width: '500px', // Fixed width
              height: '0px', // Zero height, typically used for horizontal dividers

              borderWidth: '1px 0px 0px 0px' // Defines the top border only
            }}
          />
          {/* Icons with Labels */}

          <Box
            display='flex'
            justifyContent='space-between'
            width='400px'
            height='150px'
            alignItems='center'
            mb={2}
            margin='auto'
          >
            {/* LinkedIn Icon */}
            <Box display='flex' flexDirection='column' alignItems='center' justifyContent='center'>
              <IconButton
                href='https://www.linkedin.com'
                target='_blank'
                sx={{
                  borderRadius: '50%',
                  backgroundColor: 'white',
                  width: '50px',
                  height: '50px',
                  '&:hover': { backgroundColor: '#f0f0f0' } // Light hover effect
                }}
              >
                <LinkedInIcon sx={{ fontSize: 40, color: '#0077B5' }} />
              </IconButton>
              <Typography variant='caption' sx={{ color: 'white', mt: 1 }}>
                LinkedIn
              </Typography>
            </Box>

            {/* Google Drive Icon */}
            <Box display='flex' flexDirection='column' alignItems='center' justifyContent='center'>
              <IconButton
                href='https://drive.google.com'
                target='_blank'
                sx={{
                  borderRadius: '50%',
                  backgroundColor: 'white',
                  width: '50px',
                  height: '50px',
                  '&:hover': { backgroundColor: '#f0f0f0' }
                }}
              >
                <DriveIcon sx={{ fontSize: 40, color: '#0F9D58' }} />
              </IconButton>
              <Typography variant='caption' sx={{ color: 'white', mt: 1 }}>
                Drive
              </Typography>
            </Box>

            {/* Gmail Icon */}
            <Box display='flex' flexDirection='column' alignItems='center' justifyContent='center'>
              <IconButton
                href='mailto:someone@example.com'
                sx={{
                  borderRadius: '50%',
                  backgroundColor: 'white',
                  width: '50px',
                  height: '50px',
                  '&:hover': { backgroundColor: '#f0f0f0' }
                }}
              >
                <EmailIcon sx={{ fontSize: 40, color: '#D14836' }} />
              </IconButton>
              <Typography variant='caption' sx={{ color: 'white', mt: 1 }}>
                Gmail
              </Typography>
            </Box>

            {/* Twitter Icon */}
            <Box display='flex' flexDirection='column' alignItems='center' justifyContent='center'>
              <IconButton
                href='https://twitter.com'
                target='_blank'
                sx={{
                  borderRadius: '50%',
                  backgroundColor: 'white',
                  width: '50px',
                  height: '50px',
                  '&:hover': { backgroundColor: '#f0f0f0' }
                }}
              >
                <TwitterIcon sx={{ fontSize: 40, color: '#1DA1F2' }} />
              </IconButton>
              <Typography variant='caption' sx={{ color: 'white', mt: 1 }}>
                Twitter
              </Typography>
            </Box>
          </Box>
          <Box
            sx={{
              border: '1px solid #223B3A', // The border color and thickness
              width: '500px', // Fixed width
              height: '0px', // Zero height, typically used for horizontal dividers

              borderWidth: '1px 0px 0px 0px', // Defines the top border only
              mb: 2
            }}
          />
          <Typography
            variant='body1'
            sx={{
              color: 'white',
              fontWeight: 'bold',
              textAlign: 'left'
            }}
          >
            Copy Link
          </Typography>
          {/* Centered Copy Link Button */}
          <Box mt={2} display='flex' justifyContent='center' alignItems='center' flexDirection='column'>
            {/* Input field to display the link */}
            <Box display='flex' justifyContent='center' alignItems='center'>
              <TextField
                value={window.location.href} // The link to display
                variant='outlined'
                InputProps={{
                  readOnly: true, // Makes the field read-only so users can't edit the link
                  sx: {
                    color: 'white',
                    width: '380px',
                    backgroundColor: '#2f4f4f', // Dark background to match the style
                    borderRadius: '5px'
                  },
                  endAdornment: (
                    <InputAdornment position='end'>
                      <IconButton onClick={() => navigator.clipboard.writeText(window.location.href)}>
                        <ContentCopyIcon sx={{ color: 'white', textAlign: 'center' }} />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Box>
          </Box>
        </Popover>
      </div>
    </div>
  )
}

export default ShareButton
