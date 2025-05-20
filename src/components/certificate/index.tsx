import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  IconButton,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Link as MuiLink,
  Popover,
  Snackbar,
  Container,
  useMediaQuery,
  useTheme,
  Divider
} from '@mui/material'
import { Link } from 'react-router-dom'
import badge from '../../assets/images/badge.svg'
import CloseIcon from '@mui/icons-material/Close'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import ShareIcon from '@mui/icons-material/Share'
import LinkedInIcon from '@mui/icons-material/LinkedIn'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import SystemUpdateAltIcon from '@mui/icons-material/SystemUpdateAlt'
import { useNavigate } from 'react-router-dom'
import html2pdf from 'html2pdf.js'
import { CertificateProps } from '../../types/certificate'
import {
  cardStyles,
  badgeStyles,
  titleStyles,
  subtitleStyles,
  validationCardStyles,
  actionButtonStyles,
  COLORS,
  getVisibleValidationCount
} from '../../constants/certificateStyles'
import ValidationDialog from './ValidationDialog'
import ValidationDetailsDialog from './ValidationDetailsDialog'
import SharePopover from './SharePopover'
import CertificateMedia from './CertificateMedia'

interface Validation {
  subject_name: string
  issuer_name: string
  statement: string
  date?: string
  confidence?: number
  howKnown?: string
  sourceURI?: string
  image?: string
  mediaUrl?: string
  subject?: string
  effectiveDate?: string
}

interface Claim {
  type?: string
  claim?: {
    name?: string
  }
}

const Certificate: React.FC<CertificateProps> = ({
  issuer_name,
  subject,
  statement,
  effectiveDate,
  sourceURI,
  validations,
  claimId,
  image,
  name,
  claim,
  subject_name
}) => {
  const navigate = useNavigate()
  const theme = useTheme()
  const isXs = useMediaQuery(theme.breakpoints.down('sm'))
  const isSm = useMediaQuery(theme.breakpoints.between('sm', 'md'))
  const isMd = useMediaQuery(theme.breakpoints.between('md', 'lg'))
  const isLg = useMediaQuery(theme.breakpoints.up('lg'))
  const isXl = useMediaQuery(theme.breakpoints.up('xl'))

  const [validationDialogOpen, setValidationDialogOpen] = useState(false)
  const [selectedValidation, setSelectedValidation] = useState<Validation | null>(null)
  const [claimDialogOpen, setClaimDialogOpen] = useState(false)
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [currentUrl, setCurrentUrl] = useState('')

  useEffect(() => {
    setCurrentUrl(window.location.href)
  }, [])

  const handleExport = () => {
    const element = document.getElementById('certificate-content')
    if (element) {
      const opt = {
        margin: 1,
        filename: `certificate${claimId ? `_${claimId}` : ''}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
      }
      html2pdf().set(opt).from(element).save()
    }
  }

  const handleValidationDialogOpen = () => setValidationDialogOpen(true)
  const handleValidationDialogClose = () => setValidationDialogOpen(false)

  const handleClaimClick = (validation: Validation) => {
    setSelectedValidation(validation)
    setClaimDialogOpen(true)
  }

  const handleClaimDialogClose = () => {
    setClaimDialogOpen(false)
    setSelectedValidation(null)
  }

  const handleShareClick = (event: React.MouseEvent<HTMLDivElement>) => {
    setAnchorEl(event.currentTarget as unknown as HTMLButtonElement)
  }

  const handleClose = () => setAnchorEl(null)

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl)
      setSnackbarOpen(true)
      handleClose()
    } catch (err) {
      console.error('Failed to copy link:', err)
    }
  }

  const generateLinkedInShareUrl = (credentialName: string, url: string) => {
    const encodedUrl = encodeURIComponent(url)
    const message = encodeURIComponent(
      `Excited to share my verified ${credentialName} credential from LinkedTrust! Check it out here: ${url} Thanks to my validators for confirming my skills!`
    )
    return `https://www.linkedin.com/feed/?shareActive=true&shareUrl=${encodedUrl}&text=${message}`
  }

  const handleLinkedInPost = () => {
    let credentialName = 'a new'
    if (subject && !subject.includes('https')) {
      credentialName = subject
    }
    const linkedInShareUrl = generateLinkedInShareUrl(credentialName, currentUrl)
    window.open(linkedInShareUrl, '_blank')
    handleClose()
  }

  const getDisplayText = () => {
    if (claim?.type === 'credential') {
      return subject
    }
    return name || subject
  }

  const visibleValidationCount = getVisibleValidationCount(isXs, isSm, isMd)

  return (
    <Container
      maxWidth={useMediaQuery(theme.breakpoints.up('xl')) ? 'xl' : useMediaQuery(theme.breakpoints.up('lg')) ? 'lg' : useMediaQuery(theme.breakpoints.up('md')) ? 'md' : 'sm'}
      sx={{
        py: { xs: 2, sm: 3, md: 4 },
        px: { xs: 1, sm: 2, md: 3 }
      }}
    >
      <Card sx={cardStyles}>
        <CardContent sx={{ p: { xs: 1.5, sm: 2, md: 3, lg: 4 } }}>
          <Stack spacing={{ xs: 2, sm: 2.5, md: 3 }}>
            <Box
              id='certificate-content'
              sx={{
                px: { xs: 1, sm: 2, md: 3, lg: 4 },
                position: 'relative'
              }}
            >
              <Box component='img' src={badge} alt='Certificate Badge' sx={badgeStyles} />

              <Typography variant='h4' sx={titleStyles}>
                Certificate
              </Typography>
              <Typography variant='h6' sx={subtitleStyles}>
                OF SKILL VALIDATION
              </Typography>

              <Typography
                variant='h3'
                sx={{
                  fontSize: { xs: '20px', sm: '24px', md: '28px', lg: '32px' },
                  fontFamily: 'Allison, cursive',
                  fontWeight: 500,
                  marginBottom: { xs: 2, sm: 2.5, md: 3 },
                  textAlign: 'center',
                  color: COLORS.primary
                }}
              >
                {subject_name}
              </Typography>

              <Typography
                variant='h3'
                sx={{
                  fontSize: { xs: '20px', sm: '24px', md: '28px', lg: '32px' },
                  fontFamily: 'Roboto, sans-serif',
                  fontWeight: 500,
                  marginBottom: { xs: 2, sm: 2.5, md: 3 },
                  textAlign: 'center',
                  color: COLORS.text.primary
                }}
              >
                {getDisplayText()}
              </Typography>

              <Typography
                sx={{
                  fontFamily: 'Roboto, sans-serif',
                  fontSize: { xs: '14px', sm: '15px', md: '16px' },
                  color: COLORS.text.primary,
                  marginBottom: { xs: 2, sm: 3, md: 4 },
                  textAlign: 'center',
                  maxWidth: { xs: '100%', sm: '90%', md: '80%', lg: '70%' },
                  margin: '0 auto',
                  lineHeight: '1.6',
                  padding: { xs: '0 8px', sm: '0 4px', md: 0 }
                }}
              >
                {statement || 'This certificate validates the skills and expertise demonstrated by the recipient.'}
              </Typography>

              <CertificateMedia image={image} />

              {validations && validations.length > 0 && (
                <Box sx={{ width: '100%', mt: { xs: 2, sm: 3, md: 4 } }}>
                  <Typography
                    variant='h6'
                    color={COLORS.text.primary}
                    textAlign='center'
                    marginBottom={{ xs: 2, sm: 2.5, md: 3 }}
                    fontSize={{ xs: '18px', sm: '20px', md: '22px' }}
                  >
                    Endorsed by:
                  </Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'row',
                      flexWrap: 'wrap',
                      justifyContent: 'center',
                      alignItems: 'center',
                      gap: { xs: 2, sm: 2.5, md: 3 },
                      width: '100%',
                      maxWidth: '100%',
                      mx: 'auto'
                    }}
                  >
                    {validations.slice(0, visibleValidationCount).map((validation, index) => (
                      <Card
                        key={index}
                        sx={validationCardStyles}
                        onClick={() => handleClaimClick(validation)}
                      >
                        <Typography
                          variant='body2'
                          color={COLORS.primary}
                          fontSize={{ xs: 18, sm: 20 }}
                          marginBottom={1.5}
                          sx={{
                            wordBreak: 'break-word',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}
                        >
                          {validation.issuer_name}
                        </Typography>
                        <Typography
                          variant='body2'
                          color={COLORS.text.primary}
                          fontSize={{ xs: 14, sm: 16 }}
                          sx={{
                            flexGrow: 1,
                            overflow: 'hidden',
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                            marginBottom: 3.5
                          }}
                        >
                          {validation.statement || ''}
                        </Typography>
                        <Button
                          onClick={e => {
                            e.stopPropagation()
                            handleClaimClick(validation)
                          }}
                          sx={{
                            position: 'absolute',
                            bottom: 16,
                            right: 16,
                            color: COLORS.primary,
                            textTransform: 'none',
                            fontWeight: 500,
                            fontSize: '14px',
                            padding: 0,
                            minWidth: 'auto',
                            textDecoration: 'none'
                          }}
                        >
                          see all
                        </Button>
                      </Card>
                    ))}
                  </Box>

                  {validations.length > visibleValidationCount && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: { xs: 1.5, sm: 2 } }}>
                      <Button
                        onClick={handleValidationDialogOpen}
                        sx={{
                          color: COLORS.primary,
                          textTransform: 'none',
                          fontWeight: 500,
                          fontSize: { xs: '14px', sm: '15px', md: '16px' },
                          '&:hover': {
                            backgroundColor: COLORS.background.hover
                          }
                        }}
                      >
                        See more validations ({validations.length - visibleValidationCount} more)
                      </Button>
                    </Box>
                  )}
                </Box>
              )}

              {effectiveDate && (
                <Typography
                  variant='body2'
                  color={COLORS.text.secondary}
                  textAlign='left'
                  mt={{ xs: 2, sm: 2.5, md: 3 }}
                  fontSize={{ xs: '12px', sm: '13px', md: '14px' }}
                >
                  {new Date(effectiveDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Typography>
              )}

              {claimId && (
                <Box sx={{ mt: { xs: 2, sm: 2.5, md: 3 }, textAlign: 'left' }}>
                  <Box sx={{ display: 'flex', alignItems: 'left', gap: 1 }}>
                    <Typography variant='body2' color={COLORS.text.secondary} fontSize={{ xs: '12px', sm: '13px', md: '14px' }}>
                      ID :
                    </Typography>
                    <MuiLink
                      href={`/certificate/${claimId}`}
                      onClick={e => {
                        e.preventDefault()
                        window.location.href = `/certificate/${claimId}`
                      }}
                      sx={{
                        color: COLORS.primary,
                        textDecoration: 'none',
                        fontSize: { xs: '12px', sm: '13px', md: '14px' },
                        wordBreak: 'break-all',
                        '&:hover': {
                          textDecoration: 'underline'
                        }
                      }}
                    >
                      {claimId}
                    </MuiLink>
                  </Box>
                </Box>
              )}
            </Box>
          </Stack>
        </CardContent>

        <Divider />

        <Box
          sx={{
            width: '100%',
            maxWidth: '50%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 2,
            margin: '0 auto',
            padding: { xs: 2, sm: 2.5, md: 3 }
          }}
        >
          <Box onClick={handleExport} sx={actionButtonStyles}>
            <SystemUpdateAltIcon sx={{ color: COLORS.primary }} />
            <Typography variant='body2' sx={{ color: COLORS.primary, whiteSpace: 'nowrap' }}>
              Export Certificate
            </Typography>
          </Box>

          <Box onClick={handleShareClick} sx={actionButtonStyles}>
            <ShareIcon sx={{ color: COLORS.primary }} />
            <Typography variant='body2' sx={{ color: COLORS.primary, whiteSpace: 'nowrap' }}>
              Share
            </Typography>
          </Box>
        </Box>

        <SharePopover
          anchorEl={anchorEl}
          onClose={handleClose}
          onCopyLink={handleCopyLink}
          onLinkedInShare={handleLinkedInPost}
        />

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={3000}
          onClose={() => setSnackbarOpen(false)}
          message='Link copied to clipboard!'
          sx={{
            '& .MuiSnackbarContent-root': {
              backgroundColor: COLORS.primary
            }
          }}
        />

        <ValidationDialog
          open={validationDialogOpen}
          onClose={handleValidationDialogClose}
          validations={validations}
          onValidationClick={handleClaimClick}
        />

        <ValidationDetailsDialog
          open={claimDialogOpen}
          onClose={handleClaimDialogClose}
          validation={selectedValidation}
        />
      </Card>
    </Container>
  )
}

export default Certificate
