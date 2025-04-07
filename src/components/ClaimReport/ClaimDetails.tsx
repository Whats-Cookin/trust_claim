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
  DialogTitle,
  DialogContent,
  DialogActions,
  ButtonBase
} from '@mui/material'
import ShareIcon from '@mui/icons-material/Share'
import LinkedInIcon from '@mui/icons-material/LinkedIn'
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined'
import SystemUpdateAltIcon from '@mui/icons-material/SystemUpdateAlt'
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined'
import DataObjectIcon from '@mui/icons-material/DataObject'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import CircleIcon from '@mui/icons-material/Circle'
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import HubOutlinedIcon from '@mui/icons-material/HubOutlined'
import CloseIcon from '@mui/icons-material/Close'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary'
import ImageIcon from '@mui/icons-material/Image'
import { Link } from 'react-router-dom'
import { BACKEND_BASE_URL } from '../../utils/settings'
import { memo, useCallback, useEffect, useState, useRef } from 'react'
import jsPDF from 'jspdf'
import badge from '../../assets/images/badge.svg'
import html2pdf from 'html2pdf.js'
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



const ButtonContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  maxWidth: '740px',
  height: '61px',
  background: '#FEFEFF',
  boxShadow: '0px 2px 14px rgba(0, 0, 0, 0.25)',
  borderRadius: '8px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0 20px',
  margin: '20px auto',
  position: 'relative'
}))

const ActionButton = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: 2,
  cursor: 'pointer',
  background: 'none',
  border: 'none',
  padding: 0,
  '&:hover': {
    opacity: 0.8
  }
}))

const ButtonText = styled(Typography)(({ theme }) => ({
  fontFamily: 'Roboto',
  fontStyle: 'normal',
  fontWeight: 500,
  fontSize: '16px',
  lineHeight: '19px',
  color: '#2D6A4F'
}))

const ButtonIcon = styled(Box)(({ theme }) => ({
  width: '24px',
  height: '24px',
  position: 'relative',
  '&::before, &::after': {
    content: '""',
    position: 'absolute',
    border: '2px solid #2D6A4F',
    width: '100%',
    height: '100%',
    top: 0,
    left: 0
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

const extractProfileName = (url: string): string => {
  try {
    const urlObj = new URL(url)
    const pathParts = urlObj.pathname.split('/')
    return pathParts[pathParts.length - 1] || url
  } catch {
    return url
  }
}

const truncateText = (text: string, length: number) => {
  if (text.length <= length) return text
  return `${text.substring(0, length)}...`
}

const generateLinkedInShareUrl = (credentialName: string, url: string) => {
  const encodedUrl = encodeURIComponent(url)
  const message = encodeURIComponent(
    `Excited to share my verified ${credentialName} credential from LinkedTrust! Check it out here: ${url} Thanks to my validators for confirming my skills!`
  )

  return `https://www.linkedin.com/feed/?shareActive=true&shareUrl=${encodedUrl}&text=${message}`
}

const generateLinkedInCertificationUrl = (claim: any) => {
  const baseLinkedInUrl = 'https://www.linkedin.com/profile/add'
  const params = new URLSearchParams({
    startTask: 'CERTIFICATION_NAME',
    name: claim?.subject ?? 'Certification Name',
    organizationName: 'LinkedTrust',
    issueYear: '2024',
    issueMonth: '8',
    expirationYear: '2025',
    expirationMonth: '8',
    certUrl: window.location.href
  })
  return `${baseLinkedInUrl}?${params}`
}

const exportClaimData = (claimData: any, format: 'json' | 'pdf') => {
  if (!claimData) {
    console.error('exportClaimData: claimData is null or undefined.')
    return
  }

  if (!claimData.id) {
    console.error('exportClaimData: claimData.id is unknown. Export is not allowed.')
    return
  }

  try {
    if (format === 'json') {
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
    } else if (format === 'pdf') {
      const element = document.getElementById('certificate-container')
      if (!element) return

      const options = {
        margin: [0, 0, 0, 0],
        filename: `claim_${claimData.id}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      }

      const metadata = {
        title: `claim_${claimData.id}.pdf`,
        creator: 'LinkedTrust',
        subject: 'Claim',
        keywords: ['Claim', 'CV', claimData.id],
        custom: { claimData: JSON.stringify(claimData) }
      }

      html2pdf().set(metadata).from(element).set(options).save()
    }
  } catch (error) {
    console.error('Error exporting claim data:', error)
  }
}

const ClaimDetails = memo(({ theme, data }: { theme: Theme; data: any }) => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)
  const [anchorExportEl, setAnchorExportEl] = useState<HTMLButtonElement | null>(null)
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [currentUrl, setCurrentUrl] = useState('')
  const [validationDialogOpen, setValidationDialogOpen] = useState(false)
  const [videoDialogOpen, setVideoDialogOpen] = useState(false)
  const [selectedMedia, setSelectedMedia] = useState('')
  const cardRef = useRef<HTMLDivElement>(null)
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null)
  const [claimDialogOpen, setClaimDialogOpen] = useState(false)
  const [selectedValidation, setSelectedValidation] = useState<any>(null)
  const [isExpanded, setIsExpanded] = useState(false)
  const claim = data.claim.claim
  const isStatementLong = claim?.statement && claim.statement.length > 200

  useEffect(() => {
    setCurrentUrl(window.location.href)
  }, [])

  const handleShareClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleExportClick = (event: React.MouseEvent<HTMLDivElement>) => {
    setAnchorExportEl(event.currentTarget as unknown as HTMLButtonElement)
  }

  const handleLinkedInCertification = () => {
    const linkedInUrl = generateLinkedInCertificationUrl(claim)
    window.open(linkedInUrl, '_blank')
  }

  const handleLinkedInPost = () => {
    let credentialName = 'a new'
    if (data?.edge?.startNode?.name && !data.edge.startNode.name.includes('https')) {
      credentialName = data.edge.startNode.name
    }

    const linkedInShareUrl = generateLinkedInShareUrl(credentialName, currentUrl)
    window.open(linkedInShareUrl, '_blank')
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl)
      setSnackbarOpen(true)
    } catch (err) {
      console.error('Failed to copy link:', err)
    }
  }

  const handleClose = () => {
    setAnchorEl(null)
    setAnchorExportEl(null)
  }

  const handleValidationDialogOpen = () => {
    setValidationDialogOpen(true)
  }

  const handleValidationDialogClose = () => {
    setValidationDialogOpen(false)
  }

  const handleVideoClick = (mediaUrl: string) => {
    setSelectedMedia(mediaUrl)
    setVideoDialogOpen(true)
  }

  const handleVideoDialogClose = () => {
    setVideoDialogOpen(false)
    setSelectedMedia('')
  }

  const handleClaimClick = (validation: any) => {
    setSelectedValidation(validation)
    setClaimDialogOpen(true)
  }

  const handleClaimDialogClose = () => {
    setClaimDialogOpen(false)
    setSelectedValidation(null)
  }

  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded)
  }

  const open = Boolean(anchorEl)
  const openEx = Boolean(anchorExportEl)
  const id = open ? 'share-popover' : undefined
  const idEx = openEx ? 'export-popover' : undefined

  if (!claim) {
    console.error('Export failed: claimData or claimData.id is missing.')
    return null
  }

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
              <Typography
                variant='h6'
                color='black'
                sx={{
                  minWidth: 0,
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                  fontSize: '24px',
                  fontWeight: 600,
                  fontFamily: 'Roboto'
                }}
              >
                {data.edge.startNode.name}
              </Typography>
            </Stack>
          </Stack>

          <Stack direction='row' spacing={1} alignItems='center'>
            <VerifiedOutlinedIcon sx={{ color: theme.palette.date, fontSize: '20px' }} />
            <Typography variant='body1' sx={{ color: theme.palette.texts, fontWeight: 500 }}>
              {claim.curator}
            </Typography>
          </Stack>

          <Typography variant='body1' sx={{ marginBottom: '10px', color: theme.palette.text1 }}>
            {`Created by: ${claim.author ? claim.author : 'Unknown'}, ${new Date(
              claim.effectiveDate
            ).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}`}
          </Typography>
          {data.claim.image && <MediaContent url={data.claim.image} />}

          {/* Info Sections */}
          <Stack spacing={3}>
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
          </Stack>

          <Stack spacing={3}>
            {claim.statement && (
              <Box>
                <Typography color='black'>
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
              <Stack direction='row' spacing={1} alignItems='center' mb={1}>
                <Typography color='black'>{data.validations.length} Recommendations</Typography>
              </Stack>
            </Box>
          </Stack>

          <ButtonContainer>
            <ActionButton onClick={handleExportClick}>
              <SystemUpdateAltIcon sx={{ color: '#2D6A4F', fontSize: 24 }} />
              <ButtonText>Export</ButtonText>
            </ActionButton>

            <Box component={Link} to={`/explore/${claim.id}`} sx={{ textDecoration: 'none' }}>
              <ActionButton>
                <HubOutlinedIcon sx={{ color: '#2D6A4F', fontSize: 24 }} />
                <ButtonText>Graph View</ButtonText>
              </ActionButton>
            </Box>

            <Button
              component={Link}
              startIcon={<CheckCircleOutlineOutlinedIcon />}
              to={`/validate?subject=${BACKEND_BASE_URL}/claims/${claim.id}`}
              sx={{
                textTransform: 'none',
                color: '#2D6A4F',
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
  component={Link}
  startIcon={<PictureAsPdfIcon />}
  to={`/certificate/${claim.id}`}
  state={{ claimData: data }} // Pass the current data object
  sx={{
    textTransform: 'none',
    color: '#2D6A4F',
    fontWeight: 500,
    borderRadius: '24px',
    fontSize: 'clamp(0.875rem, 2.5vw, 1.1rem)',
    px: { xs: '1rem', sm: '2rem' },
    width: { xs: '100%', sm: 'auto' },
    minWidth: { xs: 'auto', sm: '120px' },
    height: '48px'
  }}
>
  Certificate
</Button>

            <ActionButton onClick={(e: React.MouseEvent<HTMLDivElement>) => handleShareClick(e as any)}>
              <ShareIcon sx={{ color: '#2D6A4F', fontSize: 24 }} />
              <ButtonText>Share</ButtonText>
            </ActionButton>
          </ButtonContainer>

          <Popover
            id={id}
            open={open}
            anchorEl={anchorEl}
            onClose={handleClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right'
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right'
            }}
          >
            <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Button
                startIcon={<LinkedInIcon />}
                onClick={handleLinkedInPost}
                sx={{ color: '#2D6A4F', justifyContent: 'flex-start' }}
              >
                Share on LinkedIn
              </Button>
              <Button
                startIcon={<ContentCopyIcon />}
                onClick={handleCopyLink}
                sx={{ color: '#2D6A4F', justifyContent: 'flex-start' }}
              >
                Copy Link
              </Button>
            </Box>
          </Popover>

          <Popover
            id={idEx}
            open={openEx}
            anchorEl={anchorExportEl}
            onClose={handleClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right'
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right'
            }}
          >
            <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Button
                startIcon={<DataObjectIcon />}
                onClick={() => {
                  exportClaimData(claim, 'json')
                  handleClose()
                }}
                sx={{ color: '#2D6A4F', justifyContent: 'flex-start' }}
              >
                Export as JSON
              </Button>
              <Button
                startIcon={<PictureAsPdfIcon />}
                onClick={() => {
                  exportClaimData(claim, 'pdf')
                  handleClose()
                }}
                sx={{ color: '#2D6A4F', justifyContent: 'flex-start' }}
              >
                Export as PDF
              </Button>
            </Box>
          </Popover>

          <Snackbar
            open={snackbarOpen}
            autoHideDuration={3000}
            onClose={() => setSnackbarOpen(false)}
            message='Link copied to clipboard!'
          />
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
          <source src={url} type='video/mp4' />
          Your browser does not support the video tag.
        </video>
      ) : (
        <img src={url} alt='Claim media content' loading='lazy' />
      )}
    </MediaContainer>
  )
}

export default ClaimDetails
