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
import DriveIcon from '@mui/icons-material/DriveFileRenameOutline'
import EmailIcon from '@mui/icons-material/Email'
import XIcon from '@mui/icons-material/X'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import CloseIcon from '@mui/icons-material/Close'
import ScreenShareOutlinedIcon from '@mui/icons-material/ScreenShareOutlined'

function ShareButton() {
  const theme = useTheme()
  const isMediumScreen = useMediaQuery(theme.breakpoints.down('md'))
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  // Example form data for certification
  const formData = {
    credentialName: 'Frontend Developer Certificate'
  }

  // Example URL for certification
  const link = 'https://example.com/certification-link'

  const generateLinkedInUrl = () => {
    const baseLinkedInUrl = 'https://www.linkedin.com/profile/add'
    const params = new URLSearchParams({
      startTask: 'CERTIFICATION_NAME',
      name: formData?.credentialName ?? 'Certification Name',
      organizationName: 'LinkedTrust', // Updated to use organization name
      issueYear: '2024',
      issueMonth: '8',
      expirationYear: '2025',
      expirationMonth: '8',
      certUrl: link
    })
    return `${baseLinkedInUrl}?${params.toString()}`
  }

  const handleAddCertificationToLinkedIn = () => {
    const linkedInCertificationUrl = generateLinkedInUrl()
    window.open(linkedInCertificationUrl, '_blank')
  }
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const open = Boolean(anchorEl)
  const id = open ? 'share-popover' : undefined

  // Get the current page URL
  const currentUrl = window.location.href

  // Handlers for each platform share
  const handleLinkedInPost = () => {
    const linkedInShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`
    window.open(linkedInShareUrl, '_blank')
  }

  const handleTwitterPost = () => {
    const twitterShareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}`
    window.open(twitterShareUrl, '_blank')
  }

  const handleEmailShare = () => {
    const mailtoUrl = `mailto:?subject=Check out this page&body=Here is the link: ${currentUrl}`
    window.open(mailtoUrl, '_blank') // Mailto opens in the same window
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl)
    alert('Link copied to clipboard!')
  }

  return (
    <div>
      <div>
        <Button
          startIcon={<ScreenShareOutlinedIcon />}
          onClick={handleClick}
          variant='contained'
          sx={{
            fontSize: isMediumScreen ? '8px' : '12px',
            borderRadius: '24px',
            width: isMediumScreen ? '100px' : '140px',
            height: '48px',
            backgroundColor: 'rgba(0, 150, 136, 1)',
            color: 'white',
            fontFamily: 'Montserrat',
            '&:hover': {
              backgroundColor: 'rgba(0, 150, 136, 1)'
            },
            textTransform: 'none'
          }}
        >
          Share
        </Button>

        <Popover
          id={id}
          open={open}
          onClose={handleClose}
          anchorReference='anchorPosition'
          anchorPosition={{ top: 600, left: 750 }}
          anchorOrigin={{
            vertical: 'center',
            horizontal: 'center'
          }}
          transformOrigin={{
            vertical: 'center',
            horizontal: 'center'
          }}
          PaperProps={{
            sx: {
              width: isMediumScreen ? '358px' : '500px',
              height: isMediumScreen ? '370px' : '366px',
              padding: '20px',
              backgroundColor: '#172D2D',
              borderRadius: '12px',
              position: 'fixed',
              top: '50%',
              left: '50%',
              backgroundImage: 'none' // Remove background image
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
              border: '1px solid #223B3A',
              width: '500px',
              height: '0px',
              borderWidth: '1px 0px 0px 0px'
            }}
          />
          {/* Icons with Labels */}
          <Box
            display='flex'
            justifyContent='space-between'
            height='150px'
            alignItems='center'
            mb={2}
            margin='auto'
            sx={{
              width: isMediumScreen ? 'none' : '400px'
            }}
          >
            {/* LinkedIn Icon */}
            <Box display='flex' flexDirection='column' alignItems='center' justifyContent='center'>
              <IconButton
                onClick={handleLinkedInPost} // Click to share on LinkedIn
                sx={{
                  borderRadius: '50%',
                  backgroundColor: 'white',
                  width: '50px',
                  height: '50px',
                  '&:hover': { backgroundColor: '#f0f0f0' }
                }}
              >
                <LinkedInIcon sx={{ fontSize: 40, color: '#0077B5' }} />
              </IconButton>
              <Typography variant='caption' sx={{ color: 'white', mt: 1 }}>
                Post
              </Typography>
            </Box>
            <Box display='flex' flexDirection='column' alignItems='center' justifyContent='center'>
              <IconButton
                onClick={handleAddCertificationToLinkedIn} // Click to share on LinkedIn
                sx={{
                  borderRadius: '50%',
                  backgroundColor: 'white',
                  width: '50px',
                  height: '50px',
                  '&:hover': { backgroundColor: '#f0f0f0' }
                }}
              >
                <LinkedInIcon sx={{ fontSize: 40, color: '#0077B5' }} />
              </IconButton>
              <Typography variant='caption' sx={{ color: 'white', mt: 1 }}>
                Your LinkedIn
              </Typography>
            </Box>

            {/* Twitter Icon */}
            <Box display='flex' flexDirection='column' alignItems='center' justifyContent='center'>
              <IconButton
                onClick={handleTwitterPost} // Click to tweet the link
                sx={{
                  borderRadius: '50%',
                  backgroundColor: 'white',
                  width: '50px',
                  height: '50px',
                  '&:hover': { backgroundColor: '#f0f0f0' }
                }}
              >
                <XIcon sx={{ fontSize: 40, color: '#1DA1F2' }} />
              </IconButton>
              <Typography variant='caption' sx={{ color: 'white', mt: 1 }}>
                x
              </Typography>
            </Box>

            {/* Gmail Icon */}
            <Box display='flex' flexDirection='column' alignItems='center' justifyContent='center'>
              <IconButton
                onClick={handleEmailShare} // Click to share via email
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
                Email
              </Typography>
            </Box>
          </Box>

          <Box
            sx={{
              border: '1px solid #223B3A',
              width: '500px',
              height: '0px',
              borderWidth: '1px 0px 0px 0px',
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
          <Box mt={2} display='flex' justifyContent='center' alignItems='center' flexDirection='column'>
            <Box display='flex' justifyContent='center' alignItems='center'>
              <TextField
                value={currentUrl}
                variant='outlined'
                InputProps={{
                  readOnly: true,
                  sx: {
                    color: 'white',
                    width: isMediumScreen ? '318px' : '460px',
                    backgroundColor: '#2f4f4f',
                    borderRadius: '5px'
                  },
                  endAdornment: (
                    <InputAdornment position='end'>
                      <IconButton onClick={handleCopyLink}>
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
