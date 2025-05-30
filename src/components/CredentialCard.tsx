import React from 'react'
import { Card, CardContent, Typography, Box, Chip, Button, IconButton, Avatar } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import VerifiedIcon from '@mui/icons-material/Verified'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import ShareIcon from '@mui/icons-material/Share'
import SchoolIcon from '@mui/icons-material/School'
import WorkIcon from '@mui/icons-material/Work'
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'
import StarIcon from '@mui/icons-material/Star'

interface CredentialCardProps {
  credential: any
  compact?: boolean
  onShare?: () => void
}

export const CredentialCard: React.FC<CredentialCardProps> = ({ credential, compact = false, onShare }) => {
  const navigate = useNavigate()

  // Extract credential data
  const subject = credential.credentialSubject
  const achievement = subject?.achievement?.[0] || subject?.achievement
  const issuer = credential.issuer
  const issuanceDate = credential.issuanceDate
  const skills = achievement?.tag || subject?.skills || []

  // Get achievement type icon and color
  const getAchievementStyle = () => {
    const type = achievement?.type?.[0] || credential.credentialSchema || ''

    if (type.includes('Education') || type.includes('education')) {
      return { icon: <SchoolIcon />, color: '#c1467b', bgColor: '#ffd4e5' }
    }
    if (type.includes('Professional') || type.includes('professional')) {
      return { icon: <WorkIcon />, color: '#4676c1', bgColor: '#d4e5ff' }
    }
    if (type.includes('OpenBadges') || type.includes('achievement')) {
      return { icon: <StarIcon />, color: '#6b46c1', bgColor: '#e3d4ff' }
    }
    return { icon: <EmojiEventsIcon />, color: '#2D6A4F', bgColor: '#cce6ff' }
  }

  const style = getAchievementStyle()

  const handleViewDetails = () => {
    navigate(`/credentials/${encodeURIComponent(credential.id)}`)
  }

  const handleShare = () => {
    if (onShare) {
      onShare()
    } else {
      // Default share implementation
      const shareUrl = `${window.location.origin}/credentials/${encodeURIComponent(credential.id)}`
      if (navigator.share) {
        navigator.share({
          title: achievement?.name || 'Credential',
          text: `Check out this credential: ${achievement?.name}`,
          url: shareUrl
        })
      } else {
        navigator.clipboard.writeText(shareUrl)
      }
    }
  }

  if (compact) {
    // Compact view for lists
    return (
      <Card
        sx={{
          display: 'flex',
          alignItems: 'center',
          p: 2,
          mb: 1,
          cursor: 'pointer',
          transition: 'all 0.2s',
          '&:hover': {
            boxShadow: 3,
            transform: 'translateY(-2px)'
          }
        }}
        onClick={handleViewDetails}
      >
        <Avatar sx={{ bgcolor: style.bgColor, color: style.color, mr: 2 }}>{style.icon}</Avatar>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant='subtitle1' fontWeight={600}>
            {achievement?.name || credential.name || 'Credential'}
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            {issuer?.name || issuer} • {new Date(issuanceDate).toLocaleDateString()}
          </Typography>
        </Box>
        <IconButton
          onClick={e => {
            e.stopPropagation()
            handleShare()
          }}
        >
          <ShareIcon />
        </IconButton>
      </Card>
    )
  }

  // Full card view
  return (
    <Card
      sx={{
        mb: 2,
        transition: 'all 0.2s',
        '&:hover': {
          boxShadow: 3
        }
      }}
    >
      <CardContent>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
          <Avatar
            sx={{
              bgcolor: style.bgColor,
              color: style.color,
              width: 56,
              height: 56,
              mr: 2
            }}
          >
            {achievement?.image ? (
              <Box
                component='img'
                src={achievement.image.id || achievement.image}
                alt='Badge'
                sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              style.icon
            )}
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant='h6' gutterBottom>
              {achievement?.name || credential.name || 'Achievement'}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <VerifiedIcon sx={{ fontSize: 16, color: '#2D6A4F' }} />
              <Typography variant='body2' color='text.secondary'>
                Issued by {issuer?.name || issuer}
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={handleShare}>
            <ShareIcon />
          </IconButton>
        </Box>

        {/* Description */}
        {achievement?.description && (
          <Typography variant='body2' sx={{ mb: 2 }}>
            {achievement.description}
          </Typography>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
            {skills.slice(0, 3).map((skill: any, index: number) => (
              <Chip
                key={index}
                label={typeof skill === 'string' ? skill : skill.value || skill.name}
                size='small'
                sx={{
                  backgroundColor: '#f0f0f0',
                  color: '#333'
                }}
              />
            ))}
            {skills.length > 3 && (
              <Chip
                label={`+${skills.length - 3} more`}
                size='small'
                sx={{
                  backgroundColor: '#f0f0f0',
                  color: '#666'
                }}
              />
            )}
          </Box>
        )}

        {/* Footer */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant='caption' color='text.secondary'>
            {new Date(issuanceDate).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </Typography>
          <Button size='small' endIcon={<OpenInNewIcon />} onClick={handleViewDetails} sx={{ textTransform: 'none' }}>
            View Certificate
          </Button>
        </Box>
      </CardContent>
    </Card>
  )
}
