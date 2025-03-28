import React, { useState, useRef, useEffect } from 'react'
import {
  Box,
  Typography,
  styled,
  Card,
  CardContent,
  Theme,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Stack,
  Link as MuiLink,
  Popover,
  useTheme
} from '@mui/material'
import badge from '../../assets/images/badge.svg'
import CloseIcon from '@mui/icons-material/Close'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined'
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined'
import LinkedInIcon from '@mui/icons-material/LinkedIn'
import html2pdf from 'html2pdf.js'

// Define ValidationDialog first since it's used in the component
const ValidationDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    width: '90%',
    maxWidth: '800px',
    maxHeight: '90vh',
    borderRadius: '12px',
    backgroundColor: theme.palette.background.paper,
    overflowY: 'auto'
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
  fontSize: '24px',
  fontWeight: 600,
  color: '#2D6A4F',
  marginBottom: theme.spacing(3),
  textAlign: 'center'
}))

const EndorsementGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
  gap: theme.spacing(3),
  marginTop: theme.spacing(3)
}))

const EndorsementCard = styled(Card)(({ theme }) => ({
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  boxShadow: '0 2px 14px 0 rgba(0, 0, 0, 0.25)',
  padding: theme.spacing(3),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-2px)',
    transition: 'transform 0.2s ease-in-out'
  }
}))

const EndorsementAuthor = styled(Typography)(({ theme }) => ({
  fontSize: '20px',
  fontWeight: 600,
  color: '#2D6A4F',
  marginBottom: theme.spacing(2)
}))

const EndorsementStatement = styled(Typography)(({ theme }) => ({
  fontSize: '16px',
  color: '#495057',
  marginBottom: theme.spacing(2),
  flexGrow: 1
}))

const EndorsementDate = styled(Typography)(({ theme }) => ({
  fontSize: '14px',
  color: '#6C757D',
  display: 'flex',
  alignItems: 'center',
  gap: '8px'
}))

const SeeAllLink = styled(MuiLink)(({ theme }) => ({
  color: '#2D6A4F',
  textDecoration: 'none',
  fontSize: '14px',
  fontWeight: 500,
  '&:hover': {
    textDecoration: 'underline'
  }
}))

const IssuerSection = styled(Box)(({ theme }) => ({
  width: '100%',
  marginTop: theme.spacing(4),
  padding: theme.spacing(2),
  borderTop: '1px solid rgba(0, 0, 0, 0.1)',
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2)
}))

const IssuerTitle = styled(Typography)(({ theme }) => ({
  fontSize: '18px',
  fontWeight: 600,
  color: '#2D6A4F',
  marginBottom: theme.spacing(2)
}))

const IssuerInfo = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1)
}))

const IssuerText = styled(Typography)(({ theme }) => ({
  fontSize: '14px',
  color: '#495057'
}))

const ExportButton = styled(Button)(({ theme }) => ({
  backgroundColor: '#2D6A4F',
  color: '#ffffff',
  padding: theme.spacing(1.5, 3),
  borderRadius: '8px',
  textTransform: 'none',
  fontSize: '16px',
  fontWeight: 500,
  '&:hover': {
    backgroundColor: '#1B4332'
  }
}))

const CloseButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  right: theme.spacing(2),
  top: theme.spacing(2),
  color: '#495057',
  '&:hover': {
    color: '#2D6A4F'
  }
}))

const SourceLink = styled(MuiLink)(({ theme }) => ({
  color: '#2D6A4F',
  textDecoration: 'none',
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  marginTop: theme.spacing(2),
  '&:hover': {
    textDecoration: 'underline'
  }
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

const TextLabel = styled(Typography)(({ theme }) => ({
  color: theme.palette.date
}))

interface CertificateProps {
  curator: string
  subject: string
  statement?: string
  effectiveDate?: string
  sourceURI?: string
  validations: Array<{
    author: string
    statement: string
    date?: string
    confidence?: number
    howKnown?: string
    sourceURI?: string
    image?: string
    mediaUrl?: string
  }>
  onExport?: () => void
  claimId?: string
  image?: string
}

const Certificate: React.FC<CertificateProps> = ({
  curator,
  subject,
  statement,
  effectiveDate,
  sourceURI,
  validations,
  onExport,
  claimId,
  image
}) => {
  const theme = useTheme()
  const [validationDialogOpen, setValidationDialogOpen] = useState(false)
  const [selectedValidation, setSelectedValidation] = useState<(typeof validations)[0] | null>(null)
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)
  const [currentUrl, setCurrentUrl] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)
  const isStatementLong = statement && statement.length > 200

  useEffect(() => {
    setCurrentUrl(window.location.href)
  }, [])

  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded)
  }

  const handleExport = () => {
    const element = document.getElementById('certificate-content')
    if (element && onExport) {
      const opt = {
        margin: 1,
        filename: 'certificate.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
      }
      html2pdf().set(opt).from(element).save()
      onExport()
    }
  }

  const handleLinkedInPost = () => {
    let credentialName = 'a new'
    if (subject && !subject.includes('https')) {
      credentialName = subject
    }

    const linkedInShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`
    window.open(linkedInShareUrl, '_blank')
  }

  const handleLinkedInCertification = () => {
    const baseLinkedInUrl = 'https://www.linkedin.com/profile/add'
    const params = new URLSearchParams({
      startTask: 'CERTIFICATION_NAME',
      name: subject ?? 'Certification Name',
      organizationName: 'LinkedTrust',
      issueYear: '2024',
      issueMonth: '8',
      expirationYear: '2025',
      expirationMonth: '8',
      certUrl: currentUrl
    })
    window.open(`${baseLinkedInUrl}?${params}`, '_blank')
  }

  const truncateText = (text: string, length: number) => {
    if (text.length <= length) return text
    return `${text.substring(0, length)}...`
  }

  const isVideoUrl = (url: string): boolean => {
    try {
      const parsedUrl = new URL(url)
      const extension = parsedUrl.pathname.split('.').pop()?.toLowerCase()
      return ['mp4', 'webm', 'ogg'].includes(extension || '')
    } catch {
      return false
    }
  }

  return (
    <CertificateContainer id='certificate-content'>
      <CloseButton onClick={() => window.history.back()}>
        <CloseIcon />
      </CloseButton>

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

      <RecipientName>{curator}</RecipientName>
      <SkillTitle>{subject}</SkillTitle>

      {image && (
        <MediaContainer>
          {isVideoUrl(image) ? (
            <video controls>
              <source src={image} type='video/mp4' />
              Your browser does not support the video tag.
            </video>
          ) : (
            <img src={image} alt='Claim media content' loading='lazy' />
          )}
        </MediaContainer>
      )}

      <Box sx={{ mt: 4, textAlign: 'center' }}>
        {effectiveDate && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CalendarMonthOutlinedIcon sx={{ color: theme.palette.date, mr: '10px' }} />
              <TextLabel variant='body2' gutterBottom>
                Issued On
              </TextLabel>
            </Box>
            <Typography variant='body1'>
              {new Date(effectiveDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </Typography>
          </Box>
        )}
        {sourceURI && (
          <SourceLink href={sourceURI} target='_blank' rel='noopener noreferrer'>
            <OpenInNewIcon fontSize='small' />
            View Source
          </SourceLink>
        )}
      </Box>

      {statement && (
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography color='text.primary'>
            {isExpanded || !isStatementLong ? statement : truncateText(statement, 200)}
            {isStatementLong && (
              <MuiLink
                onClick={handleToggleExpand}
                sx={{ cursor: 'pointer', marginLeft: '5px', color: theme.palette.primary.main, textDecoration: 'none' }}
              >
                {isExpanded ? 'Show Less' : 'See More'}
              </MuiLink>
            )}
          </Typography>
        </Box>
      )}

      {validations && validations.length > 0 && (
        <EndorsementSection>
          <EndorsementTitle>Endorsed by:</EndorsementTitle>
          <EndorsementGrid>
            {validations.slice(0, 2).map((validation, index) => (
              <EndorsementCard key={index} onClick={() => setSelectedValidation(validation)}>
                <EndorsementAuthor>{validation.author}</EndorsementAuthor>
                <EndorsementStatement>{truncateText(validation.statement || '', 50)}</EndorsementStatement>
                <SeeAllLink onClick={() => setSelectedValidation(validation)}>see all</SeeAllLink>
              </EndorsementCard>
            ))}
          </EndorsementGrid>
          {validations.length > 2 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Button
                onClick={() => setValidationDialogOpen(true)}
                sx={{
                  color: '#2D6A4F',
                  textTransform: 'none',
                  fontWeight: 500,
                  '&:hover': {
                    backgroundColor: 'rgba(45, 106, 79, 0.04)'
                  }
                }}
              >
                See more validations ({validations.length - 2} more)
              </Button>
            </Box>
          )}
        </EndorsementSection>
      )}

      <IssuerSection>
        <IssuerTitle>Issuer Information</IssuerTitle>
        <IssuerInfo>
          <IssuerText>Issued by: LinkedTrust</IssuerText>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <VerifiedOutlinedIcon sx={{ color: '#495057', fontSize: '20px' }} />
            <MuiLink
              component='a'
              href={`/claims/${claimId}`}
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
              ID: {claimId}
            </MuiLink>
          </Box>
        </IssuerInfo>
      </IssuerSection>

      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
        <ExportButton onClick={handleExport}>Export Certificate</ExportButton>
        <Button
          onClick={e => setAnchorEl(e.currentTarget)}
          sx={{
            backgroundColor: '#0077B5',
            color: '#ffffff',
            '&:hover': {
              backgroundColor: '#006097'
            }
          }}
        >
          Share
        </Button>
      </Box>

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
        }}
      >
        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', mt: 2 }}>
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
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', mt: 2 }}>
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

      <ValidationDialog open={validationDialogOpen} onClose={() => setValidationDialogOpen(false)}>
        <ValidationDialogTitle>All Validations</ValidationDialogTitle>
        <ValidationDialogContent>
          {validations.map((validation, index) => (
            <ValidationDialogCard key={index}>
              <Typography variant='h6' color='primary'>
                {validation.author}
              </Typography>
              <Typography variant='body1' sx={{ mt: 1 }}>
                {validation.statement}
              </Typography>
              {validation.date && (
                <Typography variant='caption' color='text.secondary' sx={{ mt: 1, display: 'block' }}>
                  {new Date(validation.date).toLocaleDateString()}
                </Typography>
              )}
            </ValidationDialogCard>
          ))}
        </ValidationDialogContent>
        <DialogActions>
          <Button onClick={() => setValidationDialogOpen(false)}>Close</Button>
        </DialogActions>
      </ValidationDialog>

      <ValidationDetailsDialog open={!!selectedValidation} onClose={() => setSelectedValidation(null)}>
        {selectedValidation && (
          <ValidationDetailsContent>
            <Box className='validation-header'>
              <Box className='validation-subject'>
                <Typography variant='h6'>Subject:</Typography>
                <Typography variant='body1'>{subject}</Typography>
              </Box>
              <Typography className='validation-author'>{selectedValidation.author}</Typography>
              <Typography className='validation-statement'>{selectedValidation.statement}</Typography>
              {selectedValidation.date && (
                <Typography className='validation-date'>
                  <CalendarMonthOutlinedIcon />
                  Validated on {new Date(selectedValidation.date).toLocaleDateString()}
                </Typography>
              )}
            </Box>

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
                <Box sx={{ width: '100%', borderRadius: '12px', overflow: 'hidden' }}>
                  {selectedValidation.image && (
                    <Box
                      component='img'
                      src={selectedValidation.image}
                      alt='Supporting Evidence'
                      sx={{
                        width: '100%',
                        height: 'auto',
                        maxHeight: '400px',
                        objectFit: 'contain'
                      }}
                    />
                  )}
                  {selectedValidation.mediaUrl && (
                    <Box
                      component='video'
                      controls
                      src={selectedValidation.mediaUrl}
                      sx={{
                        width: '100%',
                        maxHeight: '400px'
                      }}
                    />
                  )}
                </Box>
              </Box>
            )}

            <Box className='validation-details'>
              <Typography variant='h6' sx={{ mb: 2 }}>
                Validation Details
              </Typography>
              <Box className='detail-item'>
                <Typography component='span' className='detail-label'>
                  Confidence:
                </Typography>
                <Typography component='span' className='detail-value'>
                  {selectedValidation.confidence
                    ? `${(selectedValidation.confidence * 100).toFixed(0)}%`
                    : 'Not specified'}
                </Typography>
              </Box>
              <Box className='detail-item'>
                <Typography component='span' className='detail-label'>
                  How Known:
                </Typography>
                <Typography component='span' className='detail-value'>
                  {selectedValidation.howKnown || 'Not specified'}
                </Typography>
              </Box>
              {selectedValidation.sourceURI && (
                <Box className='detail-item'>
                  <Typography component='span' className='detail-label'>
                    Source:
                  </Typography>
                  <MuiLink
                    href={selectedValidation.sourceURI}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='detail-value'
                  >
                    View Source
                  </MuiLink>
                </Box>
              )}
            </Box>
          </ValidationDetailsContent>
        )}
        <DialogActions>
          <Button onClick={() => setSelectedValidation(null)}>Close</Button>
        </DialogActions>
      </ValidationDetailsDialog>
    </CertificateContainer>
  )
}

export default Certificate
