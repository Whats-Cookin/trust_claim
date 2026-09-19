import React, { useEffect, useState } from 'react'
import * as api from '../../api'
import { Link as RouterLink, useParams } from 'react-router-dom'
import { BACKEND_BASE_URL } from '../../utils/settings'
import {
  Typography,
  CircularProgress,
  Box,
  Stack,
  Avatar,
  styled,
  Alert,
  AlertTitle,
  Button,
  GlobalStyles
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import PrintIcon from '@mui/icons-material/Print'
import type { Claim } from '../../api/types'
import { linkedTrustTheme, neutralColors, uiColors } from '../../theme/colors'

// Document tokens: the page renders as an A4 sheet on screen and prints as one
const doc = linkedTrustTheme.document
const radius = linkedTrustTheme.borderRadius

// Only while this page is mounted: hide the app chrome when printing and set the paper size
const printStyles = (
  <GlobalStyles
    styles={{
      '@page': { size: 'A4', margin: doc.pageMargin },
      '@media print': {
        'header.MuiAppBar-root, .MuiDrawer-root, .MuiBottomNavigation-root': { display: 'none !important' },
        'html, body, #root': { backgroundColor: neutralColors.white, overflow: 'visible' },
        main: {
          overflow: 'visible !important',
          minHeight: '0 !important',
          backgroundColor: `${neutralColors.white} !important`
        },
        'main > *': { paddingTop: '0 !important' },
        p: { orphans: 3, widows: 3 }
      }
    }}
  />
)

const PageContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  minHeight: '100vh',
  backgroundColor: theme.palette.background.default,
  padding: theme.spacing(3),
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1.5),
    paddingBottom: theme.spacing(10) // clears the fixed bottom nav
  },
  '@media print': { padding: 0, minHeight: 0, backgroundColor: neutralColors.white }
}))

const Toolbar = styled(Box)(({ theme }) => ({
  maxWidth: doc.pageWidth,
  margin: '0 auto',
  display: 'flex',
  justifyContent: 'flex-end',
  marginBottom: theme.spacing(1.5),
  '@media print': { display: 'none' }
}))

const Sheet = styled('article')(({ theme }) => ({
  maxWidth: doc.pageWidth,
  margin: '0 auto',
  padding: theme.spacing(6),
  backgroundColor: uiColors.cardBg,
  color: uiColors.textPrimary,
  border: `1px solid ${uiColors.border}`,
  borderRadius: radius.md,
  boxShadow: linkedTrustTheme.shadows.md,
  fontFamily: theme.typography.fontFamily,
  fontSize: theme.typography.body1.fontSize,
  fontWeight: theme.typography.body1.fontWeight,
  lineHeight: theme.typography.body1.lineHeight,
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2.5)
  },
  '@media print': {
    maxWidth: 'none',
    margin: 0,
    padding: 0,
    border: 'none',
    borderRadius: 0,
    boxShadow: 'none'
  }
}))

const DocSection = styled('section')(({ theme }) => ({
  marginTop: theme.spacing(4),
  '& h2': { breakAfter: 'avoid' }
}))

const SectionHeading = styled(Typography)<{ component?: React.ElementType }>(({ theme }) => ({
  paddingBottom: theme.spacing(1),
  marginBottom: theme.spacing(2),
  borderBottom: `1px solid ${uiColors.border}`
}))

const Item = styled('li')(({ theme }) => ({
  breakInside: 'avoid',
  '&::marker': { color: uiColors.textMuted, fontSize: theme.typography.caption.fontSize },
  paddingBottom: theme.spacing(2),
  marginBottom: theme.spacing(2),
  borderBottom: `1px solid ${uiColors.border}`,
  '&:last-child': { borderBottom: 'none', marginBottom: 0, paddingBottom: 0 }
}))

const Meta = styled(Typography)<{ component?: React.ElementType }>({
  color: uiColors.textMuted
})

const linkStyle = {
  color: uiColors.linkText,
  textDecoration: 'underline',
  overflowWrap: 'anywhere'
} as const
const DocLink = styled('a')(linkStyle)
const DocRouterLink = styled(RouterLink)(linkStyle)

const MediaImage = styled('img')({
  display: 'block',
  width: '100%',
  maxWidth: doc.imageMaxWidth,
  height: 'auto',
  borderRadius: radius.md,
  border: `1px solid ${uiColors.border}`
})

const MediaVideo = styled('video')({
  display: 'block',
  width: '100%',
  maxWidth: doc.videoMaxWidth,
  aspectRatio: '16/9',
  backgroundColor: neutralColors.gray[100],
  borderRadius: radius.md,
  border: `1px solid ${uiColors.border}`
})

// Claim types are stored as enums (CRUELTY_FREE_STATUS); print them as words
const humanize = (value?: string): string =>
  value
    ? value
        .replace(/_/g, ' ')
        .toLowerCase()
        .replace(/^./, c => c.toUpperCase())
    : ''

const formatDate = (value?: string | Date): string =>
  value ? new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : ''

const absoluteUrl = (url: string): string => (url.startsWith('http') ? url : `${BACKEND_BASE_URL}${url}`)

interface SubjectNode {
  name: string
  nodeUri?: string
  entType?: string
  descrip?: string
  image?: string
}

interface ValidationMedia {
  id: number
  url: string
  type: 'image' | 'video'
}

interface ValidationItem {
  id: string | number
  statement?: string
  effectiveDate?: string
  source_link?: string
  sourceURI?: string
  image?: string
  videoUrl?: string
  claim?: string
  issuer_name?: string
  issuerId?: string
  confidence?: number
  stars?: number
  media?: ValidationMedia[]
}

// Helper to detect if a URL is a video
const isVideoUrl = (url?: string): boolean => {
  if (!url) return false
  const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov']
  const lowerUrl = url.toLowerCase()
  return videoExtensions.some(ext => lowerUrl.includes(ext))
}

interface RelatedClaim {
  id: string | number
  claim: string
  statement?: string
  effectiveDate?: string
  source_link?: string
  sourceURI?: string
  stars?: number
}

interface ExtendedClaim extends Claim {
  subjectNode?: SubjectNode
}

interface ClaimReportData {
  claim: ExtendedClaim
  image?: string
  subjectNode?: SubjectNode
  validations: ValidationItem[]
  attestations: ValidationItem[]
  relatedClaims?: RelatedClaim[]
  images?: Array<{
    id: number
    url: string
    metadata: any
    effectiveDate: string
  }>
}

const ClaimReport: React.FC = () => {
  const { claimId } = useParams<{ claimId: string }>()
  const [reportData, setReportData] = useState<ClaimReportData | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    const fetchReportData = async () => {
      if (!claimId) {
        setError('No claim ID provided')
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        const response = await api.getClaimReport(claimId)

        if (!response?.data) {
          throw new Error('No data received from server')
        }

        const rawData = response.data as unknown as ClaimReportData

        // Debug: Log the complete API response structure
        console.log('📋 Complete ClaimReport API response:', JSON.stringify(response.data, null, 2))
        console.log('📋 Response keys:', Object.keys(response.data))

        // Check if images exist in the response
        console.log('📋 Images in response:', (response.data as any).images)
        console.log('📋 Claim in response:', (response.data as any).claim)

        // Extract first image URL if images exist and add to claim and reportData
        let firstImageUrl: string | undefined = undefined
        if (rawData.images && rawData.images.length > 0) {
          const imageUrl = rawData.images[0].url

          // For now, just use the direct backend URL and we'll handle CORS separately
          firstImageUrl = imageUrl.startsWith('http') ? imageUrl : `${BACKEND_BASE_URL}${imageUrl}`

          console.log('🖼️ Raw image URL from backend:', imageUrl)
          console.log('🖼️ Final image URL to use:', firstImageUrl)

          // Add the image ID for debugging
          console.log('🖼️ Image ID:', rawData.images[0].id)
        } else {
          console.log('🖼️ No images found in response')
          console.log('🖼️ rawData.images:', rawData.images)
        }

        const processedData: ClaimReportData = {
          ...rawData,
          claim: {
            ...rawData.claim,
            image: firstImageUrl
          },
          image: firstImageUrl
        }

        setReportData(processedData)
      } catch (err) {
        console.error('Error fetching report data:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch report data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchReportData()
  }, [claimId])

  if (isLoading) {
    return (
      <PageContainer>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '50vh'
          }}
        >
          <CircularProgress size={60} />
        </Box>
      </PageContainer>
    )
  }

  if (error || !reportData) {
    return (
      <PageContainer>
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Alert severity='error' sx={{ mb: 3 }}>
            <AlertTitle>Error</AlertTitle>
            {error || 'Report data is not available.'}
          </Alert>
          <RouterLink to='/feed' style={{ textDecoration: 'none' }}>
            <Button variant='outlined' startIcon={<ArrowBackIcon />}>
              Back to Feed
            </Button>
          </RouterLink>
        </Box>
      </PageContainer>
    )
  }

  const { claim, validations, attestations, relatedClaims, subjectNode } = reportData

  // Get subject info
  const subjectName = (reportData as any)?.subject?.name || subjectNode?.name || claim.subjectNode?.name
  const subjectType = subjectNode?.entType || claim.subjectNode?.entType
  const subjectUri =
    subjectNode?.nodeUri ||
    claim.subjectNode?.nodeUri ||
    (typeof claim.subject === 'object' ? claim.subject.uri : claim.subject)
  const subjectDescrip = subjectNode?.descrip || claim.subjectNode?.descrip
  const subjectImage = subjectNode?.image || claim.subjectNode?.image

  const claimAny = claim as any
  const issuer: string | undefined = claimAny.issuerId
  const confidence: number | undefined = claimAny.confidence
  const claimAddress: string | undefined = claimAny.claimAddress
  const reportUrl = `${window.location.origin}/report/${claim.id ?? claimId}`
  const printedOn = formatDate(new Date())

  const titleFacts: Array<[string, React.ReactNode]> = []
  if (claim.effectiveDate) titleFacts.push(['Date', formatDate(claim.effectiveDate)])
  if (issuer) titleFacts.push(['Issued by', <DocLink href={issuer}>{issuer}</DocLink>])
  if (claim.howKnown) titleFacts.push(['How known', humanize(claim.howKnown)])
  if (typeof confidence === 'number') titleFacts.push(['Confidence', `${Math.round(confidence * 100)}%`])
  if (claim.stars) titleFacts.push(['Rating', `${claim.stars} of 5 stars`])
  if (subjectUri) titleFacts.push(['Subject', <DocLink href={subjectUri}>{subjectUri}</DocLink>])
  if (claimAddress) titleFacts.push(['Record', claimAddress])

  const evidenceMedia = (item: ValidationItem): ValidationMedia[] => {
    if (item.media && item.media.length > 0) return item.media
    const legacyUrl = item.videoUrl || item.image
    if (!legacyUrl) return []
    return [{ id: 0, url: legacyUrl, type: item.videoUrl || isVideoUrl(item.image) ? 'video' : 'image' }]
  }

  const renderEvidence = (items: ValidationItem[], fallbackLabel: string, keyPrefix: string) => (
    <Box component='ol' sx={{ pl: 3, m: 0 }}>
      {items.map((item, index) => {
        const source = item.sourceURI || item.source_link
        const by = item.issuer_name || item.issuerId
        return (
          <Item key={item.id || `${keyPrefix}-${index}`}>
            <Meta variant='caption' component='p'>
              {humanize(item.claim) || fallbackLabel}
              {item.effectiveDate && ` · ${formatDate(item.effectiveDate)}`}
              {by && ` · ${by}`}
              {item.stars ? ` · ${item.stars} of 5 stars` : ''}
            </Meta>
            {item.statement && (
              <Typography variant='inherit' component='p' sx={{ mt: 0.5 }}>
                {item.statement}
              </Typography>
            )}
            {evidenceMedia(item).map((m, mi) => (
              <Box key={m.id || mi} sx={{ mt: 1.5 }}>
                {m.type === 'video' ? (
                  <MediaVideo src={absoluteUrl(m.url)} controls preload='metadata' />
                ) : (
                  <MediaImage src={absoluteUrl(m.url)} alt='' />
                )}
              </Box>
            ))}
            {source && (
              <Meta variant='caption' component='p' sx={{ mt: 1 }}>
                Source: <DocLink href={source}>{source}</DocLink>
              </Meta>
            )}
          </Item>
        )
      })}
    </Box>
  )

  return (
    <PageContainer>
      {printStyles}

      <Toolbar>
        <Button variant='outlined' size='small' startIcon={<PrintIcon />} onClick={() => window.print()}>
          Print / save as PDF
        </Button>
      </Toolbar>

      <Sheet>
        {/* Title block: who the claim is about, when, who issued it */}
        <Box component='header'>
          <Meta variant='overline' component='p'>
            Evidence report · {humanize(claim.claim) || 'Claim'}
          </Meta>
          <Stack direction='row' spacing={2} alignItems='flex-start'>
            {subjectImage && <Avatar src={subjectImage} sx={{ width: 56, height: 56 }} />}
            <Box>
              <Typography variant='h4' component='h1'>
                {subjectName || 'Unknown Subject'}
              </Typography>
              {subjectType && <Meta variant='body2'>{humanize(subjectType)}</Meta>}
              {subjectDescrip && (
                <Typography variant='inherit' component='p' sx={{ mt: 0.5 }}>
                  {subjectDescrip}
                </Typography>
              )}
            </Box>
          </Stack>

          <Box
            component='dl'
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'max-content 1fr' },
              columnGap: 3,
              rowGap: 0.5,
              mt: 3,
              mb: 0
            }}
          >
            {titleFacts.map(([label, value]) => (
              <React.Fragment key={label}>
                <Meta variant='body2' component='dt'>
                  {label}
                </Meta>
                <Typography variant='body2' component='dd' sx={{ m: 0, overflowWrap: 'anywhere' }}>
                  {value}
                </Typography>
              </React.Fragment>
            ))}
          </Box>
        </Box>

        {/* The claim statement */}
        <DocSection>
          <SectionHeading variant='h6' component='h2'>
            Statement
          </SectionHeading>
          {claim.statement && (
            <Typography variant='inherit' component='blockquote' sx={{ m: 0 }}>
              "{claim.statement}"
            </Typography>
          )}
          {reportData.image && (
            <Box sx={{ mt: 2 }}>
              {isVideoUrl(reportData.image) ? (
                <MediaVideo src={reportData.image} controls />
              ) : (
                <MediaImage src={reportData.image} alt='' />
              )}
            </Box>
          )}
          {claim.sourceURI && (
            <Meta variant='body2' component='p' sx={{ mt: 2 }}>
              Source: <DocLink href={claim.sourceURI}>{claim.sourceURI}</DocLink>
            </Meta>
          )}
        </DocSection>

        {/* Evidence: validations, then attestations, as numbered items */}
        {validations && validations.length > 0 && (
          <DocSection>
            <SectionHeading variant='h6' component='h2'>
              Validations ({validations.length})
            </SectionHeading>
            {renderEvidence(validations, 'Validated', 'validation')}
          </DocSection>
        )}

        {attestations && attestations.length > 0 && (
          <DocSection>
            <SectionHeading variant='h6' component='h2'>
              Attestations ({attestations.length})
            </SectionHeading>
            {renderEvidence(attestations, 'Attestation', 'attestation')}
          </DocSection>
        )}

        {/* Appendix: other claims about the same subject */}
        {relatedClaims && relatedClaims.length > 0 && (
          <DocSection>
            <SectionHeading variant='h6' component='h2'>
              Appendix: related claims ({relatedClaims.length})
            </SectionHeading>
            <Box component='ol' sx={{ pl: 3, m: 0 }}>
              {relatedClaims.map((relatedClaim, index) => (
                <Item key={relatedClaim.id || `related-${index}`}>
                  <Meta variant='caption' component='p'>
                    {humanize(relatedClaim.claim) || 'Claim'}
                    {relatedClaim.effectiveDate && ` · ${formatDate(relatedClaim.effectiveDate)}`}
                    {relatedClaim.stars ? ` · ${relatedClaim.stars} of 5 stars` : ''}
                  </Meta>
                  {relatedClaim.statement && (
                    <Typography
                      variant='inherit'
                      component='p'
                      sx={{
                        mt: 0.5,
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: 4,
                        WebkitBoxOrient: 'vertical',
                        '@media print': { display: 'block' }
                      }}
                    >
                      {relatedClaim.statement}
                    </Typography>
                  )}
                  <Meta variant='caption' component='p' sx={{ mt: 0.5 }}>
                    <DocRouterLink to={`/report/${relatedClaim.id}`}>
                      {`${window.location.origin}/report/${relatedClaim.id}`}
                    </DocRouterLink>
                  </Meta>
                </Item>
              ))}
            </Box>
          </DocSection>
        )}

        {/* Footer: where this document lives and when it was printed */}
        <Box component='footer' sx={{ mt: 5, pt: 2, borderTop: `1px solid ${uiColors.border}`, breakInside: 'avoid' }}>
          <Meta variant='caption' component='p'>
            <DocLink href={reportUrl}>{reportUrl}</DocLink> · Printed {printedOn}
          </Meta>
        </Box>
      </Sheet>
    </PageContainer>
  )
}

export default ClaimReport
