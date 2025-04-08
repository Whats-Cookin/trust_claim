// ClaimDetails.tsx - Last updated: April 8, 2025 - CACHE_BUSTER_20250408_V2
import {
  Box,
  Typography,
  Button,
  Stack,
  styled,
  Card,
  CardContent,
  Theme,
  Link as MuiLink,
  Popover,
  TextField,
  InputAdornment,
  IconButton,
  Snackbar,
  Dialog,
  DialogContent,
  Chip
} from '@mui/material'
import ShareIcon from '@mui/icons-material/Share'
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined'
import SystemUpdateAltIcon from '@mui/icons-material/SystemUpdateAlt'
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import { Close as CloseIcon } from '@mui/icons-material'
import { Link } from 'react-router-dom'
import { BACKEND_BASE_URL } from '../../utils/settings'
import { memo, useCallback, useEffect, useState } from 'react'

// import PermIdentityOutlinedIcon from '@mui/icons-material/PermIdentityOutlined'
// import Duration from '../../assets/duration.svg'

const TextLabel = styled(Typography)(({ theme }) => ({
  color: theme.palette.date
}))

const MediaContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
  borderRadius: '12px',
  overflow: 'hidden',
  '& img': {
    width: '100%',
    height: 'auto',
    maxHeight: '400px',
    objectFit: 'contain'
  },
  '& video': {
    width: '100%',
    maxHeight: '400px'
  }
}))

// Update the SmallerMediaContainer with a slightly larger size
const SmallerMediaContainer = styled(Box)(({ theme }) => ({
  width: '350px',
  minWidth: '350px',
  borderRadius: '12px',
  overflow: 'hidden',
  alignSelf: 'flex-start',
  marginRight: '20px',
  cursor: 'pointer',
  transition: 'transform 0.2s ease-in-out',
  '&:hover': {
    transform: 'scale(1.02)',
  },
  [theme.breakpoints.down('md')]: {
    margin: '0 auto 20px auto',
    maxWidth: '100%',
    width: '100%'
  },
  '& img': {
    width: '100%',
    height: 'auto',
    maxHeight: '350px',
    objectFit: 'cover'
  },
  '& video': {
    width: '100%',
    maxHeight: '350px'
  }
}))

// Custom styled Chip for claim type
const ClaimTypeChip = styled(Chip)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1e3a5f' : '#d1e8ff',
  color: theme.palette.mode === 'dark' ? '#90caf9' : '#0a58ca',
  border: `1px solid ${theme.palette.mode === 'dark' ? '#2c5282' : '#90caf9'}`,
  fontWeight: 600,
  fontSize: '0.85rem',
  padding: '4px 2px',
  height: '28px',
  '& .MuiChip-label': {
    padding: '0 12px',
  },
  boxShadow: theme.palette.mode === 'dark' ? '0 1px 3px rgba(0,0,0,0.5)' : '0 1px 3px rgba(0,0,0,0.1)',
}))

const isVideoUrl = (url: string): boolean => {
  try {
    const parsedUrl = new URL(url)
    const extension = parsedUrl.pathname.split('.').pop()?.toLowerCase()
    return ['mp4', 'webm', 'ogg'].includes(extension || '')
  } catch {
    return false
  }
}

const truncateText = (text: string, length: number) => {
  if (text.length <= length) return text
  return `${text.substring(0, length)}...`
}

const exportClaimData = (claimData: any) => {
  if (!claimData) {
    console.error('exportClaimData: claimData is null or undefined.')
    return
  }

  if (!claimData.id) {
    console.error('exportClaimData: claimData.id is unknown. Export is not allowed.')
    return
  }

  try {
    const jsonString = JSON.stringify(claimData, null, 2)
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = `claim_${claimData.id}.json`
    document.body.appendChild(link)
    link.click()

    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Error exporting claim data:', error)
  }
}

const ClaimDetails = memo(({ theme, data }: { theme: Theme; data: any }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [currentUrl, setCurrentUrl] = useState('')
  const [imageDialogOpen, setImageDialogOpen] = useState(false)

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

  const handleImageClick = () => {
    setImageDialogOpen(true)
  }

  const handleImageDialogClose = () => {
    setImageDialogOpen(false)
  }

  const open = Boolean(anchorEl)
  const id = open ? 'share-popover' : undefined
  const claim = data.claim.claim
  const isStatementLong = claim.statement && claim.statement.length > 5000

  return (
    <Card
      sx={{
        minHeight: '200px',
        width: '100%',
        borderRadius: '20px',
        backgroundColor: theme.palette.cardBackground,
        backgroundImage: 'none',
        color: theme.palette.texts,
        marginBottom: '2rem'
      }}
    >
      <CardContent>
        <Stack spacing={3}>
          {/* Title Row - Full Width */}
          <Box
            sx={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              mb: 2
            }}
          >
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                flexWrap: 'wrap',
                justifyContent: 'center',
                mb: 1 
              }}
            >
              <Typography 
                variant='h6' 
                color='white' 
                sx={{ 
                  textAlign: 'center',
                  marginRight: '10px'
                }}
              >
                {data.edge.startNode.name}
              </Typography>
              
              {claim.claim && (
                <ClaimTypeChip 
                  label={claim.claim}
                  size="medium"
                />
              )}
            </Box>
            
            <Box sx={{ width: '40%', height: '2px', backgroundColor: 'rgba(255,255,255,0.1)', my: 1 }} />
          </Box>

          {/* Actions Row */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={{ xs: 2, sm: 1 }}
            sx={{
              width: '100%',
              alignItems: { xs: 'center', sm: 'center' },
              justifyContent: 'center',
              mb: 3
            }}
          >
            <Button
              component={Link}
              startIcon={<CheckCircleOutlineOutlinedIcon />}
              to={`/explore/${claim.id}`}
              sx={{
                textTransform: 'none',
                color: theme.palette.buttontext,
                bgcolor: theme.palette.buttons,
                fontWeight: 500,
                borderRadius: '24px',
                fontSize: '0.9rem',
                px: { xs: '1rem', sm: '1.5rem' },
                width: { xs: '100%', sm: 'auto' },
                minWidth: { xs: 'auto', sm: '120px' },
                height: '40px',
                whiteSpace: 'nowrap'
              }}
            >
              Graph View
            </Button>

            <Button
              component={Link}
              startIcon={<CheckCircleOutlineOutlinedIcon />}
              to={`/validate?subject=${BACKEND_BASE_URL}/claims/${claim.id}`}
              sx={{
                textTransform: 'none',
                color: theme.palette.buttontext,
                bgcolor: theme.palette.buttons,
                fontWeight: 500,
                borderRadius: '24px',
                fontSize: '0.9rem',
                px: { xs: '1rem', sm: '1.5rem' },
                width: { xs: '100%', sm: 'auto' },
                minWidth: { xs: 'auto', sm: '100px' },
                height: '40px'
              }}
            >
              Validate
            </Button>

            <Button
              variant='outlined'
              startIcon={<ShareIcon />}
              onClick={handleShareClick}
              sx={{
                textTransform: 'none',
                color: theme.palette.buttontext,
                fontWeight: 500,
                borderRadius: '24px',
                fontSize: '0.9rem',
                px: { xs: '1rem', sm: '1.5rem' },
                width: { xs: '100%', sm: 'auto' },
                minWidth: { xs: 'auto', sm: '100px' },
                height: '40px'
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

            <Button
              variant='outlined'
              startIcon={<SystemUpdateAltIcon />}
              onClick={() => exportClaimData(claim)}
              sx={{
                textTransform: 'none',
                color: theme.palette.buttontext,
                fontWeight: 500,
                borderRadius: '24px',
                fontSize: '0.9rem',
                px: { xs: '1rem', sm: '1.5rem' },
                width: { xs: '100%', sm: 'auto' },
                minWidth: { xs: 'auto', sm: '100px' },
                height: '40px'
              }}
            >
              Export
            </Button>
          </Stack>


          {/* Content Row */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              gap: { xs: 2, md: 0 },
              alignItems: { xs: 'flex-start' }
            }}
          >
            {/* Left side - Image - Only shown if available */}
            {data.claim.image && (
              <SmallerMediaContainer onClick={handleImageClick}>
                {isVideoUrl(data.claim.image) ? (
                  <video controls>
                    <source src={data.claim.image} type='video/mp4' />
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <img src={data.claim.image} alt='Claim media content' loading='lazy' />
                )}
              </SmallerMediaContainer>
            )}

            {/* Right side - Content */}
            <Box sx={{ flex: 1 }}>
              {/* Statement */}
              {claim.statement && (
                <Box sx={{ mb: 3 }}>
                  <Typography 
                    color='white' 
                    component="div"
                    sx={{ width: '100%' }}
                  >
                    {(isExpanded || !isStatementLong ? claim.statement : truncateText(claim.statement, 5000))
                      .split('\n')
                      .map((paragraph: string, index: number) => (
                        <p key={index} style={{ marginBottom: '0.5rem' }}>{paragraph}</p>
                      ))
                    }
                    {isStatementLong && (
                      <MuiLink
                        onClick={handleToggleExpand}
                        sx={{ 
                          cursor: 'pointer', 
                          marginLeft: '5px', 
                          color: theme.palette.link, 
                          textDecoration: 'none',
                          fontSize: '14px',
                          padding: '2px 8px',
                          border: `1px solid ${theme.palette.link}`,
                          borderRadius: '12px',
                          display: 'inline-block'
                        }}
                      >
                        {isExpanded ? 'Show Less' : 'See More'}
                      </MuiLink>
                    )}
                  </Typography>
                </Box>
              )}

              {/* Issue Date */}
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CalendarMonthOutlinedIcon sx={{ color: theme.palette.date, mr: '10px' }} />
                  <TextLabel variant='body2' gutterBottom>
                    Issued On
                  </TextLabel>
                </Box>
                <Box>
                  <Typography variant='body1'>
                    {new Date(claim.effectiveDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </Typography>
                </Box>
              </Box>

              {/* Links */}
              <Box sx={{ mb: 3 }}>
                <Stack spacing={1}>
                  <MuiLink
                    sx={{ 
                      color: theme.palette.link, 
                      justifyContent: 'flex-start', 
                      width: 'fit-content',
                      fontSize: '14px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: '100%'
                    }}
                    target='_blank'
                    href={claim.subject}
                  >
                    {claim.subject}
                  </MuiLink>
                  <MuiLink
                    sx={{ 
                      color: theme.palette.link, 
                      justifyContent: 'flex-start', 
                      width: 'fit-content',
                      fontSize: '14px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: '100%'
                    }}
                    target='_blank'
                    href={claim.sourceURI}
                  >
                    {claim.sourceURI}
                  </MuiLink>
                </Stack>
              </Box>

              {/* Recommendations */}
              <Box>
                <Typography color='white'>{data.validations.length} Validations</Typography>
              </Box>
            </Box>
          </Box>

          {/* Show full-width image if there's no statement - fallback for edge cases */}
          {data.claim.image && !claim.statement && !data.validations.length && <MediaContent url={data.claim.image} />}

        </Stack>
      </CardContent>

      {/* Image Dialog for Full Size View */}
      <Dialog
        open={imageDialogOpen}
        onClose={handleImageDialogClose}
        maxWidth="lg"
        fullWidth
      >
        <DialogContent sx={{ position: 'relative', padding: 0, bgcolor: theme.palette.cardBackground }}>
          <IconButton
            onClick={handleImageDialogClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: 'white',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
              }
            }}
          >
            <CloseIcon />
          </IconButton>
          {data.claim.image && (
            isVideoUrl(data.claim.image) ? (
              <video controls style={{ width: '100%', maxHeight: '80vh' }}>
                <source src={data.claim.image} type='video/mp4' />
                Your browser does not support the video tag.
              </video>
            ) : (
              <img 
                src={data.claim.image} 
                alt='Claim media content' 
                style={{ 
                  width: '100%', 
                  maxHeight: '80vh',
                  objectFit: 'contain'
                }} 
              />
            )
          )}
        </DialogContent>
      </Dialog>
    </Card>
  )
})


const MediaContent = ({ url }: { url: string }) => {
  return (
    <MediaContainer>
      {isVideoUrl(url) ? (
        <video controls>
          <source
            src={url}
            // type={`video/${url.split('.').pop()}`}
            type='video/mp4'
          />
          Your browser does not support the video tag.
        </video>
      ) : (
        <img src={url} alt='Claim media content' loading='lazy' />
      )}
    </MediaContainer>
  )
}

// Add a new component for the smaller media content
const SmallerMediaContent = ({ url }: { url: string }) => {
  return (
    <SmallerMediaContainer>
      {isVideoUrl(url) ? (
        <video controls>
          <source src={url} type='video/mp4' />
          Your browser does not support the video tag.
        </video>
      ) : (
        <img src={url} alt='Claim media content' loading='lazy' />
      )}
    </SmallerMediaContainer>
  )
}

export default ClaimDetails
