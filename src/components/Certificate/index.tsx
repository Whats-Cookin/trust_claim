import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Container,
  Snackbar,
  useMediaQuery,
  useTheme,
  Divider,
  Link as MuiLink
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import badge from '../../assets/images/badge.png'
import ShareIcon from '@mui/icons-material/Share'
import SystemUpdateAltIcon from '@mui/icons-material/SystemUpdateAlt'
import html2pdf from 'html2pdf.js'
import { CertificateProps, Validation } from '../../types/certificate'
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
import { extractProfileName, isValidUrl } from '../../utils/string.utils'
import ValidationDialog from './ValidationDialog'
import ValidationDetailsDialog from './ValidationDetailsDialog'
import SharePopover from './SharePopover'

interface Claim {
  type?: string
  claim?: { name?: string }
}

/** ---------- Helpers for robust name extraction ---------- **/

const toTitleCase = (s: string) =>
  s
    .split(' ')
    .map(part => (part ? part[0].toUpperCase() + part.slice(1) : ''))
    .join(' ')

const humanizeSlug = (s: string) =>
  toTitleCase(
    decodeURIComponent(s)
      .replace(/[@]/g, '')           // remove @handles
      .replace(/[-_.]+/g, ' ')       // hyphens/underscores/dots -> space
      .replace(/\s+/g, ' ')          // collapse spaces
      .trim()
  )

const coerceUrl = (s: string) => (/^https?:\/\//i.test(s) ? s : `https://${s}`)

const extractNameFromUrl = (raw: string): string => {
  try {
    const safe = coerceUrl(raw)
    const u = new URL(safe)

    // Prefer common query params if present
    const qKeys = ['name', 'fullName', 'user', 'username', 'handle', 'slug']
    for (const k of qKeys) {
      const v = u.searchParams.get(k)
      if (v) return humanizeSlug(v)
    }

    // Otherwise, use the last meaningful path segment
    const parts = u.pathname.split('/').filter(Boolean)
    if (parts.length === 0) return ''

    const blacklist = new Set(['in', 'u', 'user', 'users', 'profile', 'profiles', 'p', 'id'])
    let candidate = ''
    for (let i = parts.length - 1; i >= 0; i--) {
      const seg = parts[i]
      if (!blacklist.has(seg.toLowerCase())) {
        candidate = seg
        break
      }
    }
    if (!candidate) candidate = parts[parts.length - 1]
    return humanizeSlug(candidate)
  } catch {
    return ''
  }
}

/**
 * Accepts a string or object (with optional `name`/`uri`) and returns a human display name.
 * - If it's a plain string:
 *    • If URL-like => parse from URL
 *    • else => return as-is trimmed
 * - If it's an object:
 *    • Prefer `name`
 *    • Else try `uri` as URL
 *    • Else fallback to `extractProfileName`
 */
const deriveDisplayNameFromAny = (value: any): string => {
  if (!value) return ''

  // If explicit name exists, prefer it
  if (typeof value === 'object') {
    const maybeName = (value as any)?.name
    if (typeof maybeName === 'string' && maybeName.trim()) {
      return maybeName.trim()
    }
  }

  // If it's a string
  if (typeof value === 'string') {
    const s = value.trim()
    if (!s) return ''
    if (isValidUrl(s) || /^[\w.-]+\.[a-z]{2,}/i.test(s)) {
      // treat bare domains/paths as URLs too
      const fromUrl = extractNameFromUrl(s)
      if (fromUrl) return fromUrl
    }
    if (s.startsWith('@')) return humanizeSlug(s) // handle-like
    return s
  }

  // If it's an object with a uri
  const uri = (value as any)?.uri
  if (typeof uri === 'string' && uri.trim()) {
    if (isValidUrl(uri) || /^[\w.-]+\.[a-z]{2,}/i.test(uri)) {
      const fromUrl = extractNameFromUrl(uri)
      if (fromUrl) return fromUrl
    }
    // Fallback to util
    const fallback = extractProfileName(uri)
    if (fallback) return fallback
    return uri
  }

  // Last resort: try util on stringified value
  const asString = String(value || '')
  const utilGuess = extractProfileName(asString)
  return utilGuess || asString
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
    if (subject && typeof subject === 'string' && !subject.includes('http')) {
      credentialName = subject
    }
    const linkedInShareUrl = generateLinkedInShareUrl(credentialName, currentUrl)
    window.open(linkedInShareUrl, '_blank')
    handleClose()
  }

  const getDisplayText = () => {
    if ((claim as Claim)?.type === 'credential') {
      return subject
    }
    return name || subject
  }

  /** UPDATED: robust extraction for the field/skill line */
  const recipientNameRaw = getDisplayText()
  const recipientName = deriveDisplayNameFromAny(recipientNameRaw)

  /** Recipient name with improved fallback (keeps your original preferences first) */
  const skillName =
    ((subject as any)?.name && String((subject as any)?.name).trim()) ||
    (subject_name ? String(subject_name).trim() : '') ||
    (name && String(name).trim()) ||
    ((claim as any)?.name && String((claim as any)?.name).trim()) ||
    deriveDisplayNameFromAny(subject) ||
    extractProfileName(((typeof subject === 'string' ? subject : (subject as any)?.uri) || '').trim()) ||
    (((typeof subject === 'string' ? subject : (subject as any)?.uri) || '').trim())

  const containerMaxWidth = isXl ? 'xl' : 'lg'
  const visibleValidationCount = getVisibleValidationCount(isXs, isSm, isMd)

  return (
    <Container
      maxWidth={containerMaxWidth}
      sx={{ py: { xs: 2, sm: 3, md: 4 }, px: { xs: 1, sm: 2, md: 3 } }}
    >
      <Card
        sx={{
          ...cardStyles,
          border: `6px double ${COLORS.primary}`,
          borderRadius: 16,
          overflow: 'hidden',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 14,
            borderRadius: 12,
            border: `1.5px solid ${COLORS.primary}`,
            opacity: 0.5,
            pointerEvents: 'none'
          }
        }}
      >
        <CardContent sx={{ p: { xs: 1.5, sm: 2, md: 3, lg: 4 } }}>
          <Box
            id="certificate-content"
            sx={{
              position: 'relative',
              px: { xs: 1, sm: 2, md: 3, lg: 4 },
              py: { xs: 1, sm: 1.5, md: 2 },
              backgroundColor: '#fff',
              '@media print': { boxShadow: 'none', borderRadius: 0 }
            }}
          >
            {/* watermark */}
            <Box
              aria-hidden
              sx={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: 0.04,
                zIndex: 0
              }}
            >
              <Box
                component="img"
                src={badge}
                alt=""
                sx={{
                  width: { xs: '65%', sm: '50%', md: '42%' },
                  maxWidth: 420,
                  filter: 'grayscale(20%)'
                }}
              />
            </Box>

            {/* content layer */}
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Box
                component="img"
                src={badge}
                alt="Certificate Badge"
                sx={{
                  ...badgeStyles,
                  display: 'block',
                  mx: 'auto',
                  mb: { xs: 1, sm: 1.5, md: 2 },
                  filter: 'drop-shadow(0px 4px 8px rgba(0,0,0,.12))'
                }}
              />

              <Typography variant="h4" sx={{ ...titleStyles, fontWeight: 800 }}>
                Certificate
              </Typography>

              <Typography
                variant="h6"
                sx={{
                  ...subtitleStyles,
                  letterSpacing: '0.18em',
                  opacity: 0.9
                }}
              >
                OF SKILL VALIDATION
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  textAlign: 'center',
                  mt: { xs: 1, sm: 1.5 },
                  mb: { xs: 1, sm: 1.5 },
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  color: COLORS.text.secondary
                }}
              >
                This is to certify that
              </Typography>
              {recipientName && (
                <Typography
                  variant="h4"
                  sx={{
                    textAlign: 'center',
                    fontFamily: 'Allison, cursive',
                    fontSize: { xs: '24px', sm: '28px', md: '32px' },
                    lineHeight: 1.2,
                    color: COLORS.text.primary,
                    mb: { xs: 1.5, sm: 2 }
                  }}
                >
                  {recipientName}
                </Typography>
              )}

              
              <Typography
                variant="subtitle1"
                sx={{
                  textAlign: 'center',
                  fontStyle: 'italic',
                  color: COLORS.text.secondary,
                  mb: { xs: 0.5, sm: 1 }
                }}
              >
                has been validated in
              </Typography>
              <Typography
                variant="h3"
                sx={{
                  fontSize: { xs: '24px', sm: '28px', md: '32px', lg: '36px' },
                  fontFamily: 'Allison, cursive',
                  fontWeight: 600,
                  textAlign: 'center',
                  color: COLORS.primary,
                  mb: { xs: 1, sm: 1.5 }
                }}
              >
                {skillName}
              </Typography>

             

              {issuer_name && (
                <Typography
                  variant="body2"
                  sx={{ textAlign: 'center', color: COLORS.text.secondary, mb: { xs: 1.5, sm: 2 } }}
                >
                  Issued by <strong>{issuer_name}</strong>
                </Typography>
              )}

              <Typography
                sx={{
                  fontFamily: 'Roboto, sans-serif',
                  fontSize: { xs: '14px', sm: '15px', md: '16px' },
                  color: COLORS.text.primary,
                  textAlign: 'center',
                  maxWidth: { xs: '100%', sm: '90%', md: '80%', lg: '70%' },
                  m: '0 auto',
                  lineHeight: 1.6,
                  mb: { xs: 2, sm: 3, md: 4 },
                  px: { xs: 0.5, sm: 1, md: 0 }
                }}
              >
                {statement || 'This certificate validates the skills and expertise demonstrated by the recipient.'}
              </Typography>

              {isValidUrl(sourceURI || '') && (
                <Typography
                  variant="body2"
                  sx={{ textAlign: 'center', color: COLORS.text.secondary, mb: { xs: 2, sm: 2.5 } }}
                >
                  Source:{' '}
                  <MuiLink href={sourceURI as string} target="_blank" rel="noopener" sx={{ color: COLORS.primary }}>
                    {sourceURI}
                  </MuiLink>
                </Typography>
              )}

              {/* <CertificateMedia image={image} /> */}

              {validations && validations.length > 0 && (
                <Box sx={{ width: '100%', mt: { xs: 2, sm: 3, md: 4 } }}>
                  <Typography
                    variant="h6"
                    color={COLORS.text.primary}
                    textAlign="center"
                    mb={{ xs: 2, sm: 2.5, md: 3 }}
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
                      mx: 'auto'
                    }}
                  >
                    {validations.slice(0, visibleValidationCount).map((validation: Validation, index: number) => (
                      <Card key={index} sx={validationCardStyles} onClick={() => handleClaimClick(validation)}>
                        <Typography
                          variant="body2"
                          color={COLORS.primary}
                          fontSize={{ xs: 18, sm: 20 }}
                          mb={1.5}
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
                          variant="body2"
                          color={COLORS.text.primary}
                          fontSize={{ xs: 14, sm: 16 }}
                          sx={{
                            flexGrow: 1,
                            overflow: 'hidden',
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                            mb: 3.5
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
                            p: 0,
                            minWidth: 'auto',
                            textDecoration: 'none'
                          }}
                        >
                          See all
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
                          '&:hover': { backgroundColor: COLORS.background.hover }
                        }}
                      >
                        See more validations ({validations.length - visibleValidationCount} more)
                      </Button>
                    </Box>
                  )}
                </Box>
              )}

              {(effectiveDate || claimId) && (
                <Box
                  sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'baseline',
                    gap: 1.5,
                    mt: { xs: 2, sm: 2.5, md: 3 }
                  }}
                >
                  {effectiveDate && (
                    <Typography
                      variant="body2"
                      color={COLORS.text.secondary}
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
                    <Typography
                      variant="body2"
                      color={COLORS.text.secondary}
                      fontSize={{ xs: '12px', sm: '13px', md: '14px' }}
                      sx={{ ml: { xs: 0, sm: 'auto' } }}
                    >
                      Verification ID:{' '}
                      <MuiLink
                        href={`/certificate/${claimId}`}
                        onClick={e => {
                          e.preventDefault()
                          window.location.href = `/certificate/${claimId}`
                        }}
                        sx={{
                          color: COLORS.primary,
                          textDecoration: 'none',
                          wordBreak: 'break-all',
                          '&:hover': { textDecoration: 'underline' }
                        }}
                      >
                        {claimId}
                      </MuiLink>
                    </Typography>
                  )}
                </Box>
              )}
            </Box>
          </Box>
        </CardContent>

        <Divider />

        {/* Actions */}
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 2,
            m: '0 auto',
            p: { xs: 2, sm: 2.5, md: 3 }
          }}
        >
          <Box onClick={handleExport} sx={actionButtonStyles}>
            <SystemUpdateAltIcon sx={{ color: COLORS.primary }} />
            <Typography variant="body2" sx={{ color: COLORS.primary, whiteSpace: 'nowrap' }}>
              Export Certificate
            </Typography>
          </Box>

          <Box onClick={handleShareClick} sx={actionButtonStyles}>
            <ShareIcon sx={{ color: COLORS.primary }} />
            <Typography variant="body2" sx={{ color: COLORS.primary, whiteSpace: 'nowrap' }}>
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
          message="Link copied to clipboard!"
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
