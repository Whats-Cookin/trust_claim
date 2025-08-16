import React, { useEffect, useState } from 'react'
import * as api from '../../api'
import { Link as RouterLink, useParams } from 'react-router-dom'
import {
  Typography,
  CircularProgress,
  Box,
  useTheme,
  useMediaQuery,
  Button,
  Chip,
  Card,
  CardContent,
  Grid,
  Stack,
  Avatar,
  Divider,
  styled,
  IconButton,
  Alert,
  AlertTitle
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import VerifiedIcon from '@mui/icons-material/Verified'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import LinkIcon from '@mui/icons-material/Link'
import StarIcon from '@mui/icons-material/Star'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import BusinessIcon from '@mui/icons-material/Business'
import type { Claim } from '../../api/types'

// Styled Components
const PageContainer = styled(Box)(({ theme }) => ({
  minHeight: 'calc(100vh - 64px)',
  backgroundColor: theme.palette.background.default,
  paddingTop: theme.spacing(2),
  paddingBottom: theme.spacing(6),
  paddingLeft: theme.spacing(3),
  paddingRight: theme.spacing(3),
  width: '100%',
  [theme.breakpoints.down('sm')]: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2)
  },
  [theme.breakpoints.up('lg')]: {
    paddingLeft: theme.spacing(4),
    paddingRight: theme.spacing(4)
  }
}))

const HeaderCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  borderRadius: '20px',
  boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.08)',
  border: `1px solid ${theme.palette.divider}`,
  overflow: 'visible'
}))

const ClaimCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  borderRadius: '16px',
  boxShadow: '0px 2px 12px rgba(0, 0, 0, 0.06)',
  border: `1px solid ${theme.palette.divider}`,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0px 8px 25px rgba(0, 0, 0, 0.12)'
  }
}))

const RelatedClaimCard = styled(Card)(({ theme }) => ({
  borderRadius: '12px',
  boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.04)',
  border: `1px solid ${theme.palette.divider}`,
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    transform: 'translateY(-2px)',
    boxShadow: '0px 8px 20px rgba(0, 0, 0, 0.1)'
  }
}))

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.5rem',
  fontWeight: 600,
  color: theme.palette.text.primary,
  marginBottom: theme.spacing(3),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1)
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
  claim?: string
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

        setReportData(response.data as unknown as ClaimReportData)
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

  return (
    <PageContainer>
      {/* Back Button */}
      <RouterLink to='/feed' style={{ textDecoration: 'none' }}>
        <Button
          startIcon={<ArrowBackIcon />}
          sx={{
            color: theme.palette.text.secondary,
            textTransform: 'none',
            fontWeight: 500,
            marginBottom: 3,
            '&:hover': {
              backgroundColor: 'transparent',
              color: theme.palette.primary.main
            }
          }}
        >
          Back to Feed
        </Button>
      </RouterLink>

      {/* Subject Information Header */}
      {(subjectNode ||
        claim.subjectNode ||
        (claim.subject && typeof claim.subject === 'object' ? claim.subject.uri : claim.subject)) && (
        <HeaderCard elevation={0}>
          <CardContent sx={{ p: 4 }}>
            {subjectNode || claim.subjectNode ? (
              <Stack
                direction={{ xs: 'column', md: 'row' }}
                spacing={3}
                alignItems={{ xs: 'center', md: 'flex-start' }}
              >
                {subjectNode?.image || claim.subjectNode?.image ? (
                  <Avatar
                    src={subjectNode?.image || claim.subjectNode?.image}
                    alt='Subject'
                    sx={{
                      width: 80,
                      height: 80,
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                    }}
                  />
                ) : (
                  <Avatar
                    sx={{
                      width: 80,
                      height: 80,
                      bgcolor: theme.palette.primary.main,
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                    }}
                  >
                    <BusinessIcon sx={{ fontSize: 40 }} />
                  </Avatar>
                )}
                <Box flex={1} sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                  <Typography variant='h4' sx={{ fontWeight: 700, mb: 1 }}>
                    {subjectNode?.name || claim.subjectNode?.name || 'Professional Profile'}
                  </Typography>
                  {(subjectNode?.entType || claim.subjectNode?.entType) && (
                    <Chip
                      label={subjectNode?.entType || claim.subjectNode?.entType}
                      sx={{
                        backgroundColor: theme.palette.primary.main,
                        color: theme.palette.primary.contrastText,
                        fontWeight: 600,
                        mb: 2
                      }}
                    />
                  )}
                  {(subjectNode?.descrip || claim.subjectNode?.descrip) && (
                    <Typography variant='body1' sx={{ color: theme.palette.text.secondary, mb: 2 }}>
                      {subjectNode?.descrip || claim.subjectNode?.descrip}
                    </Typography>
                  )}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      justifyContent: { xs: 'center', md: 'flex-start' }
                    }}
                  >
                    <LinkIcon fontSize='small' sx={{ color: theme.palette.text.secondary }} />
                    <Typography
                      component='a'
                      href={
                        subjectNode?.nodeUri ||
                        claim.subjectNode?.nodeUri ||
                        (typeof claim.subject === 'object' ? claim.subject.uri : claim.subject)
                      }
                      target='_blank'
                      rel='noopener noreferrer'
                      variant='body2'
                      sx={{
                        color: theme.palette.primary.main,
                        textDecoration: 'none',
                        '&:hover': { textDecoration: 'underline' }
                      }}
                    >
                      {subjectNode?.nodeUri ||
                        claim.subjectNode?.nodeUri ||
                        (typeof claim.subject === 'object' ? claim.subject.uri : claim.subject)}
                    </Typography>
                    <IconButton
                      size='small'
                      component='a'
                      href={
                        subjectNode?.nodeUri ||
                        claim.subjectNode?.nodeUri ||
                        (typeof claim.subject === 'object' ? claim.subject.uri : claim.subject)
                      }
                      target='_blank'
                      rel='noopener noreferrer'
                    >
                      <OpenInNewIcon fontSize='small' />
                    </IconButton>
                  </Box>
                </Box>
              </Stack>
            ) : (
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant='h6' sx={{ fontWeight: 500, mb: 1, color: theme.palette.text.secondary }}>
                  Report about:
                </Typography>
                <Typography variant='h4' sx={{ fontWeight: 700, mb: 2 }}>
                  Professional Profile
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
                  <LinkIcon fontSize='small' sx={{ color: theme.palette.text.secondary }} />
                  <Typography
                    component='a'
                    href={typeof claim.subject === 'object' ? claim.subject.uri : claim.subject}
                    target='_blank'
                    rel='noopener noreferrer'
                    variant='body1'
                    sx={{
                      color: theme.palette.primary.main,
                      textDecoration: 'none',
                      '&:hover': { textDecoration: 'underline' }
                    }}
                  >
                    {typeof claim.subject === 'object' ? claim.subject.uri : claim.subject}
                  </Typography>
                  <IconButton
                    size='small'
                    component='a'
                    href={typeof claim.subject === 'object' ? claim.subject.uri : claim.subject}
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    <OpenInNewIcon fontSize='small' />
                  </IconButton>
                </Box>
              </Box>
            )}
          </CardContent>
        </HeaderCard>
      )}

      {/* Main Claim */}
      <ClaimCard elevation={0}>
        <CardContent sx={{ p: 4 }}>
          <Stack spacing={3}>
            <Box>
              <Typography variant='h5' sx={{ fontWeight: 600, mb: 2, textTransform: 'capitalize' }}>
                {claim.claim || 'Professional Assessment'}
              </Typography>

              <Stack direction='row' spacing={1} sx={{ mb: 3, flexWrap: 'wrap', gap: 1 }}>
                {claim.effectiveDate && (
                  <Chip
                    icon={<CalendarTodayIcon />}
                    label={new Date(claim.effectiveDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                    variant='outlined'
                    color='primary'
                  />
                )}
                {claim.howKnown && (
                  <Chip label={claim.howKnown.replace(/_/g, ' ').toLowerCase()} variant='outlined' color='info' />
                )}
                {claim.confidence && (
                  <Chip
                    icon={<VerifiedIcon />}
                    label={`${Math.round(claim.confidence * 100)}% confidence`}
                    variant='filled'
                    color='success'
                  />
                )}
              </Stack>
            </Box>

            {claim.statement && (
              <Box>
                <Typography
                  variant='body1'
                  sx={{
                    lineHeight: 1.7,
                    color: theme.palette.text.primary,
                    fontSize: '1.1rem',
                    backgroundColor: theme.palette.action.hover,
                    padding: 3,
                    borderRadius: 2,
                    borderLeft: `4px solid ${theme.palette.primary.main}`
                  }}
                >
                  {claim.statement}
                </Typography>
              </Box>
            )}

            {reportData.image && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <img
                  src={reportData.image}
                  alt='Claim'
                  style={{
                    width: '100%',
                    maxWidth: '600px',
                    height: '100%',
                    minHeight: '100%',
                    objectFit: 'cover',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                  }}
                />
              </Box>
            )}

            {claim.sourceURI && (
              <Box sx={{ pt: 3, borderTop: `1px solid ${theme.palette.divider}` }}>
                <Typography variant='subtitle2' sx={{ color: theme.palette.text.secondary, mb: 1 }}>
                  Source Information:
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LinkIcon fontSize='small' sx={{ color: theme.palette.text.secondary }} />
                  <Typography
                    component='a'
                    href={claim.sourceURI}
                    target='_blank'
                    rel='noopener noreferrer'
                    variant='body2'
                    sx={{
                      color: theme.palette.primary.main,
                      textDecoration: 'none',
                      '&:hover': { textDecoration: 'underline' }
                    }}
                  >
                    {claim.sourceURI}
                  </Typography>
                  <IconButton
                    size='small'
                    component='a'
                    href={claim.sourceURI}
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    <OpenInNewIcon fontSize='small' />
                  </IconButton>
                </Box>
              </Box>
            )}
          </Stack>
        </CardContent>
      </ClaimCard>

      {/* Validations */}
      {validations && validations.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <SectionTitle>
            <VerifiedIcon />
            Validations ({validations.length})
          </SectionTitle>

          <Stack spacing={2}>
            {validations.map((validation, index) => (
              <ClaimCard key={validation.id || `validation-${index}`} elevation={0}>
                <CardContent sx={{ p: 0 }}>
                  <Grid container spacing={0} alignItems='stretch'>
                    {validation.image && (
                      <Grid item xs={12} md={4}>
                        <Box
                          component='img'
                          src={validation.image}
                          alt='Validation'
                          sx={{
                            width: '100%',
                            height: '100%',
                            minHeight: '250px',
                            objectFit: 'cover',
                            borderRadius: { xs: '16px 16px 0 0', md: '16px 0 0 16px' }
                          }}
                        />
                      </Grid>
                    )}
                    <Grid item xs={12} md={validation.image ? 8 : 12}>
                      <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <Stack spacing={2} sx={{ height: '100%' }}>
                          <Box>
                            <Chip
                              label={validation.claim || 'Validation'}
                              sx={{
                                backgroundColor: theme.palette.success.main,
                                color: theme.palette.success.contrastText,
                                fontWeight: 600,
                                mb: 1
                              }}
                            />
                            <Typography variant='caption' sx={{ color: theme.palette.text.secondary, ml: 2 }}>
                              {validation.effectiveDate && new Date(validation.effectiveDate).toLocaleDateString()}
                            </Typography>
                          </Box>

                          {validation.statement && (
                            <Typography variant='body1' sx={{ lineHeight: 1.6, flex: 1 }}>
                              {validation.statement}
                            </Typography>
                          )}

                          {(validation.sourceURI || validation.source_link) && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant='caption' sx={{ color: theme.palette.text.secondary }}>
                                Source:
                              </Typography>
                              <Typography
                                component='a'
                                href={validation.sourceURI || validation.source_link}
                                target='_blank'
                                rel='noopener noreferrer'
                                variant='caption'
                                sx={{
                                  color: theme.palette.primary.main,
                                  textDecoration: 'none',
                                  '&:hover': { textDecoration: 'underline' }
                                }}
                              >
                                {validation.sourceURI || validation.source_link}
                              </Typography>
                              <IconButton
                                size='small'
                                component='a'
                                href={validation.sourceURI || validation.source_link}
                                target='_blank'
                                rel='noopener noreferrer'
                              >
                                <OpenInNewIcon fontSize='inherit' />
                              </IconButton>
                            </Box>
                          )}
                        </Stack>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </ClaimCard>
            ))}
          </Stack>
        </Box>
      )}

      {/* Attestations */}
      {attestations && attestations.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <SectionTitle>Attestations ({attestations.length})</SectionTitle>

          <Stack spacing={2}>
            {attestations.map((attestation, index) => (
              <ClaimCard key={attestation.id || `attestation-${index}`} elevation={0}>
                <CardContent sx={{ p: 0 }}>
                  <Grid container spacing={0} alignItems='stretch'>
                    {attestation.image && (
                      <Grid item xs={12} md={4}>
                        <Box
                          component='img'
                          src={attestation.image}
                          alt='Attestation'
                          sx={{
                            width: '100%',
                            height: '100%',
                            minHeight: '250px',
                            objectFit: 'cover',
                            borderRadius: { xs: '16px 16px 0 0', md: '16px 0 0 16px' }
                          }}
                        />
                      </Grid>
                    )}
                    <Grid item xs={12} md={attestation.image ? 8 : 12}>
                      <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <Stack spacing={2} sx={{ height: '100%' }}>
                          <Box>
                            <Chip
                              label={attestation.claim || 'Attestation'}
                              sx={{
                                backgroundColor: theme.palette.success.main,
                                color: theme.palette.success.contrastText,
                                fontWeight: 600,
                                mb: 1
                              }}
                            />
                            <Typography variant='caption' sx={{ color: theme.palette.text.secondary, ml: 2 }}>
                              {attestation.effectiveDate && new Date(attestation.effectiveDate).toLocaleDateString()}
                            </Typography>
                          </Box>

                          {attestation.statement && (
                            <Typography variant='body1' sx={{ lineHeight: 1.6, flex: 1 }}>
                              {attestation.statement}
                            </Typography>
                          )}

                          {(attestation.sourceURI || attestation.source_link) && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant='caption' sx={{ color: theme.palette.text.secondary }}>
                                Source:
                              </Typography>
                              <Typography
                                component='a'
                                href={attestation.sourceURI || attestation.source_link}
                                target='_blank'
                                rel='noopener noreferrer'
                                variant='caption'
                                sx={{
                                  color: theme.palette.primary.main,
                                  textDecoration: 'none',
                                  '&:hover': { textDecoration: 'underline' }
                                }}
                              >
                                {attestation.sourceURI || attestation.source_link}
                              </Typography>
                              <IconButton
                                size='small'
                                component='a'
                                href={attestation.sourceURI || attestation.source_link}
                                target='_blank'
                                rel='noopener noreferrer'
                              >
                                <OpenInNewIcon fontSize='inherit' />
                              </IconButton>
                            </Box>
                          )}
                        </Stack>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </ClaimCard>
            ))}
          </Stack>
        </Box>
      )}

      {/* Related Claims */}
      {relatedClaims && relatedClaims.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <SectionTitle>Related Claims About This Subject</SectionTitle>

          <Grid container spacing={3}>
            {relatedClaims.map((relatedClaim, index) => (
              <Grid item xs={12} md={6} key={relatedClaim.id || `related-${index}`}>
                <RelatedClaimCard elevation={0}>
                  <RouterLink
                    to={`/report/${relatedClaim.id}`}
                    style={{
                      textDecoration: 'none',
                      color: 'inherit',
                      height: '100%',
                      display: 'block'
                    }}
                  >
                    <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Typography
                          variant='h6'
                          sx={{
                            fontWeight: 600,
                            textTransform: 'capitalize',
                            flex: 1
                          }}
                        >
                          {relatedClaim.claim || 'Related Claim'}
                        </Typography>
                        {relatedClaim.stars && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <StarIcon sx={{ color: theme.palette.warning.main, fontSize: '1rem' }} />
                            <Typography variant='caption' sx={{ fontWeight: 600 }}>
                              {relatedClaim.stars}
                            </Typography>
                          </Box>
                        )}
                      </Box>

                      {relatedClaim.statement && (
                        <Typography
                          variant='body2'
                          color='text.secondary'
                          sx={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                            mb: 2,
                            flex: 1,
                            lineHeight: 1.5
                          }}
                        >
                          {relatedClaim.statement}
                        </Typography>
                      )}

                      {relatedClaim.sourceURI && (
                        <Box sx={{ pt: 1, borderTop: `1px solid ${theme.palette.divider}` }}>
                          <Typography
                            variant='caption'
                            sx={{
                              color: theme.palette.text.secondary,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              display: 'block'
                            }}
                          >
                            Source: {relatedClaim.sourceURI}
                          </Typography>
                        </Box>
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
