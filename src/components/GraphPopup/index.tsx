import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Stack,
  styled,
  useTheme,
  TextField,
  InputAdornment,
  IconButton,
  Popover,
  Snackbar,
  Link as MuiLink,
  Divider
} from '@mui/material'
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import { Link } from 'react-router-dom'
import { useCallback, useEffect, useState } from 'react'

const truncateText = (text: string, length: number) => {
  if (text.length <= length) return text
  return `${text.substring(0, length)}...`
}

const StyledCard = styled(Card)(({ theme }) => ({
  maxWidth: 370,
  backgroundColor: '#1C2026',
  border: '1px solid #2A4B4C',
  borderRadius: '12px',
  color: 'white',
  boxShadow: `${theme.palette.buttons} 0px 2px 4px 0px, 
              ${theme.palette.buttons} 0px 2px 16px 0px`,
  position: 'relative'
}))

const GraphPopup = () => {
  const theme = useTheme()
  const [isExpanded, setIsExpanded] = useState(false)
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [currentUrl, setCurrentUrl] = useState('')

  useEffect(() => {
    setCurrentUrl(window.location.href)
  }, [])

  const handleShareClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl)
    setSnackbarOpen(true)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleToggleExpand = useCallback(() => {
    setIsExpanded(prev => !prev)
  }, [])

  const open = Boolean(anchorEl)
  const id = open ? 'share-popover' : undefined
  const statement =
    'I developed this skill through hands-on experience and self-study. I have a strong understanding of design principles and tools.'

  const isStatementLong = statement && statement.length > 50

  return (
    <StyledCard elevation={0}>
      <CardContent>
        <Stack spacing={1}>
          {/* Header */}
          <Stack direction='row' alignItems='center' justifyContent='center' spacing={1}>
            <Typography variant='h6' component='div' sx={{ color: theme.palette.buttontext }}>
              Product Design
            </Typography>
            <CheckCircleOutlineOutlinedIcon sx={{ color: theme.palette.maintext, fontSize: 20 }} />
          </Stack>

          {/* Issuer */}
          <Typography variant='body2' sx={{ color: theme.palette.date, textAlign: 'center' }}>
            Issued by Ahlam Sayed
          </Typography>

          <Divider sx={{ color: theme.palette.date }} />

          {/* Description */}
          {statement && (
            <Box>
              <Typography color='white' sx={{ fontSize: '0.875rem !important', fontWeight: 500, display: 'inline' }}>
                {'Description: '}
              </Typography>
              <Typography
                sx={{ fontSize: '0.875rem !important', fontWeight: 400, color: theme.palette.date, display: 'inline' }}
              >
                {isExpanded || !isStatementLong ? statement : truncateText(statement, 50)}
                {isStatementLong && (
                  <MuiLink
                    onClick={handleToggleExpand}
                    sx={{ cursor: 'pointer', marginLeft: '5px', color: theme.palette.link, textDecoration: 'none' }}
                  >
                    {isExpanded ? 'Read Less' : 'Read More'}
                  </MuiLink>
                )}
              </Typography>
            </Box>
          )}

          {/* Issue Date */}
          <Box>
            <Typography sx={{ color: 'white', fontSize: '0.875rem !important', fontWeight: 500, display: 'inline' }}>
              {'Issued On: '}
            </Typography>
            <Typography
              sx={{ color: theme.palette.date, fontSize: '0.875rem !important', fontWeight: 400, display: 'inline' }}
            >
              January 25, 2025
            </Typography>
          </Box>

          {/* Action Buttons */}
          <Stack direction='row' spacing={2} sx={{ mt: 2 }}>
            <Button
              component={Link}
              to={`/report/1`}
              sx={{
                textTransform: 'none',
                color: theme.palette.buttontext,
                bgcolor: theme.palette.buttons,
                fontWeight: 500,
                borderRadius: '24px',
                fontSize: '0.875rem'
              }}
            >
              View Full Details
            </Button>
            <Box>
              <Button
                variant='outlined'
                onClick={handleShareClick}
                sx={{
                  textTransform: 'none',
                  color: theme.palette.buttontext,
                  fontWeight: 500,
                  borderRadius: '24px',
                  fontSize: '0.875rem'
                }}
              >
                Share Credential
              </Button>
              <Popover
                id={id}
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'left'
                }}
                PaperProps={{
                  sx: {
                    padding: '20px',
                    backgroundColor: theme.palette.formBackground,
                    borderRadius: '12px'
                  }
                }}
              >
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

              {/* Snackbar */}
              <Snackbar
                open={snackbarOpen}
                autoHideDuration={2000}
                onClose={() => setSnackbarOpen(false)}
                message='Link copied to clipboard!'
                sx={{
                  '& .MuiSnackbarContent-root': {
                    backgroundColor: theme.palette.cardBackground,
                    color: theme.palette.buttontext,
                    fontSize: '16px',
                    fontWeight: 'bold',
                    borderRadius: '8px'
                  }
                }}
              />
            </Box>
          </Stack>
        </Stack>
      </CardContent>
    </StyledCard>
  )
}

export default GraphPopup
