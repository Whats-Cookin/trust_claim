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
  useTheme
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

interface CertificateProps {
  subject_name: string
  issuer_name: string
  subject: string
  statement?: string
  effectiveDate?: string
  sourceURI?: string
  validations: Validation[]
  claimId?: string
  image?: string
  name?: string
  claim?: Claim
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

  const handleValidationDialogOpen = () => {
    setValidationDialogOpen(true)
  }

  const handleValidationDialogClose = () => {
    setValidationDialogOpen(false)
  }

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

  const handleClose = () => {
    setAnchorEl(null)
  }

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

  const truncateText = (text: string, length: number) => {
    if (text.length <= length) return text
    return `${text.substring(0, length)}...`
  }

  // Function to render media content
  const renderMedia = () => {
    if (!image) return null

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
      <Box
        sx={{
          width: '100%',
          maxWidth: isXl ? '900px' : isLg ? '800px' : isMd ? '700px' : '100%',
          margin: '0 auto',
          marginTop: { xs: 2, sm: 3 },
          marginBottom: { xs: 2, sm: 3 },
          borderRadius: '12px',
          overflow: 'hidden'
        }}
      >
        {isVideoUrl(image) ? (
          <video
            controls
            style={{
              width: '100%',
              maxHeight: isXl ? '600px' : isLg ? '500px' : isMd ? '450px' : isSm ? '400px' : '350px',
              objectFit: 'contain'
            }}
          >
            <source src={image} type='video/mp4' />
            Your browser does not support the video tag.
          </video>
        ) : (
          <img
            src={image}
            alt='Certificate media content'
            style={{
              width: '100%',
              height: 'auto',
              maxHeight: isXl ? '600px' : isLg ? '500px' : isMd ? '450px' : isSm ? '400px' : '350px',
              objectFit: 'contain'
            }}
            loading='lazy'
          />
        )}
      </Box>
    )
  }

  // Determine the number of validation cards to show based on screen size
  const getVisibleValidationCount = () => {
    if (isXs) return 1
    if (isSm) return 2
    if (isMd) return 3
    return 4 // For large screens
  }

  const visibleValidationCount = getVisibleValidationCount()

  // Determine what text to display based on claim type and existence
  const getDisplayText = () => {
    if (claim?.type === 'credential') {
      return subject
    } else {
      return name
    }
    return subject // Default fallback to subject
  }

  return (
    <Container
      maxWidth={isXl ? 'xl' : isLg ? 'lg' : isMd ? 'md' : 'sm'}
      sx={{
        py: { xs: 2, sm: 3, md: 4 },
        px: { xs: 1, sm: 2, md: 3 }
      }}
    >
      <Card
        sx={{
          width: '100%',
          borderRadius: { xs: '16px', sm: '20px' },
          backgroundColor: '#FFFFFF',
          backgroundImage: 'none',
          color: '#212529',
          marginBottom: { xs: '1rem', sm: '1.5rem', md: '2rem' },
          position: 'relative',
          boxShadow: {
            xs: '0 4px 12px rgba(0, 0, 0, 0.1)',
            sm: '0 6px 16px rgba(0, 0, 0, 0.12)',
            md: '0 8px 24px rgba(0, 0, 0, 0.12)'
          },
          overflow: 'visible'
        }}
      >
        <CardContent sx={{ p: { xs: 1.5, sm: 2, md: 3, lg: 4 } }}>
          <Stack spacing={{ xs: 2, sm: 2.5, md: 3 }}>
            <Box
              id='certificate-content'
              sx={{
                px: { xs: 1, sm: 2, md: 3, lg: 4 },
                position: 'relative'
              }}
            >
              <IconButton
                onClick={() => navigate(-1)}
                sx={{
                  position: 'absolute',
                  top: { xs: 8, sm: 12, md: 16 },
                  right: { xs: 8, sm: 12, md: 16 },
                  zIndex: 10
                }}
                size={isXs ? 'small' : 'medium'}
              >
                <CloseIcon fontSize={isXs ? 'small' : 'medium'} />
              </IconButton>


              <Box
                component='img'
                src={badge}
                alt='Certificate Badge'
                sx={{
                  width: { xs: '100px', sm: '120px', md: '140px', lg: '150px', xl: '160px' },
                  height: { xs: '100px', sm: '120px', md: '140px', lg: '150px', xl: '160px' },
                  display: 'block',
                  margin: '0 auto',
                  marginTop: { xs: 2, sm: 2.5, md: 3 },
                  marginBottom: { xs: 2, sm: 2.5, md: 3 },
                  filter: 'drop-shadow(0px 4px 8px rgba(0, 0, 0, 0.1))',
                  transition: 'transform 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'scale(1.05)'
                  }
                }}
              />

              <Typography
                variant='h4'
                sx={{
                  fontSize: { xs: '24px', sm: '28px', md: '32px', lg: '36px' },
                  fontWeight: 600,
                  marginBottom: { xs: 0.5, sm: 0.75, md: 1 },
                  textAlign: 'center',
                  color: '#2D6A4F'
                }}
              >
                Certificate
              </Typography>
              <Typography
                variant='h6'
                sx={{
                  fontSize: { xs: '12px', sm: '14px', md: '16px' },
                  color: '#666',
                  marginBottom: { xs: 2, sm: 3, md: 4 },
                  textAlign: 'center',
                  textTransform: 'uppercase',
                  letterSpacing: { xs: '1px', sm: '1.5px', md: '2px' }
                }}
              >
                OF SKILL VALIDATION
              </Typography>

              <Typography
                variant='h3'
                sx={{
                  fontSize: { xs: '20px', sm: '24px', md: '28px', lg: '32px' },
                  fontFamily: "'Roboto', sans-serif",
                  fontWeight: 500,
                  marginBottom: { xs: 2, sm: 2.5, md: 3 },
                  textAlign: 'center',
                  color: '#2D6A4F'
                }}
              >
                {subject_name}
              </Typography>

              <Typography
                variant='h3'
                sx={{
                  fontSize: { xs: '20px', sm: '24px', md: '28px', lg: '32px' },
                  fontFamily: "'Roboto', sans-serif",
                  fontWeight: 500,
                  marginBottom: { xs: 2, sm: 2.5, md: 3 },
                  textAlign: 'center',
                  color: '#2D6A4F'
                }}
              >
                {getDisplayText()}
              </Typography>


              <Typography
                sx={{
                  fontSize: { xs: '14px', sm: '15px', md: '16px' },
                  color: '#666',
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

              {renderMedia()}

              {validations && validations.length > 0 && (
                <Box sx={{ width: '100%', mt: { xs: 2, sm: 3, md: 4 } }}>
                  <Typography
                    variant='h6'
                    color='#2D6A4F'
                    textAlign='center'
                    marginBottom={{ xs: 2, sm: 2.5, md: 3 }}
                    fontSize={{ xs: '18px', sm: '20px', md: '22px' }}
                  >
                    Endorsed by:
                  </Typography>

                  {/* IMPROVED ENDORSEMENT CARDS LAYOUT */}
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: {
                        xs: '1fr',
                        sm: 'repeat(2, 1fr)',
                        md: 'repeat(3, 1fr)',
                        lg: 'repeat(4, 1fr)'
                      },
                      gap: { xs: 2, sm: 2.5, md: 3 },
                      width: '100%',
                      maxWidth: '100%',
                      mx: 'auto'
                    }}
                  >
                    {validations.slice(0, visibleValidationCount).map((validation, index) => (
                      <Card
                        key={index}
                        sx={{
                          minHeight: { xs: '180px', sm: '190px' },
                          p: { xs: 2, sm: 2.5 },
                          boxShadow: '0px 2px 14px rgba(0, 0, 0, 0.25)',
                          borderRadius: { xs: 1.5, sm: 2 },
                          cursor: 'pointer',
                          position: 'relative',
                          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.3)'
                          },
                          display: 'flex',
                          flexDirection: 'column',
                          width: '100%'
                        }}
                        onClick={() => handleClaimClick(validation)}
                      >
                        <Typography
                          color='#2D6A4F'
                          fontWeight={500}
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
                          color='#212529'
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
                            color: '#2D6A4F',
                            textTransform: 'none',
                            fontWeight: 500,
                            fontSize: '14px',
                            padding: 0,
                            minWidth: 'auto',
                            '&:hover': {
                              backgroundColor: 'transparent',
                              textDecoration: 'underline'
                            }
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
                          color: '#2D6A4F',
                          textTransform: 'none',
                          fontWeight: 500,
                          fontSize: { xs: '14px', sm: '15px', md: '16px' },
                          '&:hover': {
                            backgroundColor: 'rgba(45, 106, 79, 0.04)'
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
                  color='#495057'
                  textAlign='center'
                  mt={{ xs: 2, sm: 2.5, md: 3 }}
                  fontSize={{ xs: '12px', sm: '13px', md: '14px' }}
                >
                  Issued on:{' '}
                  {new Date(effectiveDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Typography>
              )}
              {claimId && (
                <Box sx={{ mt: { xs: 2, sm: 2.5, md: 3 }, textAlign: 'center' }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 1,
                      flexWrap: 'wrap'
                    }}
                  >
                    <Typography variant='body2' color='#495057' fontSize={{ xs: '12px', sm: '13px', md: '14px' }}>
                      Certificate ID:
                    </Typography>
                    <MuiLink
                      href={`/certificate/${claimId}`}
                      onClick={e => {
                        e.preventDefault()
                        window.location.href = `/certificate/${claimId}`
                      }}
                      sx={{
                        color: '#2D6A4F',
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

            <Box
              sx={{
                width: '100%',
                maxWidth: { xs: '100%', sm: '90%', md: '80%', lg: '740px' },
                height: { xs: 'auto', sm: 'auto', md: '61px' },
                background: '#FEFEFF',
                boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.15)',
                borderRadius: { xs: '8px', sm: '10px', md: '12px' },
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'column', md: 'row' },
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: { xs: '12px', sm: '14px', md: '0 20px' },
                margin: { xs: '16px auto', sm: '18px auto', md: '20px auto' },
                position: 'relative',
                transition: 'all 0.3s ease',
                gap: { xs: '10px', sm: '12px', md: 0 },
                '&:hover': {
                  boxShadow: '0px 6px 24px rgba(0, 0, 0, 0.2)',
                  transform: 'translateY(-2px)'
                }
              }}
            >
              <Box
                onClick={handleExport}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  cursor: 'pointer',
                  background: 'none',
                  border: 'none',
                  padding: { xs: '10px 16px', sm: '12px 18px', md: '8px 16px' },
                  borderRadius: '8px',
                  transition: 'all 0.2s ease',
                  width: { xs: '100%', sm: '100%', md: 'auto' },
                  justifyContent: { xs: 'center', sm: 'center', md: 'flex-start' },
                  '&:hover': {
                    backgroundColor: 'rgba(45, 106, 79, 0.08)',
                    transform: 'scale(1.02)'
                  }
                }}
              >
                <SystemUpdateAltIcon
                  sx={{
                    color: '#2D6A4F',
                    fontSize: { xs: 20, sm: 22, md: 24 }
                  }}
                />
                <Typography
                  sx={{
                    fontFamily: 'Roboto',
                    fontStyle: 'normal',
                    fontWeight: 600,
                    fontSize: { xs: '13px', sm: '14px', md: '16px' },
                    lineHeight: { xs: '17px', sm: '18px', md: '19px' },
                    color: '#2D6A4F',
                    transition: 'color 0.2s ease',
                    whiteSpace: 'nowrap'
                  }}
                >
                  Export Certificate
                </Typography>
              </Box>

              <Box
                onClick={handleShareClick}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  cursor: 'pointer',
                  background: 'none',
                  border: 'none',
                  padding: { xs: '10px 16px', sm: '12px 18px', md: '8px 16px' },
                  borderRadius: '8px',
                  transition: 'all 0.2s ease',
                  width: { xs: '100%', sm: '100%', md: 'auto' },
                  justifyContent: { xs: 'center', sm: 'center', md: 'flex-start' },
                  '&:hover': {
                    backgroundColor: 'rgba(45, 106, 79, 0.08)',
                    transform: 'scale(1.02)'
                  }
                }}
              >
                <ShareIcon
                  sx={{
                    color: '#2D6A4F',
                    fontSize: { xs: 20, sm: 22, md: 24 }
                  }}
                />
                <Typography
                  sx={{
                    fontFamily: 'Roboto',
                    fontStyle: 'normal',
                    fontWeight: 600,
                    fontSize: { xs: '13px', sm: '14px', md: '16px' },
                    lineHeight: { xs: '17px', sm: '18px', md: '19px' },
                    color: '#2D6A4F',
                    transition: 'color 0.2s ease',
                    whiteSpace: 'nowrap'
                  }}
                >
                  Share
                </Typography>
              </Box>
            </Box>
          </Stack>
        </CardContent>

        <Popover
          open={Boolean(anchorEl)}
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
          sx={{
            '& .MuiPopover-paper': {
              width: { xs: '200px', sm: 'auto' },
              padding: { xs: 1, sm: 1.5, md: 2 }
            }
          }}
        >
          <Box
            sx={{
              p: { xs: 1, sm: 1.5, md: 2 },
              display: 'flex',
              flexDirection: 'column',
              gap: { xs: 0.5, sm: 1 }
            }}
          >
            <Button
              startIcon={<LinkedInIcon />}
              onClick={handleLinkedInPost}
              sx={{
                color: '#2D6A4F',
                justifyContent: 'flex-start',
                fontSize: { xs: '13px', sm: '14px', md: '15px' }
              }}
            >
              Share on LinkedIn
            </Button>
            <Button
              startIcon={<ContentCopyIcon />}
              onClick={handleCopyLink}
              sx={{
                color: '#2D6A4F',
                justifyContent: 'flex-start',
                fontSize: { xs: '13px', sm: '14px', md: '15px' }
              }}
            >
              Copy Link
            </Button>
          </Box>
        </Popover>

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={3000}
          onClose={() => setSnackbarOpen(false)}
          message='Link copied to clipboard!'
          sx={{
            '& .MuiSnackbarContent-root': {
              backgroundColor: '#2D6A4F'
            }
          }}
        />

        {/* Validation Dialog */}
        <Dialog
          open={validationDialogOpen}
          onClose={handleValidationDialogClose}
          maxWidth='md'
          fullWidth
          sx={{
            '& .MuiDialog-paper': {
              width: { xs: '95%', sm: '90%', md: '85%' },
              maxWidth: '800px',
              maxHeight: { xs: '95vh', sm: '90vh' },
              borderRadius: { xs: '8px', sm: '10px', md: '12px' },
              backgroundColor: '#FFFFFF',
              overflowY: 'auto'
            }
          }}
        >

          <DialogTitle

            sx={{
              color: '#2D6A4F',
              fontSize: { xs: '20px', sm: '22px', md: '24px' },
              fontWeight: 600,
              textAlign: 'center',
              padding: { xs: 2, sm: 2.5, md: 3 }
            }}
          >
            All Validations
          </DialogTitle>
          <DialogContent
            sx={{
              padding: { xs: 2, sm: 2.5, md: 3 }
            }}
          >
            {/* IMPROVED DIALOG VALIDATION CARDS LAYOUT */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, 1fr)',
                  md: 'repeat(3, 1fr)'
                },
                gap: 2.5
              }}
            >
              {validations?.map((validation, index) => (
                <Card
                  key={index}
                  onClick={() => handleClaimClick(validation)}
                  sx={{
                    minHeight: { xs: '180px', sm: '190px' },
                    backgroundColor: '#ffffff',
                    borderRadius: { xs: '6px', sm: '8px' },
                    boxShadow: '0 2px 14px 0 rgba(0, 0, 0, 0.25)',
                    padding: { xs: '16px', sm: '20px' },
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.3)'
                    },
                    display: 'flex',
                    flexDirection: 'column',
                    width: '100%'
                  }}
                >
                  <Typography
                    color='#2D6A4F'
                    fontWeight={500}
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
                    color='#212529'
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
                    {truncateText(validation.statement || '', isXs ? 70 : 90)}
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
                      color: '#2D6A4F',
                      textTransform: 'none',
                      fontWeight: 500,
                      fontSize: '14px',
                      padding: 0,
                      minWidth: 'auto',
                      '&:hover': {
                        backgroundColor: 'transparent',
                        textDecoration: 'underline'
                      }
                    }}
                  >
                    see all
                  </Button>
                </Card>
              ))}
            </Box>
          </DialogContent>
          <DialogActions sx={{ padding: { xs: '12px 16px', sm: '14px 20px', md: '16px 24px' } }}>
            <Button
              onClick={handleValidationDialogClose}
              sx={{
                color: '#2D6A4F',
                textTransform: 'none',
                fontWeight: 500,
                fontSize: { xs: '14px', sm: '15px', md: '16px' },
                '&:hover': {
                  backgroundColor: 'rgba(45, 106, 79, 0.04)'
                }
              }}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>

        {/* Validation Details Dialog */}
        <Dialog
          open={claimDialogOpen}
          onClose={handleClaimDialogClose}
          maxWidth={false}
          sx={{
            '& .MuiDialog-paper': {
              width: { xs: '95%', sm: '90%', md: '85%' },
              maxWidth: '800px',
              maxHeight: { xs: '95vh', sm: '90vh' },
              borderRadius: { xs: '8px', sm: '10px', md: '12px' },
              backgroundColor: '#FFFFFF',
              overflowY: 'auto'
            }
          }}
        >
          <DialogContent sx={{ p: 0, position: 'relative' }}>
            <IconButton
              onClick={handleClaimDialogClose}
              sx={{
                position: 'absolute',
                right: { xs: 6, sm: 8 },
                top: { xs: 6, sm: 8 },
                color: '#212529',
                zIndex: 1,
                padding: { xs: '4px', sm: '8px' }
              }}
              size={isXs ? 'small' : 'medium'}
            >
              <CloseIcon fontSize={isXs ? 'small' : 'medium'} />
            </IconButton>
            {selectedValidation && (
              <Box sx={{ padding: { xs: 2, sm: 2.5, md: 3 } }}>
                <Box sx={{ marginBottom: { xs: 2, sm: 2.5, md: 3 } }}>
                  {selectedValidation.subject && (
                    <Box
                      sx={{
                        fontSize: { xs: '16px', sm: '18px', md: '20px' },
                        fontWeight: 500,
                        color: '#2D6A4F',
                        marginBottom: { xs: 1.5, sm: 2 },
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        flexWrap: 'wrap'
                      }}
                    >

                      <MuiLink
                        href={selectedValidation.sourceURI}
                        target='_blank'
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          color: 'inherit',
                          textDecoration: 'none',
                          '&:hover': {
                            textDecoration: 'underline'
                          },
                          wordBreak: 'break-word'
                        }}
                      >
                        {selectedValidation.sourceURI}
                        <OpenInNewIcon sx={{ fontSize: { xs: 16, sm: 18, md: 20 } }} />
                      </MuiLink>
                    </Box>
                  )}
                  <Typography
                    sx={{
                      fontSize: { xs: '18px', sm: '20px', md: '24px' },
                      fontWeight: 500,
                      color: '#2D6A4F',
                      marginBottom: { xs: 1.5, sm: 2 }
                    }}
                  >
                    {selectedValidation.issuer_name}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: { xs: '14px', sm: '15px', md: '16px' },
                      color: '#212529',
                      marginBottom: { xs: 1.5, sm: 2 },
                      lineHeight: 1.6
                    }}
                  >
                    {selectedValidation.statement}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: { xs: '12px', sm: '13px', md: '14px' },
                      color: '#495057',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    {selectedValidation.effectiveDate &&
                      new Date(selectedValidation.effectiveDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                  </Typography>
                </Box>
                <Box sx={{ marginTop: { xs: 2, sm: 2.5, md: 3 } }}>
                  {selectedValidation.howKnown && (
                    <Box sx={{ marginBottom: { xs: 1.5, sm: 2 } }}>
                      <Typography
                        sx={{
                          fontWeight: 500,
                          color: '#495057',
                          minWidth: { xs: '120px', sm: '140px', md: '150px' },
                          display: { xs: 'block', sm: 'inline-block' },
                          fontSize: { xs: '13px', sm: '14px' }
                        }}
                      >
                        How Known:
                      </Typography>
                      <Typography
                        sx={{
                          color: '#212529',
                          fontSize: { xs: '13px', sm: '14px' }
                        }}
                      >
                        {selectedValidation.howKnown.replace(/_/g, ' ')}
                      </Typography>
                    </Box>
                  )}
                  {selectedValidation.sourceURI && (
                    <Box sx={{ marginBottom: { xs: 1.5, sm: 2 } }}>
                      <Typography
                        sx={{
                          fontWeight: 500,
                          color: '#495057',
                          minWidth: { xs: '120px', sm: '140px', md: '150px' },
                          display: { xs: 'block', sm: 'inline-block' },
                          fontSize: { xs: '13px', sm: '14px' }
                        }}
                      >
                        Source:
                      </Typography>
                      <Typography>
                        <MuiLink
                          href={selectedValidation.sourceURI}
                          target='_blank'
                          sx={{
                            color: '#2D6A4F',
                            textDecoration: 'none',
                            fontSize: { xs: '13px', sm: '14px' },
                            '&:hover': {
                              textDecoration: 'underline'
                            },
                            wordBreak: 'break-word'
                          }}
                        >
                          {selectedValidation.sourceURI}
                        </MuiLink>
                      </Typography>
                    </Box>
                  )}
                  {selectedValidation.confidence !== undefined && (
                    <Box sx={{ marginBottom: { xs: 1.5, sm: 2 } }}>
                      <Typography
                        sx={{
                          fontWeight: 500,
                          color: '#495057',
                          minWidth: { xs: '120px', sm: '140px', md: '150px' },
                          display: { xs: 'block', sm: 'inline-block' },
                          fontSize: { xs: '13px', sm: '14px' }
                        }}
                      >
                        Confidence:
                      </Typography>
                      <Typography
                        sx={{
                          color: '#212529',
                          fontSize: { xs: '13px', sm: '14px' }
                        }}
                      >
                        {selectedValidation.confidence}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            )}
          </DialogContent>
        </Dialog>
      </Card>
    </Container>
  )
}

export default Certificate
