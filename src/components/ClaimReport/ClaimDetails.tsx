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
import LinkedInIcon from '@mui/icons-material/LinkedIn'
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined'
import SystemUpdateAltIcon from '@mui/icons-material/SystemUpdateAlt'
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined'
import CircleIcon from '@mui/icons-material/Circle'
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

  const handleLinkedInPost = () => {
    const currentUrl = encodeURIComponent(window.location.href)
    const linkedInShareUrl = `https://www.linkedin.com/feed/?shareActive=true&shareUrl=${currentUrl}`
    window.open(linkedInShareUrl, '_blank')
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
                  <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mt: 2
                      }}
                    >
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
              {/* </Box> */}

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

          {data.claim.image && <MediaContent url={data.claim.image} />}

          {/* Info Sections */}
          <Stack spacing={3}>
            {/* <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <PermIdentityOutlinedIcon sx={{ color: theme.palette.date, mr: '10px' }} />
              <Box>
                <TextLabel variant='body2' gutterBottom>
                  Issuer
                </TextLabel>
                <Typography variant='body1'>Ahlam Sayed</Typography>
              </Box>
            </Box> */}

            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
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

            {/* <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ mr: '10px' }}>
                <img src={Duration} alt='duration icon' />
              </Box>
              <Box>
                <TextLabel variant='body2' gutterBottom>
                  Duration
                </TextLabel>
                <Typography variant='body1'>1 Year</Typography>
              </Box>
            </Box> */}
          </Stack>

          <Stack spacing={3}>
            {claim.statement && (
              <Box>
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

            {/* <Box>
              <Stack direction='row' spacing={1} alignItems='center' mb={1}>
                <CircleIcon sx={{ fontSize: '1rem', color: theme.palette.date }} />
                <Typography variant='h6' color='white'>
                  Earned through
                </Typography>
              </Stack>
              <Typography color='white'>
                I developed this skill through hands-on experience, designing solutions for real-world challenges. By
                collaborating with teams, learning from feedback, and staying curious about user needs, I've honed my
                ability to create meaningful, intuitive, and impactful designs.
              </Typography>
            </Box> */}

            <Box>
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

            <Box>
              {/* <Stack direction='row' spacing={1} alignItems='center' mb={1}>
                <CircleIcon sx={{ fontSize: '1rem', color: theme.palette.date }} />
                <Typography variant='h6' color='white'>
                  Validation Summary
                </Typography>
              </Stack> */}
              <Typography color='white'>{data.validations.length} Recommendations</Typography>
            </Box>
          </Stack>
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

export default ClaimDetails
