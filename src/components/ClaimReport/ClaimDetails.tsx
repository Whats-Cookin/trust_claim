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
  Snackbar
} from '@mui/material'
import ShareIcon from '@mui/icons-material/Share'
import LinkedInIcon from '@mui/icons-material/LinkedIn'
import DataObjectIcon from '@mui/icons-material/DataObject'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import { Link } from 'react-router-dom'
import { memo, useEffect, useState, useRef } from 'react'
import html2pdf from 'html2pdf.js'

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
  const [isExpanded, setIsExpanded] = useState(false)
  const claim = data.claim

  console.log('Full data structure:', {
    data: data,
    claim: claim,
    claimData: data.claim.claimData,
    edge: data.edge
  })

  useEffect(() => {
    setCurrentUrl(window.location.href)
  }, [])

  const handleShareClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
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
          <Stack direction='row' spacing={2} alignItems='center' justifyContent='space-between'>
            <Typography
              component={Link}
              to={data.edge.startNode.nodeUri}
              variant='h6'
              color='black'
              sx={{
                textDecoration: 'none',
                minWidth: 0,
                textOverflow: 'ellipsis',
                overflow: 'hidden',
                fontSize: '24px',
                fontWeight: 600,
                fontFamily: 'Roboto'
              }}
            >
              {data.claim.claimData.name}
            </Typography>

            <Button
              startIcon={<ShareIcon />}
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleShareClick(e)}
              sx={{
                backgroundColor: '#4FA890',
                color: 'white',
                borderRadius: '25px',
                padding: '8px 24px',
                textTransform: 'none',
                fontSize: '16px',
                '&:hover': {
                  backgroundColor: '#3d8872'
                }
              }}
            >
              Share
            </Button>
          </Stack>

          <Stack direction='row' spacing={1} alignItems='center'>
            <Typography variant='body1' sx={{ marginBottom: '10px', color: theme.palette.text1 }}>
              {`${new Date(claim.claim.effectiveDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}`}
            </Typography>
          </Stack>

          {data.claim.claimData.image && <MediaContent url={data.claim.claimData.image} />}

          <Stack spacing={3}>
            <Typography
              variant='body1'
              sx={{
                fontSize: '16px',
                lineHeight: 1.6
              }}
            >
              {claim.claim.statement}
            </Typography>

            <Stack spacing={2}>
              <Stack direction='row' spacing={2}>
                <Typography sx={{ width: 120 }}>From:</Typography>
                <Typography>{claim.claim.author}</Typography>
              </Stack>
              <Stack direction='row' spacing={2}>
                <Typography sx={{ width: 120 }}>How known:</Typography>
                <Typography>{claim.claim.howKnown}</Typography>
              </Stack>
              <Stack direction='row' spacing={2}>
                <Typography sx={{ width: 120 }}>Aspect:</Typography>
                <Typography>{claim.claim.claim}</Typography>
              </Stack>
              <Stack direction='row' spacing={2}>
                <Typography sx={{ width: 120 }}>Confidence:</Typography>
                <Typography>{claim.claim.confidence}</Typography>
              </Stack>
            </Stack>
          </Stack>

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
