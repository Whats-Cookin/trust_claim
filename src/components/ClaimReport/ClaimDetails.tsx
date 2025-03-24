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
import DataObjectIcon from '@mui/icons-material/DataObject'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import CircleIcon from '@mui/icons-material/Circle'
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import HubOutlinedIcon from '@mui/icons-material/HubOutlined'
import { Link } from 'react-router-dom'
import { BACKEND_BASE_URL } from '../../utils/settings'
import { memo, useCallback, useEffect, useState } from 'react'
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
  maxWidth: '800px',
  marginTop: theme.spacing(4),
  padding: theme.spacing(2),
  backgroundColor: '#f8f9fa',
  borderRadius: '12px'
}))

const EndorsementTitle = styled(Typography)(({ theme }) => ({
  fontSize: '16px',
  color: '#2D6A4F',
  marginBottom: theme.spacing(2),
  fontWeight: 500
}))

const EndorsementGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(4)
}))

const EndorsementCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: 'white',
  borderRadius: '8px',
  boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.05)',
  border: '1px solid rgba(0, 0, 0, 0.05)'
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
        marginBottom: '2rem'
      }}
    >
      <CardContent>
        <Stack spacing={3}>
          <CertificateContainer>
            <Box
              component="img"
              src={badge}
              alt="Certificate Badge"
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
            <SkillTitle>{data.edge.startNode.name}</SkillTitle>
            
            <Description>
              {claim.statement || "This certificate validates the skills and expertise demonstrated by the recipient."}
            </Description>

            <EndorsementSection>
              <EndorsementTitle>Endorsed by:</EndorsementTitle>
              <EndorsementGrid>
                {data.validations?.map((validation: any, index: number) => (
                  <EndorsementCard key={index}>
                    <Typography variant="h6" sx={{ color: '#2D6A4F', fontWeight: 500 }}>
                      {validation.name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                      {truncateText(validation.comment, 50)}
                    </Typography>
                    <MuiLink 
                      component="button" 
                      onClick={() => {}} 
                      sx={{ 
                        mt: 1,
                        color: '#2D6A4F',
                        textDecoration: 'none',
                        '&:hover': { textDecoration: 'underline' }
                      }}
                    >
                      see all
                    </MuiLink>
                  </EndorsementCard>
                ))}
              </EndorsementGrid>
            </EndorsementSection>

            <IssuerSection>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckCircleOutlineOutlinedIcon sx={{ color: '#2D6A4F' }} />
                <Typography sx={{ color: '#2D6A4F' }}>
                  {`Issued by ${claim.author ? claim.author : extractProfileName(claim.link)}`}
                </Typography>
              </Box>
              <Typography color="textSecondary">
                {new Date(claim.timestamp).toLocaleDateString()}
              </Typography>
              <Typography color="textSecondary">
                ID: {claim.id}
              </Typography>
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

            <ActionButton onClick={handleValidate}>
              <CheckCircleOutlineOutlinedIcon sx={{ color: '#2D6A4F', fontSize: 24 }} />
              <ButtonText>Validate</ButtonText>
            </ActionButton>

            <ActionButton onClick={(e) => handleShareClick(e as unknown as React.MouseEvent<HTMLButtonElement>)}>
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
