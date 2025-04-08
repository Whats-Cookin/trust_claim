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
  Snackbar
} from '@mui/material'
import ShareIcon from '@mui/icons-material/Share'
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined'
import SystemUpdateAltIcon from '@mui/icons-material/SystemUpdateAlt'
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
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

// Update the SmallerMediaContainer to center on smaller devices
const SmallerMediaContainer = styled(Box)(({ theme }) => ({
  width: '350px',
  minWidth: '350px',
  borderRadius: '12px',
  overflow: 'hidden',
  alignSelf: 'flex-start',
  [theme.breakpoints.down('md')]: {
    margin: '0 auto',
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
  const claim = data.claim.claim
  const isStatementLong = claim.statement && claim.statement.length > 200

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
          {/* Title and Actions Row */}
          <Stack
            direction={{ xs: 'column', md: 'column', lg: 'row' }}
            spacing={2}
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            justifyContent='space-between'
          >
            <Stack direction='row' spacing={2} alignItems='center' sx={{ flexWrap: 'wrap', overflow: 'hidden' }}>
              <Typography variant='h6' color='white' sx={{ minWidth: 0, textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {data.edge.startNode.name}
              </Typography>
            </Stack>

            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={{ xs: 2, sm: 2 }}
              sx={{
                width: '100%',
                alignItems: { xs: 'center', sm: 'flex-start' },
                justifyContent: { xs: 'center', sm: 'flex-end', md: 'center' }
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
                  fontSize: 'clamp(0.875rem, 2.5vw, 1.1rem)',
                  px: { xs: '1rem', sm: '2rem' },
                  width: { xs: '100%', sm: 'auto' },
                  minWidth: { xs: 'auto', sm: '150px' },
                  height: '48px',
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
                  fontSize: 'clamp(0.875rem, 2.5vw, 1.1rem)',
                  px: { xs: '1rem', sm: '2rem' },
                  width: { xs: '100%', sm: 'auto' },
                  minWidth: { xs: 'auto', sm: '120px' },
                  height: '48px'
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
                  fontSize: 'clamp(0.875rem, 2.5vw, 1.1rem)',
                  px: { xs: '1rem', sm: '2rem' },
                  width: { xs: '100%', sm: 'auto' },
                  minWidth: { xs: 'auto', sm: '120px' },
                  height: '48px'
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
                  fontSize: 'clamp(0.875rem, 2.5vw, 1.1rem)',
                  px: { xs: '1rem', sm: '2rem' },
                  width: { xs: '100%', sm: 'auto' },
                  minWidth: { xs: 'auto', sm: '120px' },
                  height: '48px'
                }}
              >
                Export
              </Button>
            </Stack>
          </Stack>

          {/* Modified Layout - Image on left, all content on right */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              gap: 3,
              alignItems: { xs: 'center', md: 'flex-start' } // Center items on xs, align to start on md+
            }}
          >
            {/* Left side - Image */}
            {data.claim.image && <SmallerMediaContent url={data.claim.image} />}

            {/* Right side - All content */}
            <Box
              sx={{
                flex: 1,
                width: { xs: '100%', md: 'auto' } // Full width on small screens
              }}
            >
              {/* Statement */}
              {claim.statement && (
                <Box sx={{ mb: 3 }}>
                  <Typography color='white'>
                    {isExpanded || !isStatementLong ? claim.statement : truncateText(claim.statement, 200)}
                    {isStatementLong && (
                      <MuiLink
                        onClick={handleToggleExpand}
                        sx={{ cursor: 'pointer', marginLeft: '5px', color: theme.palette.link, textDecoration: 'none' }}
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
                    sx={{ color: theme.palette.link, justifyContent: 'flex-start', width: 'fit-content' }}
                    target='_blank'
                    href={claim.subject}
                  >
                    {claim.subject}
                  </MuiLink>
                  <MuiLink
                    sx={{ color: theme.palette.link, justifyContent: 'flex-start', width: 'fit-content' }}
                    target='_blank'
                    href={claim.sourceURI}
                  >
                    {claim.sourceURI}
                  </MuiLink>
                </Stack>
              </Box>

              {/* Recommendations */}
              <Box>
                <Typography color='white'>{data.validations.length} Recommendations</Typography>
              </Box>
            </Box>
          </Box>

          {/* Show full-width image if there's no statement - fallback for edge cases */}
          {data.claim.image && !claim.statement && !data.validations.length && <MediaContent url={data.claim.image} />}
        </Stack>
      </CardContent>
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
