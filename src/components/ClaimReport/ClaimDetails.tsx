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
  useTheme,
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
import { useNavigate } from 'react-router-dom'
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
  const navigate = useNavigate()
  const claim = data.claim.claim
  const isStatementLong = claim?.statement && claim.statement.length > 200

  useEffect(() => {
    console.log('Full data:', data)
    console.log('Claim data:', data.claim)
    console.log('Claim:', claim)
    setCurrentUrl(window.location.href)
  }, [])

  const handleShareClick = (event: React.MouseEvent<Element>) => {
    setAnchorEl(event.currentTarget as HTMLButtonElement)
  }

  const handleExportClick = (event: React.MouseEvent<HTMLDivElement>) => {
    setAnchorExportEl(event.currentTarget as unknown as HTMLButtonElement)
  }

  const handleLinkedInCertification = () => {
    const linkedInUrl = generateLinkedInCertificationUrl(claim)
    window.open(linkedInUrl, '_blank')
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
    if (data?.claim?.claimData?.name && !data.claim.claimData.name.includes('https')) {
      credentialName = data.claim.claimData.name
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
        backgroundColor: '#FFFFFF',
        backgroundImage: 'none',
        color: theme.palette.texts,
        boxShadow: '0px 0px 10px 0px rgba(0, 0, 0, 0.2)',
        marginBottom: '2rem',
        boxSizing: 'border-box'
      }}
    >
      <CardContent sx={{ width: '100%', boxSizing: 'border-box', p: 3 }}>
        <Stack spacing={3}>
          <Box>
            <Stack direction='row' alignItems='center' spacing={1}>
              <Typography
                component='a'
                href={data.edge.startNode.nodeUri}
                target='_blank'
                rel='noopener noreferrer'
                variant='h6'
                color='black'
                sx={{
                  textDecoration: 'none',
                  minWidth: 0,
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                  fontSize: '24px',
                  fontWeight: 600,
                  fontFamily: 'Roboto',
                  display: 'inline-block'
                }}
              >
                {data.claim.claimData.name}
              </Typography>
              <OpenInNewIcon fontSize='small' />
            </Stack>
            <Typography variant='body2' sx={{ mt: 0.5 }}>
              {new Date(claim.effectiveDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </Typography>
          </Box>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            {data.claim.image && (
              <Box sx={{ minWidth: { md: 220 }, maxWidth: { md: 320 }, padding: '0' }}>
                <MediaContent url={data.claim.image} />
              </Box>
            )}
            <Stack spacing={2} flex={1}>
              {claim.statement && (
                <Typography variant='body2' color='black'>
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
              )}
              <Stack spacing={1}>
                <MuiLink
                  sx={{
                    color: theme.palette.link,
                    justifyContent: 'flex-start',
                    width: 'fit-content',
                    fontSize: '16px',
                    fontWeight: 500
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
                    fontSize: '16px',
                    fontWeight: 500
                  }}
                  target='_blank'
                  href={claim.sourceURI}
                >
                  {claim.sourceURI}
                </MuiLink>
              </Stack>
              <Typography variant='body2' color='black' sx={{ mt: 1 }}>
                {data.validations.length} Recommendations
              </Typography>
            </Stack>
          </Stack>

          <Box sx={{ width: '100%', height: '1px', backgroundColor: theme.palette.divider, my: 2 }} />

          <Box sx={{ 
            width: '100%', 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' },
            flexWrap: { xs: 'nowrap', sm: 'wrap' },
            alignItems: 'center',
            justifyContent: { xs: 'center', sm: 'space-around', md: 'center' },
            gap: { xs: '16px', sm: '40px', md: '60px', lg: '120px' },
            '& > *': {
              width: { xs: '100%', sm: 'auto' },
              maxWidth: { xs: '280px', sm: 'none' }
            }
          }}>
            <ActionButton onClick={handleExportClick} sx={{ justifyContent: 'center', width: { xs: '100%', sm: 'auto' } }}>
              <SystemUpdateAltIcon sx={{ color: '#2D6A4F', fontSize: 24, mr: '10px' }} />
              <ButtonText>Export</ButtonText>
            </ActionButton>

            <ActionButton onClick={() => navigate(`/explore/${claim.id}`)} sx={{ justifyContent: 'center', width: { xs: '100%', sm: 'auto' } }}>
              <HubOutlinedIcon sx={{ color: '#2D6A4F', fontSize: 24, mr: '10px' }} />
              <ButtonText>Graph</ButtonText>
            </ActionButton>

            <ActionButton onClick={e => handleShareClick(e)} sx={{ justifyContent: 'center', width: { xs: '100%', sm: 'auto' } }}>
              <ShareIcon sx={{ color: '#2D6A4F', fontSize: 24, mr: '10px' }} />
              <ButtonText>Share</ButtonText>
            </ActionButton>

            <ActionButton onClick={() => navigate(`/validate?subject=${BACKEND_BASE_URL}/claims/${claim.id}`)} sx={{ justifyContent: 'center', width: { xs: '100%', sm: 'auto' } }}>
              <CheckCircleOutlineOutlinedIcon sx={{ color: '#2D6A4F', fontSize: 24, mr: '10px' }} />
              <ButtonText>Validate</ButtonText>
            </ActionButton>

            <ActionButton onClick={() => navigate(`/certificate/${claim.id}`)} sx={{ justifyContent: 'center', width: { xs: '100%', sm: 'auto' } }}>
              <PictureAsPdfIcon sx={{ color: '#2D6A4F', fontSize: 24, mr: '10px' }} />
              <ButtonText>Certificate</ButtonText>
            </ActionButton>
          </Box>

          <Popover
            id={id}
            open={open}
            anchorEl={anchorEl}
            onClose={handleClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
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
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
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
