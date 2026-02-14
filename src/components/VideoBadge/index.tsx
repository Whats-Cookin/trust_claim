import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Chip,
  CircularProgress,
  Alert,
  Link,
  Avatar,
  Rating,
  Stack,
  useTheme,
  alpha
} from '@mui/material'
import VerifiedIcon from '@mui/icons-material/Verified'
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline'
import * as api from '../../api'
import { BACKEND_BASE_URL } from '../../utils/settings'

interface VideoBadgeProps {
  claimUri: string // Decentralized claim URI
  compact?: boolean
  theme?: 'light' | 'dark'
}

interface ClaimData {
  id: number
  claim: string
  statement: string
  subject?: any
  object?: any
  effectiveDate?: string
  stars?: number
  aspect?: string
  images?: Array<{ url: string; metadata?: { type?: string } }>
  issuer?: {
    name?: string
    image?: string
  }
}

interface ValidationData {
  id: number
  statement?: string
  claim: string
}

const VideoBadge: React.FC<VideoBadgeProps> = ({ claimUri, compact = false, theme: themeMode = 'light' }) => {
  const muiTheme = useTheme()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [claim, setClaim] = useState<ClaimData | null>(null)
  const [validations, setValidations] = useState<ValidationData[]>([])
  const [videoPlaying, setVideoPlaying] = useState(false)

  // Extract claim ID from URI
  const getClaimIdFromUri = (uri: string): string | null => {
    try {
      // Handle local URIs like https://live.linkedtrust.us/claims/124446
      const match = uri.match(/\/claims\/(\d+)/)
      if (match) return match[1]

      // Handle other formats - for now, just try to parse as ID
      const lastSegment = uri.split('/').pop()
      return lastSegment || null
    } catch (e) {
      return null
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      const claimId = getClaimIdFromUri(claimUri)
      if (!claimId) {
        setError('Invalid claim URI')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        // Fetch claim data
        const claimRes = await api.getClaim(claimId)
        setClaim(claimRes.data.claim)

        // Fetch validations/endorsements
        try {
          const reportRes = await api.getClaimReport(Number(claimId))
          if (reportRes.data?.validations) {
            setValidations(reportRes.data.validations)
          }
        } catch (e) {
          // No validations yet - not an error
        }
      } catch (err) {
        console.error('Failed to fetch claim:', err)
        setError('Failed to load claim data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [claimUri])

  if (loading) {
    return (
      <Card sx={{ maxWidth: compact ? 300 : 600, p: 3, textAlign: 'center' }}>
        <CircularProgress size={40} />
        <Typography variant='body2' sx={{ mt: 2, color: 'text.secondary' }}>
          Loading endorsement...
        </Typography>
      </Card>
    )
  }

  if (error || !claim) {
    return (
      <Card sx={{ maxWidth: compact ? 300 : 600 }}>
        <CardContent>
          <Alert severity='error'>{error || 'Claim not found'}</Alert>
        </CardContent>
      </Card>
    )
  }

  // Find video in images
  const video = claim.images?.find(img => img.metadata?.type === 'video')
  const hasVideo = !!video
  const isRated = claim.claim === 'RATED'
  const stars = claim.stars || 0

  return (
    <Card
      sx={{
        maxWidth: compact ? 320 : 600,
        backgroundColor: themeMode === 'dark' ? alpha('#1a1a1a', 0.95) : alpha('#ffffff', 0.98),
        color: themeMode === 'dark' ? '#ffffff' : '#000000',
        boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
        borderRadius: 2,
        overflow: 'hidden',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 30px rgba(0,0,0,0.18)'
        }
      }}
    >
      {/* Video Section */}
      {hasVideo && video && (
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            paddingTop: '56.25%', // 16:9 aspect ratio
            backgroundColor: '#000',
            cursor: 'pointer'
          }}
          onClick={() => setVideoPlaying(true)}
        >
          {!videoPlaying ? (
            <>
              <video
                src={video.url}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
                preload='metadata'
              />
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: alpha('#000', 0.3),
                  transition: 'background-color 0.2s',
                  '&:hover': {
                    backgroundColor: alpha('#000', 0.5)
                  }
                }}
              >
                <PlayCircleOutlineIcon
                  sx={{
                    fontSize: 80,
                    color: 'white',
                    filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.4))'
                  }}
                />
              </Box>
            </>
          ) : (
            <video
              src={video.url}
              controls
              autoPlay
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'contain'
              }}
            />
          )}
        </Box>
      )}

      <CardContent sx={{ p: compact ? 2 : 3 }}>
        {/* Stars for RATED claims */}
        {isRated && stars > 0 && (
          <Box sx={{ mb: 2 }}>
            <Rating value={stars} readOnly precision={0.5} size={compact ? 'medium' : 'large'} />
            <Typography
              component='span'
              sx={{
                ml: 1,
                fontSize: compact ? '1.1rem' : '1.3rem',
                fontWeight: 700,
                color: themeMode === 'dark' ? '#FFC107' : '#F57C00'
              }}
            >
              {stars.toFixed(1)}
            </Typography>
          </Box>
        )}

        {/* Statement */}
        <Typography
          variant={compact ? 'body1' : 'h6'}
          sx={{
            mb: 2,
            fontWeight: 500,
            lineHeight: 1.4,
            color: 'inherit'
          }}
        >
          {claim.statement}
        </Typography>

        {/* Issuer info */}
        {claim.issuer && (
          <Stack direction='row' spacing={1.5} alignItems='center' sx={{ mb: 2 }}>
            {claim.issuer.image && (
              <Avatar src={claim.issuer.image} sx={{ width: compact ? 32 : 40, height: compact ? 32 : 40 }} />
            )}
            <Box sx={{ flex: 1 }}>
              <Typography variant='body2' sx={{ fontWeight: 600, color: 'inherit' }}>
                {claim.issuer.name || 'Anonymous'}
              </Typography>
              {claim.effectiveDate && (
                <Typography variant='caption' sx={{ color: themeMode === 'dark' ? '#999' : '#666' }}>
                  {new Date(claim.effectiveDate).toLocaleDateString()}
                </Typography>
              )}
            </Box>
          </Stack>
        )}

        {/* Metadata chips */}
        <Stack direction='row' spacing={1} flexWrap='wrap' sx={{ mb: 2, gap: 1 }}>
          {validations.length > 0 && (
            <Chip
              icon={<VerifiedIcon />}
              label={`${validations.length} endorsement${validations.length > 1 ? 's' : ''}`}
              size='small'
              color='success'
              variant='outlined'
            />
          )}
          {claim.aspect && (
            <Chip
              label={claim.aspect.split(':')[1] || claim.aspect}
              size='small'
              variant='outlined'
              sx={{ color: 'inherit', borderColor: 'currentColor' }}
            />
          )}
        </Stack>

        {/* Verified badge and link */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            pt: 2,
            borderTop: `1px solid ${themeMode === 'dark' ? alpha('#fff', 0.1) : alpha('#000', 0.1)}`
          }}
        >
          <Stack direction='row' spacing={0.5} alignItems='center'>
            <VerifiedIcon sx={{ fontSize: 16, color: '#10B981' }} />
            <Typography variant='caption' sx={{ color: themeMode === 'dark' ? '#10B981' : '#059669' }}>
              Verified on LinkedTrust
            </Typography>
          </Stack>
          {claim.id && (
            <Link
              href={`${BACKEND_BASE_URL}/claims/${claim.id}`}
              target='_blank'
              rel='noopener noreferrer'
              sx={{
                fontSize: '0.75rem',
                color: themeMode === 'dark' ? muiTheme.palette.primary.light : muiTheme.palette.primary.main,
                textDecoration: 'none',
                '&:hover': {
                  textDecoration: 'underline'
                }
              }}
            >
              View Full Claim
            </Link>
          )}
        </Box>
      </CardContent>
    </Card>
  )
}

export default VideoBadge
