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
  DialogActions
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

const CertificateContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: theme.spacing(4),
  backgroundColor: 'white',
  borderRadius: '20px',
  margin: '20px 0',
  position: 'relative',
  color: '#000',
  boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
  border: '1px solid rgba(0, 0, 0, 0.1)'
}))

const CertificateTitle = styled(Typography)(({ theme }) => ({
  fontSize: '36px',
  fontWeight: 600,
  marginBottom: theme.spacing(1),
  textAlign: 'center',
  color: '#2D6A4F'
}))

const CertificateSubtitle = styled(Typography)(({ theme }) => ({
  fontSize: '16px',
  color: '#666',
  marginBottom: theme.spacing(4),
  textAlign: 'center',
  textTransform: 'uppercase',
  letterSpacing: '2px'
}))

const RecipientName = styled(Typography)(({ theme }) => ({
  fontSize: '32px',
  fontFamily: "'Roboto', sans-serif",
  fontWeight: 500,
  marginBottom: theme.spacing(3),
  textAlign: 'center',
  color: '#2D6A4F'
}))

const SkillTitle = styled(Typography)(({ theme }) => ({
  fontSize: '20px',
  fontWeight: 500,
  marginBottom: theme.spacing(3),
  textAlign: 'center',
  color: '#333'
}))

const Description = styled(Typography)(({ theme }) => ({
  fontSize: '16px',
  color: '#666',
  marginBottom: theme.spacing(4),
  textAlign: 'center',
  maxWidth: '600px',
  lineHeight: '1.6'
}))

const EndorsementSection = styled(Box)(({ theme }) => ({
  width: '100%',
  maxWidth: '1036px',
  marginTop: theme.spacing(4),
  padding: theme.spacing(2),
  backgroundColor: 'transparent',
  position: 'relative'
}))

const EndorsementTitle = styled(Typography)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  width: '133px',
  height: '26px',
  margin: '0 auto',
  color: '#212529',
  fontFamily: 'Roboto, var(--default-font-family)',
  fontSize: '22px',
  fontWeight: 600,
  lineHeight: '25.781px',
  textAlign: 'center',
  whiteSpace: 'nowrap'
}))

const EndorsementGrid = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  width: '100%',
  gap: '20px',
  margin: '30px auto'
}))

const EndorsementCard = styled(Card)(({ theme }) => ({
  position: 'relative',
  width: '284px',
  height: '168px',
  backgroundColor: '#FFFFFF',
  boxShadow: '0px 2px 14px rgba(0, 0, 0, 0.25)',
  borderRadius: '8px',
  padding: '20px',
  border: '1px solid #dee2e6',
  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
  }
}))

const EndorsementAuthor = styled(Typography)(({ theme }) => ({
  position: 'relative',
  width: '160px',
  height: '23px',
  color: '#2D6A4F',
  fontFamily: 'Roboto',
  fontStyle: 'normal',
  fontWeight: 500,
  fontSize: '20px',
  lineHeight: '23px',
  display: 'flex',
  alignItems: 'center',
  marginBottom: '10px'
}))

const EndorsementStatement = styled(Typography)(({ theme }) => ({
  position: 'relative',
  width: '196px',
  height: '60px',
  color: '#212529',
  fontFamily: 'Montserrat',
  fontStyle: 'normal',
  fontWeight: 500,
  fontSize: '16px',
  lineHeight: '20px',
  display: 'flex',
  alignItems: 'center',
  marginBottom: '10px'
}))

const SeeAllLink = styled('button')(({ theme }) => ({
  position: 'relative',
  width: '45px',
  height: '17px',
  color: '#2D6A4F',
  fontFamily: 'Montserrat',
  fontStyle: 'normal',
  fontWeight: 500,
  fontSize: '14px',
  lineHeight: '17px',
  display: 'flex',
  alignItems: 'center',
  background: 'none',
  border: 'none',
  padding: 0,
  cursor: 'pointer',
  textDecoration: 'underline',
  '&:hover': {
    color: '#1b4332'
  }
}))

const IssuerSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '100%',
  marginTop: theme.spacing(4),
  padding: theme.spacing(2, 0),
  borderTop: '1px solid rgba(0, 0, 0, 0.1)'
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

const ActionButton = styled(Box)(({ theme }) => ({
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
})) as typeof Box

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

const ValidationDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    width: '80%',
    maxWidth: '800px',
    borderRadius: '12px',
    backgroundColor: theme.palette.background.paper
  }
}))

const ValidationDialogTitle = styled(DialogTitle)(({ theme }) => ({
  color: '#2D6A4F',
  fontSize: '24px',
  fontWeight: 600,
  textAlign: 'center',
  padding: theme.spacing(3)
}))

const ValidationDialogContent = styled(DialogContent)(({ theme }) => ({
  padding: theme.spacing(3),
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
  gap: theme.spacing(3)
}))

const ValidationDialogCard = styled(Card)(({ theme }) => ({
  width: '100%',
  height: '168px',
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  boxShadow: '0 2px 14px 0 rgba(0, 0, 0, 0.25)',
  padding: '20px',
  position: 'relative'
}))

const VideoAttestationLink = styled(Typography)(({ theme }) => ({
  position: 'absolute',
  width: '117px',
  height: '16px',
  left: '94px',
  top: '1052px',
  fontFamily: 'Roboto',
  fontStyle: 'normal',
  fontWeight: 500,
  fontSize: '14px',
  lineHeight: '16px',
  display: 'flex',
  alignItems: 'center',
  textDecorationLine: 'underline',
  color: '#2D6A4F',
  cursor: 'pointer'
}))

const VideoDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    maxWidth: '90%',
    maxHeight: '90%',
    borderRadius: '8px',
    backgroundColor: theme.palette.background.paper,
    overflow: 'hidden'
  }
}))

const VideoContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  height: '100%',
  '& video, & img': {
    width: '100%',
    height: 'auto',
    maxHeight: '80vh',
    objectFit: 'contain'
  }
}))

const ValidationDetailsDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    width: '90%',
    maxWidth: '800px',
    maxHeight: '90vh',
    borderRadius: '12px',
    backgroundColor: theme.palette.background.paper,
    overflowY: 'auto'
  }
}))

const ValidationDetailsContent = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  '& .validation-header': {
    marginBottom: theme.spacing(3)
  },
  '& .validation-subject': {
    fontSize: '20px',
    fontWeight: 500,
    color: '#2D6A4F',
    marginBottom: theme.spacing(2),
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    '& a': {
      textDecoration: 'none',
      color: 'inherit',
      '&:hover': {
        textDecoration: 'underline'
      }
    }
  },
  '& .validation-author': {
    fontSize: '24px',
    fontWeight: 500,
    color: '#2D6A4F',
    marginBottom: theme.spacing(2)
  },
  '& .validation-statement': {
    fontSize: '16px',
    color: '#212529',
    marginBottom: theme.spacing(2),
    lineHeight: 1.6
  },
  '& .validation-date': {
    fontSize: '14px',
    color: '#495057',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  '& .validation-details': {
    marginTop: theme.spacing(3),
    '& .detail-item': {
      marginBottom: theme.spacing(2),
      '& .detail-label': {
        fontWeight: 500,
        color: '#495057',
        minWidth: '150px',
        display: 'inline-block'
      },
      '& .detail-value': {
        color: '#212529'
      }
    }
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
      const pdf = new jsPDF()
      pdf.setFont('helvetica', 'bold')
      pdf.text(`Claim Data - ID: ${claimData.id}`, 10, 10)
      pdf.setFont('helvetica', 'normal')
      pdf.text(JSON.stringify(claimData, null, 2), 10, 20)
      pdf.save(`claim_${claimData.id}.pdf`)
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

  useEffect(() => {
    setCurrentUrl(window.location.href)
  }, [])

  const handleShareClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleValidate = () => {
    window.location.href = `/validate/${data.claim.claim.id}`
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

  const open = Boolean(anchorEl)
  const openEx = Boolean(anchorExportEl)
  const id = open ? 'share-popover' : undefined
  const idEx = openEx ? 'export-popover' : undefined
  const claim = data.claim.claim

  if (!claim) {
    console.error('Export failed: claimData or claimData.id is missing.')
    return
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
        marginBottom: '2rem',
        position: 'relative'
      }}
    >
      <CardContent>
        <Stack spacing={3}>
          <CertificateContainer>
            <Box
              component='img'
              src={badge}
              alt='Certificate Badge'
              sx={{
                width: '150px',
                height: '150px',
                display: 'block',
                margin: '0 auto',
                marginBottom: '30px',
                filter: 'drop-shadow(0px 4px 8px rgba(0, 0, 0, 0.1))',
                transition: 'transform 0.3s ease-in-out',
                '&:hover': {
                  transform: 'scale(1.05)'
                }
              }}
            />

            <CertificateTitle>Certificate</CertificateTitle>
            <CertificateSubtitle>OF SKILL VALIDATION</CertificateSubtitle>

            <RecipientName>{claim.curator}</RecipientName>
            <SkillTitle>{claim.subject || 'Claim Subject'}</SkillTitle>

            <Description>
              {claim.statement || 'This certificate validates the skills and expertise demonstrated by the recipient.'}
            </Description>

            {claim.image && (
              <Box sx={{ width: '100%', marginTop: '20px' }}>
                <Box
                  onClick={() => handleVideoClick(claim.image)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    '&:hover': {
                      color: '#2D6A4F'
                    }
                  }}
                >
                  {isVideoUrl(claim.image) ? (
                    <VideoLibraryIcon sx={{ fontSize: 24, color: '#2D6A4F' }} />
                  ) : (
                    <ImageIcon sx={{ fontSize: 24, color: '#2D6A4F' }} />
                  )}
                  <Typography
                    variant='body2'
                    sx={{
                      color: theme.palette.texts,
                      fontWeight: 500,
                      fontSize: '22px',
                      marginBottom: '16px',
                      paddingLeft: '10px',
                      textDecoration: 'underline',
                      cursor: 'pointer'
                    }}
                  >
                    Supported Evidence
                  </Typography>
                </Box>
              </Box>
            )}

            {data.validations && data.validations.length > 0 && (
              <EndorsementSection id="validation-section">
                <EndorsementTitle>Endorsed by:</EndorsementTitle>
                <EndorsementGrid>
                  {data.validations.slice(0, 2).map((validation: any, index: number) => (
                    <EndorsementCard 
                      key={index} 
                      id={`validation-${index}`}
                      onClick={() => handleClaimClick(validation)}
                      sx={{ cursor: 'pointer' }}
                    >
                      <EndorsementAuthor>
                        {validation.author}
                      </EndorsementAuthor>
                      <EndorsementStatement>
                        {truncateText(validation.statement || '', 50)}
                      </EndorsementStatement>
                      <SeeAllLink
                        onClick={(e) => {
                          e.stopPropagation();
                          handleClaimClick(validation);
                        }}
                      >
                        see all
                      </SeeAllLink>
                    </EndorsementCard>
                  ))}
                </EndorsementGrid>
                {data.validations.length > 2 && (
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center',
                    mt: 2
                  }}>
                    <Button
                      onClick={handleValidationDialogOpen}
                      sx={{
                        color: '#2D6A4F',
                        textTransform: 'none',
                        fontWeight: 500,
                        '&:hover': {
                          backgroundColor: 'rgba(45, 106, 79, 0.04)'
                        }
                      }}
                    >
                      See more validations ({data.validations.length - 2} more)
                    </Button>
                  </Box>
                )}
              </EndorsementSection>
            )}

            {/* Add Validation Dialog */}
            <ValidationDialog
              open={validationDialogOpen}
              onClose={handleValidationDialogClose}
              maxWidth="md"
              fullWidth
            >
              <ValidationDialogTitle>
                All Validations
              </ValidationDialogTitle>
              <ValidationDialogContent>
                {data.validations?.map((validation: any, index: number) => (
                  <ValidationDialogCard 
                    key={index}
                    onClick={() => handleClaimClick(validation)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <EndorsementAuthor>
                      {validation.author}
                    </EndorsementAuthor>
                    <EndorsementStatement>
                      {validation.statement || ''}
                    </EndorsementStatement>
                    <SeeAllLink
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClaimClick(validation);
                      }}
                    >
                      see all
                    </SeeAllLink>
                  </ValidationDialogCard>
                ))}
              </ValidationDialogContent>
              <DialogActions sx={{ padding: '16px 24px' }}>
                <Button
                  onClick={handleValidationDialogClose}
                  sx={{
                    color: '#2D6A4F',
                    textTransform: 'none',
                    fontWeight: 500,
                    '&:hover': {
                      backgroundColor: 'rgba(45, 106, 79, 0.04)'
                    }
                  }}
                >
                  Close
                </Button>
              </DialogActions>
            </ValidationDialog>

            {/* Replace the ValidationDetailsDialog content */}
            <ValidationDetailsDialog
              open={claimDialogOpen}
              onClose={handleClaimDialogClose}
              maxWidth={false}
            >
              <DialogContent sx={{ p: 0, position: 'relative' }}>
                <IconButton
                  onClick={handleClaimDialogClose}
                  sx={{
                    position: 'absolute',
                    right: 8,
                    top: 8,
                    color: theme.palette.texts,
                    zIndex: 1
                  }}
                >
                  <CloseIcon />
                </IconButton>
                {selectedValidation && (
                  <ValidationDetailsContent>
                    <div className="validation-header">
                      {selectedValidation.subject && (
                        <div className="validation-subject">
                          <MuiLink
                            href={selectedValidation.subject}
                            target="_blank"
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            {selectedValidation.subject}
                            <OpenInNewIcon sx={{ fontSize: 20 }} />
                          </MuiLink>
                        </div>
                      )}
                      <Typography className="validation-author">
                        {selectedValidation.author}
                      </Typography>
                      <Typography className="validation-statement">
                        {selectedValidation.statement}
                      </Typography>
                      <Box className="validation-date">
                        <CalendarMonthOutlinedIcon sx={{ fontSize: 20 }} />
                        {new Date(selectedValidation.effectiveDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </Box>
                    </div>

                    {(selectedValidation.image || selectedValidation.mediaUrl) && (
                      <Box sx={{ mt: 3 }}>
                        <Typography
                          sx={{
                            fontSize: '18px',
                            fontWeight: 500,
                            color: '#212529',
                            mb: 2
                          }}
                        >
                          Supporting Evidence
                        </Typography>
                        <MediaContainer>
                          {selectedValidation.image && <MediaContent url={selectedValidation.image} />}
                          {selectedValidation.mediaUrl && <MediaContent url={selectedValidation.mediaUrl} />}
                        </MediaContainer>
                      </Box>
                    )}

                    <div className="validation-details">
                      {Object.entries(selectedValidation).map(([key, value]: [string, any]) => {
                        // Skip certain fields we've already displayed or don't want to show
                        if (['id', 'subject', 'author', 'statement', 'effectiveDate', 'image', 'thumbnail', 'mediaUrl'].includes(key)) {
                          return null;
                        }
                        if (!value) return null;

                        return (
                          <div key={key} className="detail-item">
                            <span className="detail-label">{key}:</span>
                            <span className="detail-value">
                              {typeof value === 'string' && (value.startsWith('http://') || value.startsWith('https://')) ? (
                                <MuiLink
                                  href={value}
                                  target="_blank"
                                  sx={{
                                    color: '#2D6A4F',
                                    textDecoration: 'none',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    '&:hover': {
                                      textDecoration: 'underline'
                                    }
                                  }}
                                >
                                  {value}
                                  <OpenInNewIcon sx={{ fontSize: 16 }} />
                                </MuiLink>
                              ) : (
                                value.toString()
                              )}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </ValidationDetailsContent>
                )}
              </DialogContent>
            </ValidationDetailsDialog>

            {/* Video/Image Dialog */}
            <Dialog 
              open={videoDialogOpen} 
              onClose={handleVideoDialogClose}
              maxWidth={false}
              PaperProps={{
                sx: {
                  backgroundColor: 'transparent',
                  boxShadow: 'none',
                  overflow: 'hidden'
                }
              }}
            >
              <DialogContent sx={{ p: 0, position: 'relative' }}>
                <IconButton
                  onClick={handleVideoDialogClose}
                  sx={{
                    position: 'absolute',
                    right: 8,
                    top: 8,
                    color: 'white',
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.7)'
                    },
                    zIndex: 1
                  }}
                >
                  <CloseIcon />
                </IconButton>
                {selectedMedia && (
                  <Box sx={{ 
                    width: '100%', 
                    height: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}>
                    {isVideoUrl(selectedMedia) ? (
                      <video 
                        controls 
                        autoPlay
                        style={{
                          width: '100%',
                          maxHeight: '90vh',
                          objectFit: 'contain'
                        }}
                      >
                        <source src={selectedMedia} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    ) : (
                      <img
                        src={selectedMedia}
                        alt="Media content"
                        style={{
                          width: '100%',
                          maxHeight: '90vh',
                          objectFit: 'contain'
                        }}
                      />
                    )}
                  </Box>
                )}
              </DialogContent>
            </Dialog>

            <IssuerSection>
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column',
                gap: '8px',
                position: 'relative',
                alignItems: 'flex-start'
              }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <CalendarMonthOutlinedIcon sx={{ color: '#495057', fontSize: '20px' }} />
                  <Typography 
                    sx={{ 
                      fontFamily: 'Roboto',
                      fontStyle: 'normal',
                      fontWeight: 400,
                      fontSize: '16px',
                      lineHeight: '21px',
                      color: '#495057'
                    }}
                  >
                    {new Date(claim.effectiveDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </Typography>
                </Box>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <VerifiedOutlinedIcon sx={{ color: '#495057', fontSize: '20px' }} />
                  <MuiLink
                    component={Link}
                    to={`/claims/${claim.id}`}
                    sx={{ 
                      fontFamily: 'Roboto',
                      fontStyle: 'normal',
                      fontWeight: 400,
                      fontSize: '16px',
                      lineHeight: '21px',
                      color: '#495057',
                      textDecoration: 'underline',
                      cursor: 'pointer',
                      '&:hover': {
                        color: '#2D6A4F'
                      }
                    }}
                  >
                    ID: {claim.id}
                  </MuiLink>
                </Box>
              </Box>
            </IssuerSection>
          </CertificateContainer>

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
                startIcon={<CheckCircleOutlineOutlinedIcon sx={{ color: '#2D6A4F', fontSize: 24 }}  />}
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

            <ActionButton onClick={e => handleShareClick(e as unknown as React.MouseEvent<HTMLButtonElement>)}>
              <ShareIcon sx={{ color: '#2D6A4F', fontSize: 24 }} />
              <ButtonText>Share</ButtonText>
            </ActionButton>
          </ButtonContainer>

          
        </Stack>

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
                onClick={handleLinkedInPost}
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
                onClick={handleLinkedInCertification}
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
                Add to profile
              </Typography>
            </Box>
          </Box>
        </Popover>

        <Popover
          id={idEx}
          open={openEx}
          anchorEl={anchorExportEl}
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
            Export
          </Typography>
          <Box mt={2} display='flex' justifyContent='center' alignItems='center' flexDirection='column'>
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
                onClick={() => exportClaimData(claim, 'json')}
                sx={{
                  borderRadius: '50%',
                  backgroundColor: 'white',
                  width: '50px',
                  height: '50px',
                  '&:hover': { backgroundColor: '#f0f0f0' }
                }}
              >
                <DataObjectIcon sx={{ fontSize: 40, color: theme.palette.buttons }} />
              </IconButton>
              <Typography variant='caption' sx={{ color: 'white', mt: 1 }}>
                export as json
              </Typography>
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
                onClick={() => exportClaimData(claim, 'pdf')}
                sx={{
                  borderRadius: '50%',
                  backgroundColor: 'white',
                  width: '50px',
                  height: '50px',
                  '&:hover': { backgroundColor: '#f0f0f0' }
                }}
              >
                <PictureAsPdfIcon sx={{ fontSize: 40, color: theme.palette.buttons }} />
              </IconButton>
              <Typography variant='caption' sx={{ color: 'white', mt: 1 }}>
                export as pdf
              </Typography>
            </Box>
          </Box>
        </Popover>

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
      </CardContent>
    </Card>
  )
})

const MediaContent = ({ url }: { url: string }) => {
  const handleMediaClick = () => {
    const dialog = document.createElement('dialog')
    dialog.style.padding = '0'
    dialog.style.border = 'none'
    dialog.style.borderRadius = '8px'
    dialog.style.backgroundColor = 'transparent'
    dialog.style.maxWidth = '90vw'
    dialog.style.maxHeight = '90vh'
    dialog.style.margin = 'auto'

    const content = isVideoUrl(url) ? (
      `<video controls style="width: 100%; height: 100%; max-height: 90vh; object-fit: contain;">
        <source src="${url}" type="video/mp4">
        Your browser does not support the video tag.
      </video>`
    ) : (
      `<img src="${url}" alt="Full size media" style="width: 100%; height: 100%; max-height: 90vh; object-fit: contain;">`
    )

    dialog.innerHTML = `
      <div style="position: relative;">
        <button onclick="this.closest('dialog').close()" 
          style="position: absolute; top: 10px; right: 10px; z-index: 1000; background: rgba(0,0,0,0.5); 
          border: none; border-radius: 50%; padding: 8px; cursor: pointer;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>
        ${content}
      </div>
    `

    document.body.appendChild(dialog)
    dialog.showModal()

    dialog.addEventListener('click', (e) => {
      if (e.target === dialog) dialog.close()
    })

    dialog.addEventListener('close', () => {
      document.body.removeChild(dialog)
    })
  }

  return (
    <MediaContainer onClick={handleMediaClick}>
      {isVideoUrl(url) ? (
        <video controls>
          <source src={url} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      ) : (
        <img 
          src={url} 
          alt="Claim media content" 
          loading="lazy"
          style={{
            width: '100%',
            height: 'auto',
            maxHeight: '400px',
            objectFit: 'contain',
            cursor: 'pointer'
          }}
        />
      )}
    </MediaContainer>
  )
}

export default ClaimDetails
