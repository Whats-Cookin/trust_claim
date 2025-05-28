import React, { useState, useEffect, useMemo } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Stack,
  Link as MuiLink,
  Snackbar,
  Container,
  useMediaQuery,
  useTheme,
  Divider,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Popover
} from '@mui/material'
// import badge from '../../assets/images/badge.svg'
import ShareIcon from '@mui/icons-material/Share'
import SystemUpdateAltIcon from '@mui/icons-material/SystemUpdateAlt'
import VerifiedIcon from '@mui/icons-material/Verified'
import SchoolIcon from '@mui/icons-material/School'
// import html2pdf from 'html2pdf.js'
// import SharePopover from '../certificate/SharePopover'
// import CertificateMedia from '../certificate/CertificateMedia'

// Embedded styles from certificateStyles
const cardStyles = {
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
}

const badgeStyles = {
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
}

const titleStyles = {
  fontSize: { xs: '24px', sm: '28px', md: '32px', lg: '36px' },
  fontWeight: 600,
  marginBottom: { xs: 0.5, sm: 0.75, md: 1 },
  textAlign: 'center',
  color: '#212529',
  fontFamily: 'Adamina, serif'
}

const subtitleStyles = {
  fontSize: { xs: '12px', sm: '14px', md: '16px' },
  color: '#212529',
  marginBottom: { xs: 2, sm: 3, md: 4 },
  textAlign: 'center',
  textTransform: 'uppercase',
  letterSpacing: { xs: '1px', sm: '1.5px', md: '2px' },
  fontFamily: 'Roboto, serif'
}

const validationCardStyles = {
  p: { xs: 2, sm: 2.5 },
  boxShadow: '0px 2px 14px rgba(0, 0, 0, 0.25)',
  borderRadius: { xs: 1.5, sm: 2 },
  fontWeight: 500,
  cursor: 'pointer',
  position: 'relative',
  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.3)'
  },
  display: 'flex',
  flexDirection: 'column'
}

const actionButtonStyles = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 1,
  cursor: 'pointer',
  background: 'none',
  border: 'none',
  padding: { xs: '10px 16px', sm: '12px 18px', md: '8px 16px' },
  borderRadius: '8px',
  transition: 'all 0.2s ease',
  width: { xs: '100%', sm: '100%', md: 'auto' },
  '&:hover': {
    backgroundColor: 'rgba(45, 106, 79, 0.08)',
    transform: 'scale(1.02)'
  }
}

const COLORS = {
  primary: '#2D6A4F',
  text: {
    primary: '#212529',
    secondary: '#495057'
  },
  background: {
    primary: '#FFFFFF',
    hover: 'rgba(45, 106, 79, 0.08)'
  }
}

interface CredentialCertificateProps {
  credential: any
  relatedClaims?: any[]
  credentialUri?: string
  currentUser?: any
}

const CredentialCertificate: React.FC<CredentialCertificateProps> = ({
  credential,
  relatedClaims = [],
  credentialUri,
  currentUser
}) => {
  const theme = useTheme()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [currentUrl, setCurrentUrl] = useState('')
  const [offerModalOpen, setOfferModalOpen] = useState(false)
  const [recipientEmail, setRecipientEmail] = useState('')
  const [claiming, setClaiming] = useState(false)
  const [offering, setOffering] = useState(false)

  useEffect(() => {
    setCurrentUrl(window.location.href)
  }, [])

  // Extract credential data
  const credentialSubject = credential.credentialSubject || {}
  const achievement = credentialSubject.achievement || {}
  const issuer = credential.issuer || {}
  const issuanceDate = credential.issuanceDate
  const expirationDate = credential.expirationDate

  // Get credential type for badge
  const getCredentialType = () => {
    const types = Array.isArray(credential.type) ? credential.type : [credential.type]
    if (types.includes('OpenBadgeCredential')) return 'Achievement'
    if (types.includes('EducationCredential')) return 'Education'
    if (types.includes('ProfessionalCredential')) return 'Professional'
    return 'Credential'
  }

  const handleExport = () => {
    // const element = document.getElementById('credential-certificate-content')
    // if (element) {
    //   const opt = {
    //     margin: 1,
    //     filename: `credential_${credential.id || Date.now()}.pdf`,
    //     image: { type: 'jpeg', quality: 0.98 },
    //     html2canvas: { scale: 2 },
    //     jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    //   }
    //   html2pdf().set(opt).from(element).save()
    // }
    // TODO: Implement PDF export
    console.log('Export PDF')
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
      `I'm excited to share my verified ${credentialName} credential from ${issuer.name || 'LinkedTrust'}! Check it out here: ${url}`
    )
    return `https://www.linkedin.com/feed/?shareActive=true&shareUrl=${encodedUrl}&text=${message}`
  }

  const handleLinkedInPost = () => {
    const credentialName = achievement.name || credential.name || getCredentialType()
    const linkedInShareUrl = generateLinkedInShareUrl(credentialName, currentUrl)
    window.open(linkedInShareUrl, '_blank')
    handleClose()
  }

  const handleClaimCredential = async () => {
    if (!currentUser || !userUri) return
    
    try {
      setClaiming(true)
      const token = searchParams.get('claim_token') || searchParams.get('invite_token')
      
      const { createClaim } = await import('../../api')
      const response = await createClaim({
        subject: userUri,
        claim: 'HAS',
        object: credentialUri || credential.id,
        statement: `Has credential: ${achievement.name || credential.name || 'Credential'}`,
        howKnown: 'VERIFIED_LOGIN',
        confidence: 1.0,
        claimToken: token
      })
      
      // Refresh page to update UI
      window.location.reload()
    } catch (error) {
      console.error('Failed to claim credential:', error)
      // TODO: Show error snackbar
    } finally {
      setClaiming(false)
    }
  }

  const handleOfferCredential = () => {
    setOfferModalOpen(true)
  }

  const handleSendOffer = async () => {
    if (!recipientEmail || !currentUser) return
    
    try {
      setOffering(true)
      // const { apiService } = await import('../../api/apiService')
      
      // await apiService.post('/api/credentials/offer', {
      //   credentialId: credentialUri || credential.id,
      //   recipientEmail,
      //   issuerUri: userUri
      // })
      
      // TODO: Implement offer endpoint
      console.log('Send offer to:', recipientEmail)
      
      setOfferModalOpen(false)
      setRecipientEmail('')
      // TODO: Show success snackbar
    } catch (error) {
      console.error('Failed to send offer:', error)
      // TODO: Show error snackbar
    } finally {
      setOffering(false)
    }
  }

  const handleRequestValidation = () => {
    // TODO: Open validation request modal
    navigate(`/validate/${credentialUri || credential.id}?request=true`)
  }

  // Get endorsements from related claims
  const endorsements = relatedClaims.filter(claim => 
    claim.claim === 'ENDORSES' || claim.claim === 'VALIDATES'
  )

  // Get user URI
  const getUserUri = () => {
    if (!currentUser) return null
    if (currentUser.metamaskAddress) {
      return `did:pkh:eip155:1:${currentUser.metamaskAddress}`
    }
    if (currentUser.googleId) {
      return `https://live.linkedtrust.us/userids/google/${currentUser.googleId}`
    }
    return `https://live.linkedtrust.us/users/${currentUser.id}`
  }

  const userUri = getUserUri()

  // Check if user has claimed this credential
  const userHasClaimed = useMemo(() => {
    if (!userUri) return false
    return relatedClaims?.some(claim => 
      claim.subject === userUri &&
      claim.claim === 'HAS' &&
      claim.object === (credentialUri || credential.id)
    )
  }, [relatedClaims, userUri, credentialUri, credential.id])

  // Check if credential is already claimed by anyone
  const credentialIsClaimed = useMemo(() => {
    return relatedClaims?.some(claim => 
      claim.claim === 'HAS' &&
      claim.object === (credentialUri || credential.id)
    )
  }, [relatedClaims, credentialUri, credential.id])

  // Show claim button logic
  const showClaimButton = useMemo(() => {
    if (!currentUser || credentialIsClaimed) return false
    
    // Check conditions
    return (
      // Magic link from creation
      searchParams.get('claim_token') ||
      
      // User is the subject
      credential.credentialSubject?.id === userUri ||
      
      // Invitation link
      searchParams.get('invite_token')
    )
  }, [currentUser, credentialIsClaimed, searchParams, credential.credentialSubject?.id, userUri])

  // Show offer button logic
  const showOfferButton = useMemo(() => {
    if (!currentUser || credentialIsClaimed) return false
    
    return (
      // User is the issuer
      credential.issuer?.id === userUri ||
      
      // Magic link for offering
      searchParams.get('offer_token')
    )
  }, [currentUser, credentialIsClaimed, credential.issuer?.id, userUri, searchParams])

  return (
    <Container
      maxWidth={theme.breakpoints.up('xl') ? 'xl' : 'lg'}
      sx={{
        py: { xs: 2, sm: 3, md: 4 },
        px: { xs: 1, sm: 2, md: 3 }
      }}
    >
      <Card sx={cardStyles}>
        <CardContent sx={{ p: { xs: 1.5, sm: 2, md: 3, lg: 4 } }}>
          <Stack spacing={{ xs: 2, sm: 2.5, md: 3 }}>
            <Box
              id='credential-certificate-content'
              sx={{
                px: { xs: 1, sm: 2, md: 3, lg: 4 },
                position: 'relative'
              }}
            >
              {/* Badge */}
              {achievement.image ? (
                <Box component='img' src={achievement.image.id || achievement.image} alt='Credential Badge' sx={badgeStyles} />
              ) : (
                <Box sx={{
                  ...badgeStyles,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: COLORS.background.hover,
                  borderRadius: '50%'
                }}>
                  <SchoolIcon sx={{ fontSize: 60, color: COLORS.primary }} />
                </Box>
              )}

              {/* Title */}
              <Typography variant='h4' sx={titleStyles}>
                {getCredentialType()} Credential
              </Typography>
              <Typography variant='h6' sx={subtitleStyles}>
                VERIFIED ACHIEVEMENT
              </Typography>

              {/* Recipient Name */}
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
                {credentialSubject.name || 'Credential Holder'}
              </Typography>

              {/* Achievement Name */}
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
                {achievement.name || credential.name || 'Achievement'}
              </Typography>

              {/* Achievement Description */}
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
                {achievement.description || credentialSubject.description || 
                 'This credential validates the skills and expertise demonstrated by the recipient.'}
              </Typography>

              {/* Achievement Image */}
              {achievement.image && (
                <Box
                  component="img"
                  src={achievement.image.id || achievement.image}
                  alt="Achievement"
                  sx={{
                    maxWidth: '100%',
                    maxHeight: 400,
                    objectFit: 'contain',
                    display: 'block',
                    margin: '0 auto',
                    borderRadius: 2
                  }}
                />
              )}

              {/* Criteria Section */}
              {achievement.criteria && (
                <Box sx={{ mt: 3, mb: 3 }}>
                  <Typography
                    variant='h6'
                    sx={{
                      fontSize: { xs: '16px', sm: '18px', md: '20px' },
                      fontWeight: 600,
                      color: COLORS.text.primary,
                      textAlign: 'center',
                      mb: 2
                    }}
                  >
                    Criteria
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: { xs: '14px', sm: '15px', md: '16px' },
                      color: COLORS.text.secondary,
                      textAlign: 'center',
                      maxWidth: { xs: '100%', sm: '90%', md: '80%' },
                      margin: '0 auto'
                    }}
                  >
                    {achievement.criteria.narrative || achievement.criteria}
                  </Typography>
                </Box>
              )}

              {/* Skills Section */}
              {credentialSubject.skills && credentialSubject.skills.length > 0 && (
                <Box sx={{ mt: 3, mb: 3 }}>
                  <Typography
                    variant='h6'
                    sx={{
                      fontSize: { xs: '16px', sm: '18px', md: '20px' },
                      fontWeight: 600,
                      color: COLORS.text.primary,
                      textAlign: 'center',
                      mb: 2
                    }}
                  >
                    Skills Demonstrated
                  </Typography>
                  <Box sx={{ 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    gap: 1, 
                    justifyContent: 'center' 
                  }}>
                    {credentialSubject.skills.map((skill: any, index: number) => (
                      <Chip
                        key={index}
                        label={typeof skill === 'string' ? skill : skill.name || skill}
                        sx={{
                          backgroundColor: COLORS.background.hover,
                          color: COLORS.primary,
                          fontWeight: 500
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              )}

              {/* Portfolio/Evidence */}
              {credentialSubject.portfolio && credentialSubject.portfolio.length > 0 && (
                <Box sx={{ mt: 3, mb: 3 }}>
                  <Typography
                    variant='h6'
                    sx={{
                      fontSize: { xs: '16px', sm: '18px', md: '20px' },
                      fontWeight: 600,
                      color: COLORS.text.primary,
                      textAlign: 'center',
                      mb: 2
                    }}
                  >
                    Portfolio
                  </Typography>
                  <Box sx={{ textAlign: 'center' }}>
                    {credentialSubject.portfolio.map((item: any, index: number) => (
                      <MuiLink
                        key={index}
                        href={item.url}
                        target='_blank'
                        sx={{
                          display: 'block',
                          color: COLORS.primary,
                          textDecoration: 'none',
                          fontSize: { xs: '14px', sm: '15px' },
                          mb: 1,
                          '&:hover': {
                            textDecoration: 'underline'
                          }
                        }}
                      >
                        {item.name || item.url}
                      </MuiLink>
                    ))}
                  </Box>
                </Box>
              )}

              {/* Issuer Section */}
              <Box sx={{ 
                mt: 4, 
                pt: 3, 
                borderTop: `1px solid ${theme.palette.divider}`,
                textAlign: 'center'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
                  <VerifiedIcon sx={{ color: COLORS.primary, fontSize: 20 }} />
                  <Typography
                    variant='body1'
                    sx={{
                      fontSize: { xs: '14px', sm: '15px', md: '16px' },
                      color: COLORS.text.primary,
                      fontWeight: 500
                    }}
                  >
                    Issued by {issuer.name || issuer.id || 'Issuer'}
                  </Typography>
                </Box>
                
                {issuanceDate && (
                  <Typography
                    variant='body2'
                    color={COLORS.text.secondary}
                    fontSize={{ xs: '12px', sm: '13px', md: '14px' }}
                  >
                    {new Date(issuanceDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </Typography>
                )}

                {expirationDate && (
                  <Typography
                    variant='body2'
                    color={COLORS.text.secondary}
                    fontSize={{ xs: '12px', sm: '13px', md: '14px' }}
                    sx={{ mt: 0.5 }}
                  >
                    Expires: {new Date(expirationDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </Typography>
                )}
              </Box>

              {/* Endorsements Section */}
              {endorsements.length > 0 && (
                <Box sx={{ width: '100%', mt: { xs: 3, sm: 4, md: 5 } }}>
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
                    {endorsements.slice(0, 3).map((endorsement, index) => (
                      <Card key={index} sx={validationCardStyles}>
                        <Typography
                          variant='body2'
                          color={COLORS.primary}
                          fontSize={{ xs: 18, sm: 20 }}
                          marginBottom={1.5}
                        >
                          {endorsement.issuerId}
                        </Typography>
                        <Typography
                          variant='body2'
                          color={COLORS.text.primary}
                          fontSize={{ xs: 14, sm: 16 }}
                        >
                          {endorsement.statement || 'Endorsed this credential'}
                        </Typography>
                      </Card>
                    ))}
                  </Box>
                </Box>
              )}

              {/* Credential ID */}
              {credentialUri && (
                <Box sx={{ mt: { xs: 2, sm: 2.5, md: 3 }, textAlign: 'center' }}>
                  <Typography
                    variant='body2'
                    color={COLORS.text.secondary}
                    fontSize={{ xs: '12px', sm: '13px', md: '14px' }}
                  >
                    Credential ID: {credentialUri}
                  </Typography>
                </Box>
              )}
            </Box>
          </Stack>
        </CardContent>

        <Divider />

        {/* Action Buttons */}
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 2,
            margin: '0 auto',
            padding: { xs: 2, sm: 2.5, md: 3 }
          }}
        >
          {/* Export is always available */}
          <Box onClick={handleExport} sx={actionButtonStyles}>
            <SystemUpdateAltIcon sx={{ color: COLORS.primary }} />
            <Typography variant='body2' sx={{ color: COLORS.primary, whiteSpace: 'nowrap' }}>
              Export PDF
            </Typography>
          </Box>

          {/* Claim button - for recipients */}
          {showClaimButton && (
            <Button
              variant="contained"
              onClick={handleClaimCredential}
              disabled={claiming}
              sx={{
                backgroundColor: COLORS.primary,
                '&:hover': { backgroundColor: '#1e5a3f' },
                textTransform: 'none'
              }}
            >
              {claiming ? 'Claiming...' : 'Claim This Credential'}
            </Button>
          )}

          {/* Share button - only for those who claimed it */}
          {userHasClaimed && (
            <Box onClick={handleShareClick} sx={actionButtonStyles}>
              <ShareIcon sx={{ color: COLORS.primary }} />
              <Typography variant='body2' sx={{ color: COLORS.primary, whiteSpace: 'nowrap' }}>
                Share
              </Typography>
            </Box>
          )}

          {/* Offer button - for issuers */}
          {showOfferButton && (
            <Button
              variant="outlined"
              onClick={handleOfferCredential}
              sx={{
                borderColor: COLORS.primary,
                color: COLORS.primary,
                '&:hover': { 
                  borderColor: '#1e5a3f',
                  backgroundColor: 'rgba(45, 106, 79, 0.08)'
                },
                textTransform: 'none'
              }}
            >
              Send Credential
            </Button>
          )}

          {/* Validation actions */}
          <Button
            variant="text"
            onClick={() => navigate(`/validate/${credentialUri || credential.id}`)}
            sx={{
              color: COLORS.primary,
              textTransform: 'none'
            }}
          >
            Validate
          </Button>

          <Button
            variant="text"
            onClick={handleRequestValidation}
            sx={{
              color: COLORS.primary,
              textTransform: 'none'
            }}
          >
            Request Validation
          </Button>
        </Box>

        {/* Share Popover */}
        <Popover
          open={Boolean(anchorEl)}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
        >
          <Box sx={{ p: 2 }}>
            <Button onClick={handleCopyLink} fullWidth sx={{ mb: 1 }}>
              Copy Link
            </Button>
            <Button onClick={handleLinkedInPost} fullWidth>
              Share on LinkedIn
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
              backgroundColor: COLORS.primary
            }
          }}
        />

        {/* Offer Credential Modal */}
        <Dialog open={offerModalOpen} onClose={() => setOfferModalOpen(false)}>
          <DialogTitle>Send Credential</DialogTitle>
          <DialogContent>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Enter the recipient's email address. They will receive a link to claim this credential.
            </Typography>
            <TextField
              fullWidth
              label="Recipient Email"
              type="email"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              placeholder="recipient@example.com"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOfferModalOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleSendOffer}
              variant="contained"
              disabled={!recipientEmail || offering}
              sx={{
                backgroundColor: COLORS.primary,
                '&:hover': { backgroundColor: '#1e5a3f' }
              }}
            >
              {offering ? 'Sending...' : 'Send Invitation'}
            </Button>
          </DialogActions>
        </Dialog>
      </Card>
    </Container>
  )
}

export default CredentialCertificate
