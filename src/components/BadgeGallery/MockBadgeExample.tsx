import React, { useState } from 'react'
import {
  Box,
  Typography,
  Card,
  Chip,
  Avatar,
  Rating,
  Stack,
  alpha,
  keyframes
} from '@mui/material'
import VerifiedIcon from '@mui/icons-material/Verified'
import PlayCircleFilledIcon from '@mui/icons-material/PlayCircleFilled'

interface MockBadgeProps {
  compact?: boolean
  theme?: 'light' | 'dark'
  enhanced?: boolean
  hasVideo?: boolean
  hasStars?: boolean
  minimal?: boolean
  horizontal?: boolean
}

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
`

const MockBadgeExample: React.FC<MockBadgeProps> = ({
  compact = false,
  theme: themeMode = 'light',
  enhanced = false,
  hasVideo = true,
  hasStars = true,
  minimal = false,
  horizontal = false
}) => {
  const [videoPlaying, setVideoPlaying] = useState(false)
  const [isHoveringVideo, setIsHoveringVideo] = useState(false)

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
  const sizes = horizontal
    ? {
        maxWidth: 600,
        padding: 1.5,
        videoWidth: '33.333%', // 1/3 of total width
        avatarSize: 32,
        starSize: 'small' as const,
        statementSize: '0.875rem',
        nameSize: '0.8rem',
        playIconSize: 44
      }
    : compact
    ? {
        maxWidth: 320,
        padding: 2,
        videoHeight: '180px',
        avatarSize: 36,
        starSize: 'medium' as const,
        statementSize: '1rem',
        nameSize: '0.85rem',
        playIconSize: 64
      }
    : {
        maxWidth: 600,
        padding: 3,
        videoHeight: '350px',
        avatarSize: 48,
        starSize: 'large' as const,
        statementSize: '1.25rem',
        nameSize: '0.95rem',
        playIconSize: 80
      }

  // Mock data
  const mockStatement = "Sarah transformed our entire design system and delivered exceptional results. Her attention to detail and creative problem-solving made our product stand out in the market."
  const mockName = "Michael Chen"
  const mockDate = "Jan 15, 2026"
  const mockStars = 5
  const mockEndorsements = 12

  if (horizontal && minimal) {
    // Horizontal layout for minimal mode - video is 1/3 width, full height
    return (
      <Card
        sx={{
          maxWidth: sizes.maxWidth,
          backgroundColor: colors.bg,
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
          borderRadius: 2,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'row',
          height: '160px', // Fixed height for consistency
          p: 0, // Remove default padding so video fills full height
          transition: 'transform 0.2s, box-shadow 0.2s',
          cursor: 'pointer',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.12)'
          }
        }}
      >
        {/* Video Section - Left Side (1/3 width, full height) */}
        {hasVideo && (
          <Box
            sx={{
              position: 'relative',
              width: sizes.videoWidth,
              minWidth: sizes.videoWidth,
              height: '100%',
              backgroundColor: '#1a1a2e',
              backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onClick={() => setVideoPlaying(!videoPlaying)}
            onMouseEnter={() => setIsHoveringVideo(true)}
            onMouseLeave={() => setIsHoveringVideo(false)}
          >
            <Box
              sx={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                backgroundColor: alpha('#000', isHoveringVideo ? 0.5 : 0.3),
                transition: 'background-color 0.15s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <PlayCircleFilledIcon
                sx={{
                  fontSize: sizes.playIconSize,
                  color: 'white',
                  filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.4))',
                  transform: isHoveringVideo ? 'scale(1.1)' : 'scale(1)',
                  transition: 'transform 0.15s'
                }}
              />
            </Box>
            <Typography
              sx={{
                color: 'white',
                fontSize: '0.7rem',
                position: 'absolute',
                bottom: 6,
                right: 6,
                backgroundColor: alpha('#000', 0.6),
                px: 0.75,
                py: 0.25,
                borderRadius: 0.5
              }}
            >
              0:45
            </Typography>
          </Box>
        )}

        {/* Content - Right Side */}
        <Box
          sx={{
            p: 2,
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minWidth: 0
          }}
        >
          {/* Stars */}
          {hasStars && (
            <Box sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Rating value={mockStars} readOnly size='small' sx={{ '& .MuiRating-iconFilled': { color: colors.stars } }} />
              <Typography sx={{ fontSize: '0.95rem', fontWeight: 700, color: colors.stars }}>
                {mockStars.toFixed(1)}
              </Typography>
            </Box>
          )}

          {/* Statement */}
          <Typography
            sx={{
              mb: 1.5,
              fontSize: sizes.statementSize,
              fontWeight: 400,
              lineHeight: 1.4,
              color: colors.text.primary,
              flex: 1,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}
          >
            "{mockStatement}"
          </Typography>

          {/* Endorser */}
          <Stack direction='row' spacing={1} alignItems='center'>
            <Avatar sx={{ width: sizes.avatarSize, height: sizes.avatarSize, bgcolor: '#667eea', fontSize: '0.75rem' }}>
              MC
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
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
                {mockName}
              </Typography>
              <Typography variant='caption' sx={{ color: colors.text.tertiary, fontSize: '0.65rem' }}>
                {mockDate}
              </Typography>
            </Box>
          </Stack>
        </Box>
      </Card>
    )
  }

  return (
    <Card
      sx={{
        maxWidth: sizes.maxWidth,
        backgroundColor: colors.bg,
        boxShadow: enhanced ? '0 4px 20px rgba(0,0,0,0.12)' : '0 2px 10px rgba(0,0,0,0.1)',
        borderRadius: enhanced ? 3 : 2,
        overflow: 'hidden',
        transition: enhanced ? 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out' : 'none',
        animation: enhanced ? `${fadeIn} 0.3s ease-out` : 'none',
        '&:hover': enhanced
          ? {
              transform: 'translateY(-4px)',
              boxShadow: '0 8px 30px rgba(0,0,0,0.18)'
            }
          : {}
      }}
    >
      {/* Video Section */}
      {hasVideo && (
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            height: sizes.videoHeight,
            backgroundColor: '#1a1a2e',
            cursor: 'pointer',
            backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onClick={() => setVideoPlaying(!videoPlaying)}
          onMouseEnter={() => setIsHoveringVideo(true)}
          onMouseLeave={() => setIsHoveringVideo(false)}
        >
          {/* Simulated video thumbnail */}
          <Box
            sx={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              backgroundColor: alpha('#000', isHoveringVideo ? 0.5 : 0.3),
              transition: enhanced ? 'background-color 0.15s ease-in-out' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <PlayCircleFilledIcon
              sx={{
                fontSize: sizes.playIconSize,
                color: 'white',
                filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.4))',
                transform: enhanced && isHoveringVideo ? 'scale(1.1)' : 'scale(1)',
                transition: enhanced ? 'transform 0.15s ease-in-out' : 'none'
              }}
            />
          </Box>
          <Typography
            sx={{
              color: 'white',
              fontSize: compact ? '0.7rem' : '0.8rem',
              position: 'absolute',
              bottom: 8,
              right: 8,
              backgroundColor: alpha('#000', 0.6),
              px: 1,
              py: 0.5,
              borderRadius: 1
            }}
          >
            0:45
          </Typography>
        </Box>
      )}

      {/* Content */}
      <Box sx={{ p: sizes.padding }}>
        {minimal ? (
          <>
            {/* Minimal version - just stars, quote, and name */}
            {hasStars && (
              <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Rating
                  value={mockStars}
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
                  {mockStars.toFixed(1)}
                </Typography>
              </Box>
            )}

            {/* Statement */}
            <Typography
              sx={{
                mb: 2,
                fontSize: sizes.statementSize,
                fontWeight: 400,
                lineHeight: 1.6,
                color: colors.text.primary
              }}
            >
              "{mockStatement}"
            </Typography>

            {/* Endorser info - minimal */}
            <Stack direction='row' spacing={1.5} alignItems='center'>
              <Avatar
                sx={{
                  width: sizes.avatarSize,
                  height: sizes.avatarSize,
                  bgcolor: '#667eea'
                }}
              >
                MC
              </Avatar>
              <Box>
                <Typography
                  sx={{
                    fontWeight: 600,
                    color: colors.text.primary,
                    fontSize: sizes.nameSize
                  }}
                >
                  {mockName}
                </Typography>
                <Typography
                  variant='caption'
                  sx={{
                    color: colors.text.tertiary,
                    fontSize: compact ? '0.7rem' : '0.75rem'
                  }}
                >
                  {mockDate}
                </Typography>
              </Box>
            </Stack>
          </>
        ) : (
          <>
            {/* Full version with all metadata */}
            {hasStars && (
              <Box sx={{ mb: enhanced ? 1.5 : 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Rating
                  value={mockStars}
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
                  {mockStars.toFixed(1)}
                </Typography>
              </Box>
            )}

            <Typography
              sx={{
                mb: enhanced ? 2.5 : 2,
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
              "{mockStatement}"
            </Typography>

            <Stack direction='row' spacing={1.5} alignItems='center' sx={{ mb: 2 }}>
              <Avatar
                sx={{
                  width: sizes.avatarSize,
                  height: sizes.avatarSize,
                  border: enhanced ? `2px solid ${colors.border}` : `1px solid ${colors.border}`,
                  bgcolor: '#667eea'
                }}
              >
                MC
              </Avatar>
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
                  {mockName}
                </Typography>
                <Typography
                  variant='caption'
                  sx={{
                    color: colors.text.tertiary,
                    fontSize: compact ? '0.7rem' : '0.75rem'
                  }}
                >
                  {mockDate}
                </Typography>
              </Box>
            </Stack>

            <Stack direction='row' spacing={1} flexWrap='wrap' sx={{ mb: 2, gap: 1 }}>
              <Chip
                icon={<VerifiedIcon />}
                label={`${mockEndorsements} endorsements`}
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
              <Chip
                label='completed'
                size='small'
                variant='outlined'
                sx={{
                  color: colors.text.secondary,
                  borderColor: colors.border
                }}
              />
            </Stack>

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
              <Typography
                sx={{
                  fontSize: compact ? '0.7rem' : '0.75rem',
                  color: colors.link,
                  fontWeight: 500,
                  cursor: 'pointer',
                  '&:hover': {
                    textDecoration: 'underline'
                  }
                }}
              >
                View Full Claim →
              </Typography>
            </Box>
          </>
        )}
      </Box>
    </Card>
  )
}

export default MockBadgeExample
