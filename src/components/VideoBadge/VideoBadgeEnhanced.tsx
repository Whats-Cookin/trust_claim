import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Card,
  Chip,
  CircularProgress,
  Alert,
  Link,
  Avatar,
  Rating,
  Stack,
  alpha,
  keyframes
} from '@mui/material'
import VerifiedIcon from '@mui/icons-material/Verified'
import PlayCircleFilledIcon from '@mui/icons-material/PlayCircleFilled'
import * as api from '../../api'
import { Claim } from '../../api/types'
import { BACKEND_BASE_URL } from '../../utils/settings'

interface VideoBadgeProps {
  claimUri: string
  compact?: boolean
  theme?: 'light' | 'dark'
}

interface ValidationData {
  id: number
  isValid: boolean
  confidence: number
  statement?: string
  issuerName: string
  createdAt: string
}

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
`

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
`

const VideoBadgeEnhanced: React.FC<VideoBadgeProps> = ({
  claimUri,
  compact = false,
  theme: themeMode = 'light'
}) => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [claim, setClaim] = useState<Claim | null>(null)
  const [validations, setValidations] = useState<ValidationData[]>([])
  const [videoPlaying, setVideoPlaying] = useState(false)
  const [isHoveringVideo, setIsHoveringVideo] = useState(false)

  const getClaimIdFromUri = (uri: string): string | null => {
    try {
      const match = uri.match(/\/claims\/(\d+)/)
      if (match) return match[1]
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
        setLoading(false)
        setError(null)

        const claimRes = await api.getClaim(claimId)
        setClaim(claimRes.data.claim)

        try {
          const reportRes = await api.getClaimReport(Number(claimId))
          if (reportRes.data?.validations) {
            setValidations(reportRes.data.validations)
          }
        } catch (e) {
          // No validations
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

  // Theme colors
  const colors = {
    bg: themeMode === 'dark' ? alpha('#1a1a1a', 0.95) : alpha('#ffffff', 0.98),
    text: {
      primary: themeMode === 'dark' ? '#ffffff' : '#1a1a1a',
      secondary: themeMode === 'dark' ? '#cccccc' : '#666666',
      tertiary: themeMode === 'dark' ? '#999999' : '#999999'
    },
    border: themeMode === 'dark' ? alpha('#fff', 0.1) : alpha('#000', 0.08),
    verified: '#10B981',
    stars: '#FFC107',
    link: themeMode === 'dark' ? '#60A5FA' : '#2563EB'
  }

  // Responsive sizes
  const sizes = compact ? {
    maxWidth: 320,
    padding: 2,
    videoHeight: '180px',
    avatarSize: 36,
    starSize: 'medium' as const,
    statementSize: '1rem',
    nameSize: '0.85rem',
    playIconSize: 64
  } : {
    maxWidth: 600,
    padding: 3,
    videoHeight: '350px',
    avatarSize: 48,
    starSize: 'large' as const,
    statementSize: '1.25rem',
    nameSize: '0.95rem',
    playIconSize: 80
  }

  if (loading) {
    return (
      <Card
        sx={{
          maxWidth: sizes.maxWidth,
          p: sizes.padding,
          textAlign: 'center',
          backgroundColor: colors.bg,
          animation: `${pulse} 1.5s ease-in-out infinite`
        }}
      >
        <CircularProgress size={40} sx={{ color: colors.link }} />
        <Typography variant='body2' sx={{ mt: 2, color: colors.text.secondary }}>
          Loading endorsement...
        </Typography>
      </Card>
    )
  }

  if (error || !claim) {
    return (
      <Card sx={{ maxWidth: sizes.maxWidth, backgroundColor: colors.bg }}>
        <Alert severity='error'>{error || 'Claim not found'}</Alert>
      </Card>
    )
  }

  // Get video from claim.image field
  const videoUrl = claim.image && claim.image.includes('video') ? claim.image : null
  const hasVideo = !!videoUrl
  const isRated = claim.claim === 'RATED'
  const stars = claim.stars || 0
  const issuerName = typeof claim.subject === 'object' ? claim.subject.name : undefined
  const issuerImage = typeof claim.subject === 'object' ? claim.subject.image : undefined

  return (
    <Card
      sx={{
        maxWidth: sizes.maxWidth,
        backgroundColor: colors.bg,
        boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
        borderRadius: 3,
        overflow: 'hidden',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        animation: `${fadeIn} 0.3s ease-out`,
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 30px rgba(0,0,0,0.18)'
        }
      }}
    >
      {/* Video Section */}
      {hasVideo && videoUrl && (
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            height: sizes.videoHeight,
            backgroundColor: '#000',
            cursor: videoPlaying ? 'default' : 'pointer',
            overflow: 'hidden'
          }}
          onClick={() => !videoPlaying && setVideoPlaying(true)}
          onMouseEnter={() => setIsHoveringVideo(true)}
          onMouseLeave={() => setIsHoveringVideo(false)}
        >
          {!videoPlaying ? (
            <>
              <video
                src={videoUrl}
                style={{
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
                  backgroundColor: isHoveringVideo ? alpha('#000', 0.5) : alpha('#000', 0.3),
                  transition: 'background-color 0.15s ease-in-out'
                }}
              >
                <PlayCircleFilledIcon
                  sx={{
                    fontSize: sizes.playIconSize,
                    color: 'white',
                    filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.4))',
                    transform: isHoveringVideo ? 'scale(1.1)' : 'scale(1)',
                    transition: 'transform 0.15s ease-in-out'
                  }}
                />
              </Box>
            </>
          ) : (
            <video
              src={videoUrl}
              controls
              autoPlay
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                backgroundColor: '#000'
              }}
            />
          )}
        </Box>
      )}

      {/* Content */}
      <Box sx={{ p: sizes.padding }}>
        {/* Stars for RATED claims */}
        {isRated && stars > 0 && (
          <Box sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Rating
              value={stars}
              readOnly
              precision={0.5}
              size={sizes.starSize}
              sx={{
                '& .MuiRating-iconFilled': {
                  color: colors.stars
                }
              }}
            />
            <Typography
              sx={{
                fontSize: compact ? '1.2rem' : '1.5rem',
                fontWeight: 700,
                color: colors.stars
              }}
            >
              {stars.toFixed(1)}
            </Typography>
          </Box>
        )}

        {/* Statement */}
        {claim.statement && (
          <Typography
            sx={{
              mb: 2.5,
              fontSize: sizes.statementSize,
              fontWeight: 500,
              lineHeight: 1.5,
              color: colors.text.primary,
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}
          >
            "{claim.statement}"
          </Typography>
        )}

        {/* Endorser info */}
        {(issuerName || issuerImage) && (
          <Stack direction='row' spacing={1.5} alignItems='center' sx={{ mb: 2 }}>
            {issuerImage && (
              <Avatar
                src={issuerImage}
                sx={{
                  width: sizes.avatarSize,
                  height: sizes.avatarSize,
                  border: `2px solid ${colors.border}`
                }}
              />
            )}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                sx={{
                  fontWeight: 600,
                  color: colors.text.primary,
                  fontSize: sizes.nameSize,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {issuerName || 'Anonymous'}
              </Typography>
              {claim.effectiveDate && (
                <Typography
                  variant='caption'
                  sx={{
                    color: colors.text.tertiary,
                    fontSize: compact ? '0.7rem' : '0.75rem'
                  }}
                >
                  {new Date(claim.effectiveDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
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
              sx={{
                backgroundColor: alpha(colors.verified, 0.1),
                color: colors.verified,
                fontWeight: 600,
                '& .MuiChip-icon': {
                  color: colors.verified
                }
              }}
            />
          )}
          {claim.aspect && (
            <Chip
              label={claim.aspect.split(':')[1] || claim.aspect}
              size='small'
              variant='outlined'
              sx={{
                color: colors.text.secondary,
                borderColor: colors.border
              }}
            />
          )}
        </Stack>

        {/* Footer */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            pt: 2,
            borderTop: `1px solid ${colors.border}`
          }}
        >
          <Stack direction='row' spacing={0.5} alignItems='center'>
            <VerifiedIcon sx={{ fontSize: 16, color: colors.verified }} />
            <Typography
              variant='caption'
              sx={{
                color: colors.verified,
                fontWeight: 500,
                fontSize: compact ? '0.7rem' : '0.75rem'
              }}
            >
              Verified on LinkedTrust
            </Typography>
          </Stack>
          {claim.id && (
            <Link
              href={`${window.location.origin}/certificate/${claim.id}`}
              target='_blank'
              rel='noopener noreferrer'
              sx={{
                fontSize: compact ? '0.7rem' : '0.75rem',
                color: colors.link,
                textDecoration: 'none',
                fontWeight: 500,
                '&:hover': {
                  textDecoration: 'underline'
                }
              }}
            >
              View Full Claim →
            </Link>
          )}
        </Box>
      </Box>
    </Card>
  )
}

export default VideoBadgeEnhanced
