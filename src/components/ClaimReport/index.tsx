import React, { useEffect, useState } from 'react'
import * as api from '../../api'
import { Link as RouterLink, useParams } from 'react-router-dom'
import { BACKEND_BASE_URL } from '../../utils/settings'
import {
  Typography,
  CircularProgress,
  Box,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  Grid,
  Stack,
  Avatar,
  styled,
  Alert,
  AlertTitle,
  Button
} from '@mui/material'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import type { Claim } from '../../api/types'

// Styled Components - minimal, content-first
const PageContainer = styled(Box)(({ theme }) => ({
  minHeight: 'calc(100vh - 64px)',
  backgroundColor: theme.palette.background.default,
  padding: theme.spacing(2),
  paddingTop: theme.spacing(1),
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1.5)
  }
}))

const Section = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3)
}))

const ValidationCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  borderRadius: 8,
  border: `1px solid ${theme.palette.divider}`,
  boxShadow: 'none'
}))

const RelatedClaimCard = styled(Card)(({ theme }) => ({
  borderRadius: 8,
  border: `1px solid ${theme.palette.divider}`,
  cursor: 'pointer',
  boxShadow: 'none',
  '&:hover': {
    borderColor: theme.palette.primary.main
  }
}))

interface SubjectNode {
  name: string
  nodeUri?: string
  entType?: string
  descrip?: string
  image?: string
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
  const theme = useTheme()
  const { claimId } = useParams<{ claimId: string }>()
  const [reportData, setReportData] = useState<ClaimReportData | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>('')
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

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

  return (
    <PageContainer>
      {/* Subject - who/what this claim is about */}
      <Section>
        <Stack direction='row' spacing={2} alignItems='flex-start'>
          {subjectImage && <Avatar src={subjectImage} sx={{ width: 56, height: 56 }} />}
          <Box>
            <Typography variant='h5' sx={{ fontWeight: 600 }}>
              {subjectName || 'Unknown Subject'}
            </Typography>
            {subjectDescrip && (
              <Typography variant='body2' color='text.secondary' sx={{ mt: 0.5 }}>
                {subjectDescrip}
              </Typography>
            )}
            {subjectUri && (
              <Typography
                component='a'
                href={subjectUri}
                target='_blank'
                rel='noopener noreferrer'
                variant='body2'
                sx={{
                  color: 'primary.main',
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' },
                  display: 'block',
                  mt: 0.5
                }}
              >
                {subjectUri} <OpenInNewIcon sx={{ fontSize: 12, verticalAlign: 'middle' }} />
              </Typography>
            )}
          </Box>
        </Stack>
      </Section>

      {/* The Claim */}
      <Section>
        <ValidationCard elevation={0}>
          <CardContent sx={{ p: 2 }}>
            <Typography variant='overline' color='text.secondary' sx={{ display: 'block', mb: 1 }}>
              {claim.claim || 'Claim'}
              {claim.howKnown && ` · ${claim.howKnown.replace(/_/g, ' ').toLowerCase()}`}
              {claim.effectiveDate && ` · ${new Date(claim.effectiveDate).toLocaleDateString()}`}
            </Typography>

            {claim.statement && (
              <Typography variant='body1' sx={{ lineHeight: 1.7, mb: 2 }}>
                "{claim.statement}"
              </Typography>
            )}

            {reportData.image && (
              <Box sx={{ my: 2 }}>
                {isVideoUrl(reportData.image) ? (
                  <video src={reportData.image} controls style={{ width: '50vw', maxWidth: '100%', borderRadius: 8 }} />
                ) : (
                  <img src={reportData.image} alt='' style={{ width: '50vw', maxWidth: '100%', borderRadius: 8 }} />
                )}
              </Box>
            )}

            {claim.sourceURI && (
              <Typography variant='body2' color='text.secondary'>
                Source:{' '}
                <Typography
                  component='a'
                  href={claim.sourceURI}
                  target='_blank'
                  rel='noopener noreferrer'
                  variant='body2'
                  sx={{ color: 'primary.main' }}
                >
                  {claim.sourceURI}
                </Typography>
              </Typography>
            )}
          </CardContent>
        </ValidationCard>
      </Section>

      {/* Validations */}
      {validations && validations.length > 0 && (
        <Section>
          <Typography variant='h6' sx={{ fontWeight: 600, mb: 2 }}>
            Validations ({validations.length})
          </Typography>

          {validations.map((validation, index) => {
            const hasMedia = validation.image || validation.videoUrl
            const mediaIsVideo = validation.videoUrl || isVideoUrl(validation.image)
            const mediaUrl = validation.videoUrl || validation.image

            return (
              <ValidationCard key={validation.id || `validation-${index}`} elevation={0}>
                <CardContent sx={{ p: 2 }}>
                  <Grid container spacing={2}>
                    {hasMedia && (
                      <Grid item xs={12} sm={5} md={4}>
                        {mediaIsVideo ? (
                          <Box
                            sx={{
                              position: 'relative',
                              width: '100%',
                              aspectRatio: '16/9',
                              borderRadius: '8px',
                              overflow: 'hidden',
                              backgroundColor: theme.palette.mode === 'dark' ? '#1a1a1a' : '#f5f5f5',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                            }}
                          >
                            <video
                              src={mediaUrl}
                              controls
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'contain',
                                display: 'block'
                              }}
                              preload='metadata'
                            />
                          </Box>
                        ) : (
                          <Box
                            sx={{
                              borderRadius: '8px',
                              overflow: 'hidden',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                            }}
                          >
                            <img src={validation.image} alt='' style={{ width: '100%', display: 'block' }} />
                          </Box>
                        )}
                      </Grid>
                    )}
                    <Grid item xs={12} sm={hasMedia ? 7 : 12} md={hasMedia ? 8 : 12}>
                      <Typography variant='caption' color='text.secondary'>
                        {validation.claim || 'validated'}
                        {validation.effectiveDate && ` · ${new Date(validation.effectiveDate).toLocaleDateString()}`}
                      </Typography>
                      {validation.statement && (
                        <Typography variant='body2' sx={{ mt: 0.5 }}>
                          {validation.statement}
                        </Typography>
                      )}
                      {(validation.sourceURI || validation.source_link) && (
                        <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mt: 1 }}>
                          <a
                            href={validation.sourceURI || validation.source_link}
                            target='_blank'
                            rel='noopener noreferrer'
                          >
                            {validation.sourceURI || validation.source_link}
                          </a>
                        </Typography>
                      )}
                    </Grid>
                  </Grid>
                </CardContent>
              </ValidationCard>
            )
          })}
        </Section>
      )}

      {/* Attestations */}
      {attestations && attestations.length > 0 && (
        <Section>
          <Typography variant='h6' sx={{ fontWeight: 600, mb: 2 }}>
            Attestations ({attestations.length})
          </Typography>

          {attestations.map((attestation, index) => {
            const hasMedia = attestation.image || attestation.videoUrl
            const mediaIsVideo = attestation.videoUrl || isVideoUrl(attestation.image)
            const mediaUrl = attestation.videoUrl || attestation.image

            return (
              <ValidationCard key={attestation.id || `attestation-${index}`} elevation={0}>
                <CardContent sx={{ p: 2 }}>
                  <Grid container spacing={2}>
                    {hasMedia && (
                      <Grid item xs={12} sm={5} md={4}>
                        {mediaIsVideo ? (
                          <Box
                            sx={{
                              position: 'relative',
                              width: '100%',
                              aspectRatio: '16/9',
                              borderRadius: '8px',
                              overflow: 'hidden',
                              backgroundColor: theme.palette.mode === 'dark' ? '#1a1a1a' : '#f5f5f5',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                            }}
                          >
                            <video
                              src={mediaUrl}
                              controls
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'contain',
                                display: 'block'
                              }}
                              preload='metadata'
                            />
                          </Box>
                        ) : (
                          <Box
                            sx={{
                              borderRadius: '8px',
                              overflow: 'hidden',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                            }}
                          >
                            <img src={attestation.image} alt='' style={{ width: '100%', display: 'block' }} />
                          </Box>
                        )}
                      </Grid>
                    )}
                    <Grid item xs={12} sm={hasMedia ? 7 : 12} md={hasMedia ? 8 : 12}>
                      <Typography variant='caption' color='text.secondary'>
                        {attestation.claim || 'attestation'}
                        {attestation.effectiveDate && ` · ${new Date(attestation.effectiveDate).toLocaleDateString()}`}
                      </Typography>
                      {attestation.statement && (
                        <Typography variant='body2' sx={{ mt: 0.5 }}>
                          {attestation.statement}
                        </Typography>
                      )}
                      {(attestation.sourceURI || attestation.source_link) && (
                        <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mt: 1 }}>
                          <a
                            href={attestation.sourceURI || attestation.source_link}
                            target='_blank'
                            rel='noopener noreferrer'
                          >
                            {attestation.sourceURI || attestation.source_link}
                          </a>
                        </Typography>
                      )}
                    </Grid>
                  </Grid>
                </CardContent>
              </ValidationCard>
            )
          })}
        </Section>
      )}

      {/* Related Claims */}
      {relatedClaims && relatedClaims.length > 0 && (
        <Box>
          <Typography variant='h6' sx={{ fontWeight: 600, mb: 2 }}>
            Related Claims
          </Typography>

          <Grid container spacing={2}>
            {relatedClaims.map((relatedClaim, index) => (
              <Grid item xs={12} sm={6} key={relatedClaim.id || `related-${index}`}>
                <RelatedClaimCard elevation={0}>
                  <RouterLink
                    to={`/report/${relatedClaim.id}`}
                    style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
                  >
                    <CardContent sx={{ p: 2 }}>
                      <Typography variant='caption' color='text.secondary'>
                        {relatedClaim.claim || 'claim'}
                        {relatedClaim.stars && ` · ${relatedClaim.stars}★`}
                      </Typography>
                      {relatedClaim.statement && (
                        <Typography
                          variant='body2'
                          sx={{
                            mt: 0.5,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 4,
                            WebkitBoxOrient: 'vertical'
                          }}
                        >
                          {relatedClaim.statement}
                        </Typography>
                      )}
                    </CardContent>
                  </RouterLink>
                </RelatedClaimCard>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </PageContainer>
  )
}

export default ClaimReport
