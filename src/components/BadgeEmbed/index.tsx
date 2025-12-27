import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Box, Typography, Rating } from '@mui/material'
import VerifiedIcon from '@mui/icons-material/Verified'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import * as api from '../../api'

/**
 * BadgeEmbed - Minimal embeddable badge for iframes
 *
 * This component is designed to be embedded via iframe on external websites.
 * It shows a compact testimonial badge with:
 * - Statement excerpt
 * - Star rating (if present)
 * - Validation count
 * - Link to full certificate
 */
const BadgeEmbed: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [claim, setClaim] = useState<any>(null)
  const [validationCount, setValidationCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  // Get theme from query param or default to light
  const urlParams = new URLSearchParams(window.location.search)
  const theme = urlParams.get('theme') || 'light'
  const isDark = theme === 'dark'

  const colors = {
    bg: isDark ? '#1a1a2e' : '#ffffff',
    bgGradient: isDark
      ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
      : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    text: isDark ? '#e0e0e0' : '#ffffff',
    textMuted: isDark ? '#888' : 'rgba(255,255,255,0.8)',
    border: isDark ? '#333' : 'transparent',
    link: isDark ? '#667eea' : '#ffffff'
  }

  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        setError(true)
        setLoading(false)
        return
      }

      try {
        const claimRes = await api.getClaim(id)
        setClaim(claimRes.data.claim)

        // Get validation count
        try {
          const reportRes = await api.getClaimReport(Number(id))
          if (reportRes.data?.validations) {
            setValidationCount(reportRes.data.validations.length)
          }
        } catch (e) {
          // No validations
        }
      } catch (err) {
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id])

  const certificateUrl = `${window.location.origin}/certificate/${id}`

  const truncateStatement = (text: string, maxLength: number = 100) => {
    if (!text) return ''
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength).trim() + '...'
  }

  // Handle click - open certificate in new tab (for iframe context)
  const handleClick = () => {
    window.open(certificateUrl, '_blank', 'noopener,noreferrer')
  }

  if (loading) {
    return (
      <Box
        sx={{
          width: '100%',
          height: '100%',
          minHeight: 160,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: colors.bgGradient,
          borderRadius: 2,
          color: colors.text
        }}
      >
        <Typography>Loading...</Typography>
      </Box>
    )
  }

  if (error || !claim) {
    return (
      <Box
        sx={{
          width: '100%',
          height: '100%',
          minHeight: 160,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: colors.bg,
          borderRadius: 2,
          color: isDark ? '#888' : '#666'
        }}
      >
        <Typography>Badge not found</Typography>
      </Box>
    )
  }

  return (
    <Box
      onClick={handleClick}
      sx={{
        width: '100%',
        height: '100%',
        minHeight: 160,
        background: colors.bgGradient,
        borderRadius: 2,
        p: 2,
        boxSizing: 'border-box',
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
        border: `1px solid ${colors.border}`,
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
        },
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <VerifiedIcon sx={{ fontSize: 18, color: colors.text }} />
        <Typography
          sx={{
            fontSize: 12,
            fontWeight: 600,
            color: colors.textMuted,
            textTransform: 'uppercase',
            letterSpacing: 0.5
          }}
        >
          Verified Testimonial
        </Typography>
        {validationCount > 0 && (
          <Box
            sx={{
              ml: 'auto',
              backgroundColor: 'rgba(255,255,255,0.2)',
              px: 1,
              py: 0.25,
              borderRadius: 1,
              fontSize: 11,
              color: colors.text
            }}
          >
            {validationCount} endorsement{validationCount > 1 ? 's' : ''}
          </Box>
        )}
      </Box>

      {/* Statement */}
      <Typography
        sx={{
          fontSize: 14,
          fontWeight: 500,
          color: colors.text,
          lineHeight: 1.4,
          flex: 1,
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical'
        }}
      >
        "{truncateStatement(claim.statement, 120)}"
      </Typography>

      {/* Footer */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1.5 }}>
        {/* Star rating if present */}
        {claim.stars && (
          <Rating
            value={claim.stars}
            readOnly
            size='small'
            sx={{
              '& .MuiRating-iconFilled': {
                color: '#ffc107'
              },
              '& .MuiRating-iconEmpty': {
                color: 'rgba(255,255,255,0.3)'
              }
            }}
          />
        )}

        {!claim.stars && <Box />}

        {/* View link */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            fontSize: 12,
            color: colors.textMuted,
            '&:hover': { color: colors.text }
          }}
        >
          <Typography sx={{ fontSize: 12 }}>View on LinkedTrust</Typography>
          <OpenInNewIcon sx={{ fontSize: 14 }} />
        </Box>
      </Box>
    </Box>
  )
}

export default BadgeEmbed
